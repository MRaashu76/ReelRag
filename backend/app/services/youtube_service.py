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


def parse_youtube_duration(duration_str: str) -> int:
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
    if not match: return 0
    h, m, s = match.groups()
    total = 0
    if h: total += int(h) * 3600
    if m: total += int(m) * 60
    if s: total += int(s)
    return total

def get_youtube_metadata(url: str) -> dict:
    """Extract YouTube video metadata using Official API or yt-dlp."""
    api_key = os.environ.get("YOUTUBE_API_KEY")
    video_id = extract_youtube_video_id(url)
    
    if api_key and video_id:
        try:
            import httpx
            api_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id={video_id}&key={api_key}"
            response = httpx.get(api_url, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                if data.get("items"):
                    item = data["items"][0]
                    snippet = item.get("snippet", {})
                    stats = item.get("statistics", {})
                    content_details = item.get("contentDetails", {})
                    
                    duration_str = content_details.get("duration", "")
                    duration_seconds = parse_youtube_duration(duration_str)
                    
                    logger.info(f"Successfully fetched metadata via YouTube API for {video_id}")
                    return {
                        "title": snippet.get("title", "Unknown Title"),
                        "creator_name": snippet.get("channelTitle", "Unknown Creator"),
                        "follower_count": None, # Requires separate channel API call
                        "views": int(stats.get("viewCount", 0)) if stats.get("viewCount") else None,
                        "likes": int(stats.get("likeCount", 0)) if stats.get("likeCount") else None,
                        "comments": int(stats.get("commentCount", 0)) if stats.get("commentCount") else None,
                        "upload_date": snippet.get("publishedAt", "")[:10] if snippet.get("publishedAt") else None,
                        "duration_seconds": duration_seconds,
                        "hashtags": snippet.get("tags", [])[:10] if snippet.get("tags") else [],
                    }
        except Exception as e:
            logger.error(f"YouTube Data API failed: {e}")

    # Fallback to yt-dlp
    import yt_dlp
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "socket_timeout": 15,
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
                "socket_timeout": 15,
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

            logger.info(f"Transcribing YouTube {video_id} with Groq Whisper API...")
            import httpx
            import os
            
            groq_api_key = os.environ.get("GROQ_API_KEY")
            if not groq_api_key:
                logger.error("GROQ_API_KEY not found, cannot transcribe.")
                return None

            headers = {
                "Authorization": f"Bearer {groq_api_key}"
            }
            
            with open(audio_path, "rb") as f:
                files = {
                    "file": (os.path.basename(audio_path), f, "audio/mpeg")
                }
                data = {
                    "model": "whisper-large-v3",
                    "response_format": "json",
                }
                response = httpx.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    headers=headers,
                    data=data,
                    files=files,
                    timeout=30.0
                )
                
            if response.status_code == 200:
                transcript = response.json().get("text", "")
                logger.info(f"Groq transcribed YouTube {video_id}, length: {len(transcript)}")
                return transcript.strip()
            else:
                logger.error(f"Groq API error: {response.text}")
                return None

    except Exception as e:
        logger.error(f"Whisper fallback failed for YouTube {video_id}: {e}")
        return None
