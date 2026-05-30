"""
Instagram Reel transcript and metadata extraction using yt-dlp + Whisper
"""
import logging
import os
import re
import tempfile
from typing import Optional

logger = logging.getLogger(__name__)


def extract_instagram_shortcode(url: str) -> Optional[str]:
    """Extract Instagram reel shortcode from URL."""
    patterns = [
        r"instagram\.com\/reels?\/([A-Za-z0-9_-]+)",
        r"instagram\.com\/p\/([A-Za-z0-9_-]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def _get_rapidapi_metadata(url: str) -> dict:
    """Fetch metadata from RapidAPI Instagram scraper if key is present."""
    rapidapi_key = os.environ.get("RAPIDAPI_KEY")
    rapidapi_host = os.environ.get("RAPIDAPI_HOST", "instagram-scraper-api2.p.rapidapi.com")
    
    if not rapidapi_key:
        return {}
        
    try:
        import httpx
        shortcode = extract_instagram_shortcode(url)
        if not shortcode:
            return {}
            
        headers = {
            "x-rapidapi-key": rapidapi_key,
            "x-rapidapi-host": rapidapi_host
        }
        
        # instagram-scraper-stable-api endpoint
        api_url = f"https://{rapidapi_host}/get_media_data.php"
        params = {
            "reel_post_code_or_url": shortcode,
            "type": "post"
        }
        
        response = httpx.get(api_url, headers=headers, params=params, timeout=10.0)
        if response.status_code == 200:
            data = response.json()
            user_data = data.get("owner", {})
            
            # Extract metrics
            views = data.get("video_view_count") or data.get("play_count") or data.get("view_count")
            likes = data.get("edge_media_preview_like", {}).get("count") or data.get("like_count")
            comments = data.get("edge_media_to_comment", {}).get("count") or data.get("comment_count")
            followers = user_data.get("edge_followed_by", {}).get("count") or user_data.get("follower_count")
            
            return {
                "views": views,
                "likes": likes,
                "comments": comments,
                "follower_count": followers,
            }
    except Exception as e:
        logger.warning(f"RapidAPI metadata fetch failed: {e}")
    return {}


def get_instagram_metadata(url: str) -> dict:
    """Extract Instagram reel metadata using yt-dlp and merge with RapidAPI."""
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
            description = info.get("description", "") or ""
            hashtags = re.findall(r"#\w+", description)[:10]

            yt_data = {
                "title": info.get("title", "Instagram Reel"),
                "creator_name": info.get("uploader", info.get("channel", "Unknown Creator")),
                "follower_count": info.get("channel_follower_count"),
                "views": info.get("view_count"),
                "likes": info.get("like_count"),
                "comments": info.get("comment_count"),
                "upload_date": info.get("upload_date"),
                "duration_seconds": info.get("duration"),
                "hashtags": hashtags,
            }
            
            # Merge with RapidAPI data (prefer valid/non-null values from RapidAPI)
            rapid_data = _get_rapidapi_metadata(url)
            for key, val in rapid_data.items():
                if val is not None and str(val).strip() != "":
                    yt_data[key] = val
                    
            return yt_data
    except Exception as e:
        logger.error(f"Failed to extract Instagram metadata: {e}")
        raise RuntimeError(f"Could not extract Instagram metadata. The reel may be private or unavailable. Error: {e}")


def get_instagram_transcript(url: str) -> Optional[str]:
    """
    Download Instagram reel audio with yt-dlp and transcribe using Whisper.
    """
    shortcode = extract_instagram_shortcode(url)
    if not shortcode:
        raise ValueError(f"Could not extract shortcode from Instagram URL: {url}")

    try:
        import whisper
        import yt_dlp

        with tempfile.TemporaryDirectory() as tmpdir:
            audio_path = os.path.join(tmpdir, f"{shortcode}.mp3")

            ydl_opts = {
                "format": "bestaudio/best",
                "outtmpl": os.path.join(tmpdir, f"{shortcode}"),
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

            # Find downloaded audio file
            audio_file = None
            for f in os.listdir(tmpdir):
                if f.endswith(".mp3"):
                    audio_file = os.path.join(tmpdir, f)
                    break

            if not audio_file or not os.path.exists(audio_file):
                logger.warning(f"No audio file found for Instagram reel {shortcode}")
                return None

            logger.info(f"Transcribing Instagram reel {shortcode} with Whisper...")
            model = whisper.load_model("base")
            result = model.transcribe(audio_file)
            transcript = result["text"]
            logger.info(f"Whisper transcribed Instagram {shortcode}, length: {len(transcript)}")
            return transcript.strip()

    except Exception as e:
        logger.error(f"Failed to transcribe Instagram reel {shortcode}: {e}")
        return None
