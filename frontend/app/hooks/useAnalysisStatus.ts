"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalysisStatus, AnalysisStatus } from "../services/api";

/**
 * Polls /api/analyze/status every 2s while processing.
 * Stops polling once status is "completed" or "error".
 */
export function useAnalysisStatus(enabled: boolean = true) {
  return useQuery<AnalysisStatus>({
    queryKey: ["analysis-status"],
    queryFn: getAnalysisStatus,
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "processing") return 2000;
      return false;
    },
    staleTime: 0,
  });
}
