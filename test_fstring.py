video_follower_count = None
try:
    s = f"Follower Count: {f'{video_follower_count:,} followers' if video_follower_count is not None else 'N/A'}"
    print("Success:", s)
except Exception as e:
    print("Error:", type(e).__name__, e)
