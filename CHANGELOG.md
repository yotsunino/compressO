# Changelog

### 3.0.0

Features:

- **Image Compression Support**: Comprehensive image compression for JPEG, PNG, WebP, and GIF formats with quality controls and optimization options.
- **Image Transformations**: Full transformation support for images including crop, rotate, flip, and dimension adjustments.
- **SVG Conversion**: Convert SVG files to PNG, JPEG, or WebP formats with advanced settings for raster to SVG conversion.
- **Video to GIF Conversion**: Convert videos to animated GIFs with customizable quality and FPS settings.
- **GIF Compression**: Compress animated GIFs while maintaining quality and reducing file size.
- **Cross-Container Image Conversion**: Convert between different image formats (JPEG, PNG, WebP, GIF) seamlessly.
- **Output Comparison Slider**: Compare original and compressed images/videos with an interactive before/after slider.
- **In-App Updater**: Built-in updater to notify and download new releases automatically within the application.
- **Video Speed Control**: Adjust video playback speed for faster preview and review.
- **Image Metadata Preservation**: Preserve EXIF and other metadata when compressing images.
- **Full Image Information View**: View detailed information about image files including dimensions, format, EXIF metadata, etc.

Enhancements:

- **Linux Video Playback**: Implemented local axum server to serve video assets on Linux, enabling video playback that was previously unsupported on WebGTK.
- **Improved Compression Settings**: Enhanced compression settings UI with better compression.
- **Better Output Stats Display**: Improved the display of compression statistics showing before/after file sizes and savings percentage.
- **Advanced SVG Support**: Added support for converting large SVG files to PNG for thumbnail rendering and better compatibility.
- **Piped Process Support**: Refactored media processing to support piped commands, enabling more complex transformation workflows.
- **Central Process Executor**: Implemented central process executor using builder pattern for better process management and error handling.
- **Subtitle Handling**: Improved subtitle embedding with better preservation of language and title metadata.
- **Metadata Stripping**: Enhanced metadata stripping functionality with more granular controls.
- **New Brand Identity**: Updated logo and app icon across all platforms.
- **Batch Compression**: Extended batch compression settings to fully support image compression alongside video compression.

Bug Fixes:

- Fixed dimension calculation issue during image crop operations.
- Fixed output path display after media is saved.
- Fixed FPS not being properly applied during GIF conversion.
- Fixed subtitle embedding issues for multiple container formats.

> **Personal note:** I primarily use this for bulk PNG→WebP conversion and video compression before uploading to my NAS. The batch compression feature in this release is a huge quality-of-life improvement for that workflow. Also using this to batch-compress dashcam footage — the video speed control is handy for quick review before archiving.

### 2.1.1
E
