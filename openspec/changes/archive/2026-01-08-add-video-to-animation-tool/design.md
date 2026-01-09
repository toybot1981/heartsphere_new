# Design: Video to Animation Tool

## Context

The system already has a well-established image processing tool (`ImageProcessingService`) that handles image cropping and thumbnail generation. This design extends that pattern to support video files, specifically converting videos to animated GIF format. The tool should follow the same architectural patterns as the image processing tool for consistency.

## Goals / Non-Goals

### Goals
- Convert video files (MP4, MOV, AVI, etc.) to animation formats: GIF, Lottie JSON, and PAG
- Support configurable output parameters (FPS, dimensions, quality, duration limits, output format)
- Integrate seamlessly with existing image/video storage infrastructure
- Provide REST API similar to image processing endpoints
- Support asynchronous processing for long-running conversions
- Maintain file organization similar to images (category/year/month structure)
- Provide format-specific quality optimizations for each animation format

### Non-Goals
- Real-time video streaming
- Video editing (trimming, effects, etc.) - only conversion to animation formats
- Support for all video formats - focus on common formats (MP4, MOV, AVI)
- Video playback in the management UI (only conversion functionality)
- Converting between animation formats (e.g., GIF to Lottie) - only video to animation
- Advanced animation editing features (only format conversion)

## Decisions

### Decision 1: Technology Choice for Video Processing

**Chosen**: FFmpeg via Java wrapper library (`ws.schild:jave-all`)

**Alternatives considered**:
1. Direct FFmpeg process execution via `ProcessBuilder`
   - Pros: More control, no additional dependencies
   - Cons: Requires FFmpeg installation on server, more complex error handling
2. Xuggler (deprecated, not maintained)
3. JavaCV (wrapper around OpenCV)
   - Pros: More features
   - Cons: Larger dependency, more complex API

**Rationale**: `jave-all` provides a good balance of ease of use and functionality. It bundles FFmpeg binaries for multiple platforms, reducing deployment complexity. If native FFmpeg is preferred, we can switch to process execution later.

### Decision 2: Storage Strategy

**Chosen**: Reuse `ImageStorageService` pattern with video-specific handling

**Alternatives considered**:
1. Separate `VideoStorageService`
   - Pros: Clear separation of concerns
   - Cons: Code duplication, harder to maintain

**Rationale**: Videos and images share similar storage requirements (category-based organization, system/user resource distinction). Extending existing service keeps code DRY while adding video-specific validation.

### Decision 3: API Design

**Chosen**: Separate controller (`VideoController`) with similar endpoint structure to `ImageController`

**Alternatives considered**:
1. Extend `ImageController` with video endpoints
   - Pros: Single controller for all media
   - Cons: Controller becomes too large, mixes concerns

**Rationale**: Separate controller keeps responsibilities clear. Both controllers can share common utilities (storage, URL conversion) but maintain focused APIs.

### Decision 4: Async Processing

**Chosen**: Synchronous processing for initial version, with clear error handling

**Alternatives considered**:
1. Full async with job queue (e.g., Spring @Async, job status tracking)
   - Pros: Better for long conversions, non-blocking
   - Cons: Added complexity, need job status storage

**Rationale**: Start simple. If videos are typically short (< 30s), synchronous processing is acceptable. Can add async processing later if needed based on usage patterns.

### Decision 5: Output Format and Quality

**Chosen**: GIF with configurable FPS (default 10), dimensions (maintain aspect ratio), and duration limits

**Rationale**: 
- GIF: Universally supported, good for simple animations. Widely compatible across platforms.
- Lottie: JSON-based format, excellent for web and mobile apps with small file sizes and scalable vector animations.
- PAG: Tencent's format optimized for mobile performance, supports complex animations with good compression.

Configurable parameters allow optimization for different use cases (thumbnails, previews, full animations) across all formats.

### Decision 6: Animation Format Conversion Libraries

**Chosen**: 
- GIF: FFmpeg (already chosen)
- Lottie: After Effects Bodymovin plugin output via FFmpeg + lottie-tools, or direct conversion libraries
- PAG: Tencent PAG SDK or PAGConverter tools

**Alternatives considered**:
1. Use only FFmpeg for all formats (FFmpeg can generate GIF, but Lottie/PAG require additional tools)
2. Cloud-based conversion services
   - Pros: No local dependencies, maintained by third party
   - Cons: External dependency, potential costs, latency, data privacy concerns

**Rationale**: FFmpeg handles GIF conversion natively. For Lottie and PAG, we need format-specific tools:
- Lottie: Can be generated from video via intermediate formats (SVG sequences) or using libraries that convert video frames to Lottie
- PAG: Requires Tencent's PAG SDK or converter tools, which may involve license considerations

For initial version, we can support GIF fully, and provide Lottie/PAG support with clear documentation on required tools/licenses.

## Technical Architecture

### Service Layer

```
VideoProcessingService
├── convertToGif(videoPath, options) -> String (relativePath)
├── getVideoInfo(videoPath) -> VideoInfo
└── validateVideoFormat(file) -> boolean
```

### Storage Layer

- Extend `ImageStorageService` to handle video files
- Support same category structure: `{category}/{year}/{month}/{filename}`
- Separate upload endpoint or extend existing with content-type detection

### API Layer

```
POST /api/videos/upload
POST /api/videos/to-animation
GET  /api/videos/list
GET  /api/videos/info
```

### Configuration

```yaml
app:
  video:
    storage:
      local:
        path: ./uploads/videos
      max-size: 104857600  # 100MB
      supported-formats:
        - mp4
        - mov
        - avi
        - webm
    processing:
      animation:
        default-fps: 10
        max-fps: 30
        default-width: 640
        default-height: 480
        max-duration: 30  # seconds
        quality: medium  # low, medium, high
```

## Risks / Trade-offs

### Risk 1: Large File Processing
**Risk**: Large videos may consume significant memory and CPU, blocking other requests
**Mitigation**: 
- Set file size limits (100MB default)
- Add duration limits (30s default)
- Monitor processing time and add async processing if needed

### Risk 2: FFmpeg Dependency
**Risk**: FFmpeg binaries may not be available on all deployment environments
**Mitigation**: 
- Use `jave-all` which bundles binaries
- Document deployment requirements
- Provide fallback error message if FFmpeg unavailable

### Risk 3: Storage Space
**Risk**: Videos and GIFs can be large, consuming storage quickly
**Mitigation**:
- Set reasonable file size limits
- Consider automatic cleanup of temporary files
- Monitor storage usage

### Trade-off: Quality vs File Size
- Higher quality GIFs are larger
- Provide quality presets (low, medium, high) to balance
- Users can choose based on use case

## Migration Plan

### Phase 1: Core Service
1. Add FFmpeg dependency
2. Implement `VideoProcessingService`
3. Add video storage support
4. Unit tests for service

### Phase 2: API Layer
1. Create `VideoController`
2. Implement upload and conversion endpoints
3. Integration tests

### Phase 3: Frontend
1. Add video upload UI (extend or new component)
2. Add conversion parameters UI
3. Display conversion progress/results

### Phase 4: Polish
1. Error handling improvements
2. Performance optimization
3. Documentation

## Open Questions

1. What are the licensing requirements for PAG SDK? Need to verify commercial use permissions.
2. Should we support other animation formats (WebP animated, APNG) in the future?
3. Do we need video preview/thumbnail generation as a separate feature?
4. Should there be a separate "Video Management" module or integrate into Image Management?
5. What is the expected average video length? This affects async processing decision.
6. For Lottie conversion: Should we use direct video-to-Lottie tools, or convert via intermediate formats (SVG sequences)?
7. How to handle Lottie/PAG conversion failures if required tools are not installed? Should these be optional features?