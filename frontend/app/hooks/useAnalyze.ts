"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { analyzeVideos, getAnalysisStatus, AnalysisStatus } from "../services/api";

interface UseAnalyzeReturn {
  analyze: (videoAUrl: string, videoBUrl: string) => Promise<void>;
  status: AnalysisStatus | null;
  isAnalyzing: boolean;
  error: string | null;
  reset: () => void;
}

export function useAnalyze(): UseAnalyzeReturn {
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const s = await getAnalysisStatus();
        setStatus(s);
        if (s.status === "completed") {
          setIsAnalyzing(false);
          stopPolling();
          queryClient.invalidateQueries({ queryKey: ["videos"] });
        } else if (s.status === "error") {
          setIsAnalyzing(false);
          setError(s.error || "Analysis failed");
          stopPolling();
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, 2000);
  }, [stopPolling, queryClient]);

  const analyze = useCallback(
    async (videoAUrl: string, videoBUrl: string) => {
      setError(null);
      setIsAnalyzing(true);
      setStatus({ status: "processing", progress: "Starting...", error: "" });

      try {
        await analyzeVideos({ video_a_url: videoAUrl, video_b_url: videoBUrl });
        startPolling();
      } catch (e: any) {
        setError(e.message || "Failed to start analysis");
        setIsAnalyzing(false);
      }
    },
    [startPolling]
  );

  const reset = useCallback(() => {
    stopPolling();
    setStatus(null);
    setIsAnalyzing(false);
    setError(null);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return { analyze, status, isAnalyzing, error, reset };
}
