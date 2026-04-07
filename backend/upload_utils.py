"""
Avatar upload utilities
Handles file validation, storage, and serving
"""

import os
import uuid
from fastapi import UploadFile, HTTPException
from typing import Optional

# Configuration
UPLOAD_DIR = "uploads/avatars"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/gif', 'image/webp'
}

def detect_image_type(data: bytes) -> Optional[str]:
    """
    Detect image type from file header bytes.
    Replaces deprecated imghdr module (removed in Python 3.13).
    """
    if data[:8] == b'\x89PNG\r\n\x1a\n':
        return 'png'
    elif data[:3] == b'\xff\xd8\xff':
        return 'jpeg'
    elif data[:6] in (b'GIF87a', b'GIF89a'):
        return 'gif'
    elif data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return 'webp'
    return None

def validate_image_file(file: UploadFile) -> None:
    """
    Validate uploaded image file
    Raises HTTPException if validation fails
    """
    # Check content type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file extension
    filename = file.filename or ""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

def generate_unique_filename(user_id: int, original_filename: str) -> str:
    """Generate a unique filename for the uploaded avatar"""
    ext = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else 'jpg'
    unique_id = uuid.uuid4().hex[:8]
    return f"{user_id}_{unique_id}.{ext}"

async def save_avatar(file: UploadFile, user_id: int) -> str:
    """
    Save uploaded avatar file
    Returns the file path relative to the uploads directory
    """
    # Validate file
    validate_image_file(file)
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Verify it's actually an image using header bytes
    image_type = detect_image_type(content)
    if image_type not in ['jpeg', 'png', 'gif', 'webp']:
        raise HTTPException(
            status_code=400,
            detail="File is not a valid image"
        )
    
    # Generate unique filename
    filename = generate_unique_filename(user_id, file.filename or "avatar.jpg")
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Return URL path (relative to server root)
    return f"/uploads/avatars/{filename}"

def delete_avatar(file_path: str) -> None:
    """Delete an avatar file"""
    if file_path and file_path.startswith('/uploads/avatars/'):
        full_path = file_path.lstrip('/')
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except Exception as e:
                print(f"Error deleting avatar: {e}")
