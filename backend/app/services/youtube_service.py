"""
YouTube transcript extraction with fallback to yt-dlp + Whisper
"""
import logging
import re
import subprocess
import tempfile
import os
from typing import Optional

logger = logging.getLogger(__name__)


def extract_youtube_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from URL."""
    patterns = [
        r"(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})",
        r"youtube\.com\/embed\/([a-zA-Z0-9_-]{11})",
        r"youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_youtube_transcript(url: str) -> Optional[str]:
    """
    Extract transcript from YouTube video.
    Primary: youtube-transcript-api
    Fallback: yt-dlp + Whisper
    """
    video_id = extract_youtube_video_id(url)
    if not video_id:
        raise ValueError(f"Could not extract video ID from URL: {url}")

    # Primary: youtube-transcript-api
    try:
        from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "en-US", "en-GB"])
        transcript = " ".join([entry["text"] for entry in transcript_list])
        logger.info(f"Extracted YouTube transcript via API for {video_id}, length: {len(transcript)}")
        return transcript.strip()
    except Exception as e:
        logger.warning(f"youtube-transcript-api failed for {video_id}: {e}. Trying yt-dlp fallback.")

    # Fallback: yt-dlp + Whisper
    return _whisper_fallback(url, video_id)


def get_youtube_metadata(url: str) -> dict:
    """Extract YouTube video metadata using yt-dlp."""
    import yt_dlp

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            hashtags = []
            if info.get("tags"):
                hashtags = [f"#{tag}" for tag in info["tags"][:10]]

            return {
                "title": info.get("title", "Unknown Title"),
                "creator_name": info.get("uploader", "Unknown Creator"),
                "follower_count": info.get("channel_follower_count"),
                "views": info.get("view_count"),
                "likes": info.get("like_count"),
                "comments": info.get("comment_count"),
                "upload_date": info.get("upload_date"),
                "duration_seconds": info.get("duration"),
                "hashtags": hashtags,
            }
    except Exception as e:
        logger.error(f"Failed to extract YouTube metadata: {e}")
        # Return fallback metadata to prevent pipeline crash when YouTube blocks scraping
        return {
            "title": "YouTube Video (Metadata Restricted)",
            "creator_name": "Unknown Creator",
            "follower_count": None,
            "views": None,
            "likes": None,
            "comments": None,
            "upload_date": None,
            "duration_seconds": None,
            "hashtags": [],
        }


def _whisper_fallback(url: str, video_id: str) -> Optional[str]:
    """Download audio with yt-dlp and transcribe with Whisper."""
    try:
        import whisper
        import yt_dlp

        with tempfile.TemporaryDirectory() as tmpdir:
            audio_path = os.path.join(tmpdir, f"{video_id}.mp3")

            ydl_opts = {
                "format": "bestaudio/best",
                "outtmpl": audio_path,
                "quiet": True,
                "postprocessors": [
                    {
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": "mp3",
                        "preferredquality": "128",
                    }
                ],
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])

            if not os.path.exists(audio_path):
                # yt-dlp may add extension
                audio_path = audio_path + ".mp3"

            model = whisper.load_model("base")
            result = model.transcribe(audio_path)
            transcript = result["text"]
            logger.info(f"Whisper transcribed YouTube {video_id}, length: {len(transcript)}")
            return transcript.strip()

    except Exception as e:
        logger.error(f"Whisper fallback failed for YouTube {video_id}: {e}")
        return None
