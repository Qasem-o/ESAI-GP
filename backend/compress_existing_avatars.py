"""
compress_existing_avatars.py
────────────────────────────
One-off script to compress all existing Base64 avatars stored in the DB.
Run once on the server or locally against the production DB:

    python compress_existing_avatars.py

Reduces each avatar from ~300KB-1MB Base64 → ~10-15KB.
"""

import os
import sys
import base64
import io

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    print("❌  DATABASE_URL not set in environment. Aborting.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

try:
    from PIL import Image
except ImportError:
    print("❌  Pillow not installed. Run: pip install Pillow>=10.0")
    sys.exit(1)


def compress_avatar(data_url: str) -> str | None:
    """
    Compress a data-URL Base64 avatar to 150x150 JPEG quality=75.
    Returns new data-URL or None if unchanged / failed.
    """
    if not data_url or not data_url.startswith("data:image/"):
        return None  # Not a base64 avatar, skip

    try:
        # Parse header and data
        header, encoded = data_url.split(",", 1)
        raw_bytes = base64.b64decode(encoded)

        original_kb = len(raw_bytes) / 1024

        img = Image.open(io.BytesIO(raw_bytes))
        if img.mode not in ("RGB",):
            img = img.convert("RGB")

        # Resize to max 150x150
        img.thumbnail((150, 150), Image.LANCZOS)

        # Crop to square if needed
        w, h = img.size
        if w != h:
            side = min(w, h)
            left = (w - side) // 2
            top  = (h - side) // 2
            img = img.crop((left, top, left + side, top + side))

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=75, optimize=True)
        compressed = buf.getvalue()

        compressed_kb = len(compressed) / 1024

        if compressed_kb >= original_kb * 0.95:
            # Already small, skip
            return None

        new_b64 = base64.b64encode(compressed).decode("utf-8")
        return f"data:image/jpeg;base64,{new_b64}"

    except Exception as e:
        print(f"    ⚠  Error compressing avatar: {e}")
        return None


users = db.query(User).filter(User.profile_picture_url.isnot(None)).all()
print(f"Found {len(users)} users with profile pictures.\n")

updated = 0
skipped = 0
errors  = 0

for user in users:
    url = user.profile_picture_url or ""

    if not url.startswith("data:image/"):
        # External URL (Google, Telegram CDN) – skip, no egress cost
        skipped += 1
        continue

    original_size_kb = len(url.encode()) / 1024
    result = compress_avatar(url)

    if result is None:
        skipped += 1
        print(f"  ⏭  user_id={user.user_id:5d}  already small or external — skip")
        continue

    new_size_kb = len(result.encode()) / 1024
    saving_pct  = (1 - new_size_kb / original_size_kb) * 100

    user.profile_picture_url = result
    updated += 1
    print(f"  ✅  user_id={user.user_id:5d}  {original_size_kb:7.1f}KB → {new_size_kb:5.1f}KB  (saved {saving_pct:.0f}%)")

try:
    db.commit()
    print(f"\n✅  Done! Updated={updated}, Skipped={skipped}, Errors={errors}")
except Exception as e:
    db.rollback()
    print(f"\n❌  DB commit failed: {e}")
finally:
    db.close()
