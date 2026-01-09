# Change: Add Video to Animation Tool

## Why

Currently, the system has an image processing tool that can crop images and generate thumbnails. There is a need to extend this capability to handle video files and convert them to animation formats (primarily GIF). This will allow users to process video resources similarly to how they process images, converting video clips into animated GIFs for use in the system as lightweight animated resources.

## What Changes

- **ADDED**: Video processing service (`VideoProcessingService`) to convert videos to animation formats (GIF, Lottie JSON, PAG)
- **ADDED**: API endpoints for video-to-animation conversion (`POST /api/videos/to-animation`) supporting multiple output formats
- **ADDED**: Video upload support with validation for supported video formats
- **ADDED**: Frontend UI components in ImageManagement (or separate VideoManagement) to handle video files with format selection
- **ADDED**: Configuration options for video processing parameters (fps, quality, dimensions, output format, etc.)
- **ADDED**: Support for Lottie JSON animation format conversion
- **ADDED**: Support for PAG (Portable Animated Graphics) format conversion
- **MODIFIED**: Storage service to support video file handling alongside images

## Impact

- **Affected specs**: New capability `video-processing` (to be created)
- **Affected code**:
  - New: `backend/src/main/java/com/heartsphere/service/VideoProcessingService.java`
  - New: `backend/src/main/java/com/heartsphere/controller/VideoController.java` (or extend ImageController)
  - Modified: `backend/src/main/resources/application.yml` (add video processing config)
  - New/Modified: `frontend/admin/components/VideoManagement.tsx` or extend `ImageManagement.tsx`
  - Modified: `backend/src/main/java/com/heartsphere/service/ImageStorageService.java` (or create VideoStorageService)
- **New dependencies**: 
  - FFmpeg Java wrapper library (e.g., `ws.schild:jave-all` or direct FFmpeg process execution)
  - Lottie conversion tools (may require additional libraries or services)
  - PAG SDK or conversion tools (may require Tencent PAG SDK or similar)
- **Storage**: Videos and generated animations (GIF, Lottie JSON, PAG) will be stored in similar directory structure as images

## Non-Breaking Changes

This is a new feature addition. Existing image processing functionality remains unchanged.