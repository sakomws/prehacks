"""
Image optimization and CDN integration service
"""

import os
import uuid
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
from PIL import Image, ImageOps
import io
import hashlib
import logging
from decouple import config
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)

# Configuration
MAX_IMAGE_SIZE = config('MAX_IMAGE_SIZE', default=10 * 1024 * 1024, cast=int)  # 10MB
UPLOAD_DIR = Path(config('UPLOAD_DIR', default='uploads'))
CDN_BASE_URL = config('CDN_BASE_URL', default='')
ENABLE_IMAGE_OPTIMIZATION = config('ENABLE_IMAGE_OPTIMIZATION', default=True, cast=bool)

# Image size presets
IMAGE_SIZES = {
    'thumbnail': (150, 150),
    'small': (300, 300),
    'medium': (600, 600),
    'large': (1200, 1200),
    'original': None  # Keep original size
}

# Supported image formats
SUPPORTED_FORMATS = {
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WEBP',
    'image/gif': 'GIF'
}

class ImageOptimizer:
    """Image optimization service with multiple size generation and CDN integration"""
    
    def __init__(self):
        self.upload_dir = UPLOAD_DIR
        self.cdn_base_url = CDN_BASE_URL
        self.enable_optimization = ENABLE_IMAGE_OPTIMIZATION
        
        # Ensure upload directories exist
        for category in ['avatars', 'calendar-covers', 'event-covers']:
            (self.upload_dir / category).mkdir(parents=True, exist_ok=True)
    
    def validate_image(self, file: UploadFile) -> bool:
        """Validate uploaded image file"""
        # Check file type
        if file.content_type not in SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image format. Supported formats: {', '.join(SUPPORTED_FORMATS.keys())}"
            )
        
        # Check file size
        if file.size and file.size > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Image too large. Maximum size: {MAX_IMAGE_SIZE // (1024*1024)}MB"
            )
        
        return True
    
    def generate_filename(self, original_filename: str, prefix: str = "") -> str:
        """Generate unique filename for uploaded image"""
        # Get file extension
        if original_filename:
            extension = Path(original_filename).suffix.lower()
        else:
            extension = '.jpg'
        
        # Generate unique filename
        unique_id = uuid.uuid4().hex
        if prefix:
            return f"{prefix}_{unique_id}{extension}"
        return f"{unique_id}{extension}"
    
    def optimize_image(
        self, 
        image: Image.Image, 
        size: Optional[Tuple[int, int]] = None,
        quality: int = 85,
        format: str = 'JPEG'
    ) -> bytes:
        """Optimize image with resizing and compression"""
        # Convert RGBA to RGB for JPEG
        if format == 'JPEG' and image.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Resize if size specified
        if size:
            # Use thumbnail to maintain aspect ratio
            image.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Auto-orient based on EXIF data
        image = ImageOps.exif_transpose(image)
        
        # Save optimized image to bytes
        output = io.BytesIO()
        
        if format == 'JPEG':
            image.save(output, format=format, quality=quality, optimize=True)
        elif format == 'PNG':
            image.save(output, format=format, optimize=True)
        elif format == 'WEBP':
            image.save(output, format=format, quality=quality, optimize=True)
        else:
            image.save(output, format=format)
        
        return output.getvalue()
    
    def process_image(
        self, 
        file: UploadFile, 
        category: str,
        sizes: Optional[Dict[str, Tuple[int, int]]] = None,
        prefix: str = ""
    ) -> Dict[str, str]:
        """
        Process uploaded image with optimization and multiple size generation
        
        Args:
            file: Uploaded file
            category: Image category (avatars, calendar-covers, event-covers)
            sizes: Custom size dictionary, defaults to IMAGE_SIZES
            prefix: Filename prefix
            
        Returns:
            Dictionary with size names as keys and URLs as values
        """
        self.validate_image(file)
        
        if sizes is None:
            sizes = IMAGE_SIZES.copy()
        
        try:
            # Read and open image
            file_content = file.file.read()
            file.file.seek(0)  # Reset file pointer
            
            original_image = Image.open(io.BytesIO(file_content))
            
            # Determine output format
            output_format = SUPPORTED_FORMATS.get(file.content_type, 'JPEG')
            
            # Generate base filename
            base_filename = self.generate_filename(file.filename, prefix)
            name_without_ext = Path(base_filename).stem
            
            # Create category directory
            category_dir = self.upload_dir / category
            category_dir.mkdir(parents=True, exist_ok=True)
            
            results = {}
            
            # Process each size
            for size_name, dimensions in sizes.items():
                if size_name == 'original' and not self.enable_optimization:
                    # Save original without processing
                    file_path = category_dir / base_filename
                    with open(file_path, 'wb') as f:
                        f.write(file_content)
                    url = self._get_url(category, base_filename)
                else:
                    # Generate optimized version
                    if dimensions:
                        optimized_data = self.optimize_image(
                            original_image.copy(), 
                            dimensions, 
                            format=output_format
                        )
                        filename = f"{name_without_ext}_{size_name}.{output_format.lower()}"
                    else:
                        # Original size but optimized
                        optimized_data = self.optimize_image(
                            original_image.copy(), 
                            format=output_format
                        )
                        filename = base_filename
                    
                    # Save optimized image
                    file_path = category_dir / filename
                    with open(file_path, 'wb') as f:
                        f.write(optimized_data)
                    
                    url = self._get_url(category, filename)
                
                results[size_name] = url
            
            return results
            
        except Exception as e:
            logger.error(f"Image processing error: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process image: {str(e)}"
            )
    
    def _get_url(self, category: str, filename: str) -> str:
        """Generate URL for uploaded image"""
        if self.cdn_base_url:
            return f"{self.cdn_base_url}/{category}/{filename}"
        else:
            return f"/uploads/{category}/{filename}"
    
    def delete_image(self, category: str, filename: str) -> bool:
        """Delete image file"""
        try:
            file_path = self.upload_dir / category / filename
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            logger.error(f"Image deletion error: {e}")
            return False
    
    def delete_image_set(self, category: str, base_filename: str) -> int:
        """Delete all sizes of an image set"""
        try:
            name_without_ext = Path(base_filename).stem
            category_dir = self.upload_dir / category
            
            deleted_count = 0
            
            # Delete all files that match the pattern
            for file_path in category_dir.glob(f"{name_without_ext}*"):
                try:
                    file_path.unlink()
                    deleted_count += 1
                except Exception as e:
                    logger.error(f"Failed to delete {file_path}: {e}")
            
            return deleted_count
        except Exception as e:
            logger.error(f"Image set deletion error: {e}")
            return 0
    
    def get_image_info(self, file_path: Path) -> Dict[str, Any]:
        """Get image information"""
        try:
            with Image.open(file_path) as img:
                return {
                    'width': img.width,
                    'height': img.height,
                    'format': img.format,
                    'mode': img.mode,
                    'size_bytes': file_path.stat().st_size
                }
        except Exception as e:
            logger.error(f"Failed to get image info: {e}")
            return {}
    
    def generate_responsive_urls(self, base_url: str) -> Dict[str, str]:
        """Generate responsive image URLs for different screen sizes"""
        if not base_url:
            return {}
        
        # Extract base parts
        parts = base_url.split('/')
        if len(parts) < 2:
            return {'original': base_url}
        
        category = parts[-2]
        filename = parts[-1]
        name_without_ext = Path(filename).stem
        ext = Path(filename).suffix
        
        responsive_urls = {}
        
        for size_name in IMAGE_SIZES.keys():
            if size_name == 'original':
                responsive_urls[size_name] = base_url
            else:
                responsive_filename = f"{name_without_ext}_{size_name}{ext}"
                responsive_urls[size_name] = self._get_url(category, responsive_filename)
        
        return responsive_urls


# Global image optimizer instance
image_optimizer = ImageOptimizer()


def process_avatar_image(file: UploadFile, user_id: str) -> Dict[str, str]:
    """Process avatar image with standard sizes"""
    avatar_sizes = {
        'thumbnail': (64, 64),
        'small': (128, 128),
        'medium': (256, 256),
        'large': (512, 512)
    }
    
    return image_optimizer.process_image(
        file, 
        'avatars', 
        avatar_sizes, 
        prefix=str(user_id)
    )


def process_calendar_cover(file: UploadFile, calendar_id: str) -> Dict[str, str]:
    """Process calendar cover image with standard sizes"""
    cover_sizes = {
        'thumbnail': (300, 200),
        'small': (600, 400),
        'medium': (1200, 800),
        'large': (1920, 1280)
    }
    
    return image_optimizer.process_image(
        file, 
        'calendar-covers', 
        cover_sizes, 
        prefix=str(calendar_id)
    )


def process_event_cover(file: UploadFile, event_id: str) -> Dict[str, str]:
    """Process event cover image with standard sizes"""
    cover_sizes = {
        'thumbnail': (300, 200),
        'small': (600, 400),
        'medium': (1200, 800),
        'large': (1920, 1280)
    }
    
    return image_optimizer.process_image(
        file, 
        'event-covers', 
        cover_sizes, 
        prefix=str(event_id)
    )


def get_optimized_image_url(original_url: str, size: str = 'medium') -> str:
    """Get optimized image URL for specific size"""
    if not original_url or size not in IMAGE_SIZES:
        return original_url
    
    if size == 'original':
        return original_url
    
    # Parse URL to generate size-specific URL
    parts = original_url.split('/')
    if len(parts) < 2:
        return original_url
    
    filename = parts[-1]
    name_without_ext = Path(filename).stem
    ext = Path(filename).suffix
    
    # Generate size-specific filename
    size_filename = f"{name_without_ext}_{size}{ext}"
    
    # Replace filename in URL
    parts[-1] = size_filename
    return '/'.join(parts)


# CDN integration utilities
class CDNIntegration:
    """CDN integration utilities for image delivery"""
    
    @staticmethod
    def generate_srcset(base_url: str) -> str:
        """Generate srcset attribute for responsive images"""
        if not base_url:
            return ""
        
        responsive_urls = image_optimizer.generate_responsive_urls(base_url)
        
        srcset_parts = []
        size_widths = {
            'thumbnail': '150w',
            'small': '300w',
            'medium': '600w',
            'large': '1200w'
        }
        
        for size_name, width in size_widths.items():
            if size_name in responsive_urls:
                srcset_parts.append(f"{responsive_urls[size_name]} {width}")
        
        return ', '.join(srcset_parts)
    
    @staticmethod
    def generate_picture_element(base_url: str, alt_text: str = "") -> str:
        """Generate HTML picture element with responsive sources"""
        if not base_url:
            return f'<img src="" alt="{alt_text}">'
        
        responsive_urls = image_optimizer.generate_responsive_urls(base_url)
        
        sources = []
        
        # WebP sources (if available)
        for size_name in ['large', 'medium', 'small']:
            if size_name in responsive_urls:
                webp_url = responsive_urls[size_name].replace('.jpg', '.webp').replace('.png', '.webp')
                sources.append(f'<source media="(min-width: {IMAGE_SIZES[size_name][0]}px)" srcset="{webp_url}" type="image/webp">')
        
        # Fallback img tag
        img_tag = f'<img src="{responsive_urls.get("medium", base_url)}" alt="{alt_text}" loading="lazy">'
        
        if sources:
            return f'<picture>{"".join(sources)}{img_tag}</picture>'
        else:
            return img_tag