"""
Unit tests for RAG Video Comparison Platform
Run with: pytest tests/ -v
"""
import pytest
from unittest.mock import MagicMock, patch


# ── Schema tests ───────────────────────────────────────────────────────────────

class TestVideoMetadata:
    def test_engagement_rate_calculation(self):
        from app.models.schemas import VideoMetadata
        video = VideoMetadata(
            video_id="A",
            title="Test Video",
            creator_name="Creator",
            views=10000,
            likes=500,
            comments=72,
            source="youtube",
            url="https://youtube.com/watch?v=test",
        )
        rate = video.calculate_engagement_rate()
        assert rate == pytest.approx(5.72, rel=1e-2)

    def test_engagement_rate_none_when_no_views(self):
        from app.models.schemas import VideoMetadata
        video = VideoMetadata(
            video_id="A",
            title="Test",
            creator_name="Creator",
            views=0,
            likes=100,
            comments=10,
            source="youtube",
            url="https://youtube.com/watch?v=test",
        )
        assert video.calculate_engagement_rate() is None

    def test_engagement_rate_none_when_missing_data(self):
        from app.models.schemas import VideoMetadata
        video = VideoMetadata(
            video_id="A",
            title="Test",
            creator_name="Creator",
            source="youtube",
            url="https://youtube.com/watch?v=test",
        )
        assert video.calculate_engagement_rate() is None


class TestAnalyzeRequest:
    def test_valid_youtube_url(self):
        from app.models.schemas import AnalyzeRequest
        req = AnalyzeRequest(
            youtube_url="https://youtube.com/watch?v=abc123",
            instagram_url="https://instagram.com/reel/xyz456",
        )
        assert req.youtube_url == "https://youtube.com/watch?v=abc123"

    def test_invalid_youtube_url_raises(self):
        from app.models.schemas import AnalyzeRequest
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            AnalyzeRequest(
                youtube_url="https://vimeo.com/12345",
                instagram_url="https://instagram.com/reel/xyz456",
            )

    def test_invalid_instagram_url_raises(self):
        from app.models.schemas import AnalyzeRequest
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            AnalyzeRequest(
                youtube_url="https://youtube.com/watch?v=abc123",
                instagram_url="https://tiktok.com/@creator/video/123",
            )


# ── YouTube service tests ──────────────────────────────────────────────────────

class TestYoutubeService:
    def test_extract_video_id_standard(self):
        from app.services.youtube_service import extract_youtube_video_id
        vid_id = extract_youtube_video_id("https://youtube.com/watch?v=dQw4w9WgXcQ")
        assert vid_id == "dQw4w9WgXcQ"

    def test_extract_video_id_short_url(self):
        from app.services.youtube_service import extract_youtube_video_id
        vid_id = extract_youtube_video_id("https://youtu.be/dQw4w9WgXcQ")
        assert vid_id == "dQw4w9WgXcQ"

    def test_extract_video_id_shorts(self):
        from app.services.youtube_service import extract_youtube_video_id
        vid_id = extract_youtube_video_id("https://youtube.com/shorts/dQw4w9WgXcQ")
        assert vid_id == "dQw4w9WgXcQ"

    def test_extract_video_id_invalid(self):
        from app.services.youtube_service import extract_youtube_video_id
        vid_id = extract_youtube_video_id("https://vimeo.com/12345")
        assert vid_id is None


# ── Instagram service tests ────────────────────────────────────────────────────

class TestInstagramService:
    def test_extract_shortcode_reel(self):
        from app.services.instagram_service import extract_instagram_shortcode
        code = extract_instagram_shortcode("https://instagram.com/reel/ABC123def/")
        assert code == "ABC123def"

    def test_extract_shortcode_post(self):
        from app.services.instagram_service import extract_instagram_shortcode
        code = extract_instagram_shortcode("https://instagram.com/p/ABC123def/")
        assert code == "ABC123def"

    def test_extract_shortcode_invalid(self):
        from app.services.instagram_service import extract_instagram_shortcode
        code = extract_instagram_shortcode("https://tiktok.com/@creator")
        assert code is None


# ── Metadata store tests ───────────────────────────────────────────────────────

class TestMetadataStore:
    def test_save_and_retrieve(self, tmp_path):
        from app.services.metadata_store import MetadataStore
        from app.models.schemas import VideoMetadata

        store = MetadataStore(filepath=str(tmp_path / "test_store.json"))
        video = VideoMetadata(
            video_id="A",
            title="Test Video",
            creator_name="Test Creator",
            views=1000,
            likes=50,
            comments=10,
            engagement_rate=6.0,
            source="youtube",
            url="https://youtube.com/watch?v=test",
        )
        store.save_video(video)
        retrieved = store.get_video("A")

        assert retrieved is not None
        assert retrieved.title == "Test Video"
        assert retrieved.engagement_rate == 6.0

    def test_get_nonexistent_returns_none(self, tmp_path):
        from app.services.metadata_store import MetadataStore
        store = MetadataStore(filepath=str(tmp_path / "test_store.json"))
        assert store.get_video("Z") is None

    def test_has_videos_false_when_empty(self, tmp_path):
        from app.services.metadata_store import MetadataStore
        store = MetadataStore(filepath=str(tmp_path / "test_store.json"))
        assert store.has_videos() is False

    def test_has_videos_true_after_save(self, tmp_path):
        from app.services.metadata_store import MetadataStore
        from app.models.schemas import VideoMetadata
        store = MetadataStore(filepath=str(tmp_path / "test_store.json"))
        video = VideoMetadata(
            video_id="A",
            title="T",
            creator_name="C",
            source="youtube",
            url="https://youtube.com/watch?v=t",
        )
        store.save_video(video)
        assert store.has_videos() is True


# ── FastAPI endpoint tests ─────────────────────────────────────────────────────

@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    from app.main import app
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    def test_health_returns_ok(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestVideosEndpoint:
    def test_get_videos_returns_list(self, client):
        response = client.get("/api/videos")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestAnalyzeEndpoint:
    def test_analyze_invalid_youtube_url(self, client):
        response = client.post(
            "/api/analyze",
            json={
                "youtube_url": "https://vimeo.com/12345",
                "instagram_url": "https://instagram.com/reel/abc",
            },
        )
        assert response.status_code == 422

    def test_analyze_invalid_instagram_url(self, client):
        response = client.post(
            "/api/analyze",
            json={
                "youtube_url": "https://youtube.com/watch?v=abc",
                "instagram_url": "https://tiktok.com/@creator",
            },
        )
        assert response.status_code == 422
