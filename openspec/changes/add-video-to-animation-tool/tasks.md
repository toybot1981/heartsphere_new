# Implementation Tasks

## 1. Backend Dependencies and Configuration

- [x] 1.1 Add FFmpeg Java wrapper dependency to `pom.xml` (e.g., `ws.schild:jave-all`)
- [x] 1.2 Research and add dependencies for Lottie conversion (if Java libraries available)
  - Note: Lottie conversion requires additional tools, implemented as placeholder for now
- [x] 1.3 Research and add dependencies for PAG conversion (if Java libraries available, or document external tool requirements)
  - Note: PAG conversion requires Tencent PAG SDK, implemented as placeholder for now
- [x] 1.4 Add video processing configuration to `application.yml`
  - Video storage path
  - Max file size
  - Supported video input formats
  - Supported animation output formats (GIF, Lottie, PAG)
  - Default processing parameters (FPS, dimensions, quality)
  - Format-specific default settings
- [x] 1.5 Create `VideoInfo` data class for video metadata
- [x] 1.6 Create `AnimationFormat` enum (GIF, LOTTIE, PAG)

## 2. Service Layer

- [x] 2.1 Create `VideoProcessingService` class
  - Implement `getVideoInfo(String videoPath)` method
  - Implement `validateVideoFormat(MultipartFile file)` method
  - Implement `convertToAnimation(String videoPath, VideoToAnimationOptions options)` method (supports GIF/Lottie/PAG)
  - Implement `convertToGif(String videoPath, VideoToAnimationOptions options)` method
  - Implement `convertToLottie(String videoPath, VideoToAnimationOptions options)` method (placeholder - throws UnsupportedOperationException)
  - Implement `convertToPag(String videoPath, VideoToAnimationOptions options)` method (placeholder - throws UnsupportedOperationException)
  - Implement helper methods for FFmpeg command construction
  - Implement helper methods for Lottie conversion (if needed)
  - Implement helper methods for PAG conversion (if needed)
- [x] 2.2 Add video storage methods to `ImageStorageService` (or create `VideoStorageService`)
  - `saveVideo(MultipartFile file, String category, String userId)`
  - `deleteVideo(String videoUrl)`
  - Video format validation
- [x] 2.3 Create `VideoToAnimationOptions` configuration class
  - FPS, width, height, quality, start time, duration, output format (GIF/Lottie/PAG)
  - Format-specific options (Lottie precision, PAG compression, etc.)

## 3. API Layer

- [x] 3.1 Create `VideoController` class
- [x] 3.2 Implement `POST /api/videos/upload` endpoint
  - Accept video file upload
  - Validate format and size
  - Save to storage
  - Return video URL
- [x] 3.3 Implement `POST /api/videos/to-animation` endpoint
  - Accept video URL and conversion options (including output format: GIF/Lottie/PAG)
  - Validate output format parameter
  - Call appropriate conversion method based on format (`convertToGif`, `convertToLottie`, or `convertToPag`)
  - Return animation URL and metadata (including format type)
- [ ] 3.4 Implement `GET /api/videos/list` endpoint (optional, if needed)
  - List videos by category
  - Note: Deferred for later implementation, can reuse image listing pattern
- [x] 3.5 Implement `GET /api/videos/info` endpoint (optional, if needed)
  - Get video metadata (duration, dimensions, size)

## 4. Frontend Types and API Service

- [x] 4.1 Create video processing types in `frontend/services/api/video/types.ts`
  - `VideoUploadResponse`
  - `VideoToAnimationRequest`
  - `VideoToAnimationResponse`
  - `VideoInfo`
- [x] 4.2 Create `frontend/services/api/video/video.ts`
  - `uploadVideo(file, category, token)`
  - `convertToAnimation(url, options, token)` - options include format (GIF/Lottie/PAG)
  - `getVideoInfo(url, token)`
- [x] 4.3 Export video API from `frontend/services/api.ts`

## 5. Frontend UI Components

- [x] 5.1 Extend `ImageManagement.tsx` or create `VideoManagement.tsx`
  - Add video file upload UI
  - Display video list (similar to image list)
  - Add conversion to animation UI with format selector (GIF/Lottie/PAG)
  - Show conversion parameters (FPS, dimensions, quality, output format)
  - Display format-specific options when format is selected
  - Display conversion progress (if async added)
- [x] 5.2 Create video-specific CSS if needed
  - Video preview styles
  - Conversion parameter inputs
- [x] 5.3 Add video management to admin sidebar (if separate component)

## 6. Testing

- [x] 6.1 Write unit tests for `VideoProcessingService`
  - Test video info extraction (with mocked dependencies)
  - Test format validation
  - Test GIF conversion with various parameters (mocked)
  - Test Lottie conversion (should throw UnsupportedOperationException)
  - Test PAG conversion (should throw UnsupportedOperationException)
  - Test output format validation
  - Test AnimationFormat enum methods
  - Test VideoToAnimationOptions builder
  - Test error handling (invalid formats, file not found, unsupported format, etc.)
- [x] 6.2 Write unit tests for `VideoController`
  - Test upload endpoint (invalid format, empty file validation)
  - Test conversion endpoint (invalid format, empty URL validation)
  - Test video info endpoint (missing/empty URL validation)
  - Test parameter validation
  - Test error responses
- [ ] 6.3 Write integration tests (requires actual video files and FFmpeg)
  - End-to-end video upload and conversion flow
  - File system integration
  - Storage service integration
  - Note: Can be added later when FFmpeg environment is available
- [ ] 6.4 Manual testing (requires runtime environment)
  - Test with various video formats (MP4, MOV, AVI)
  - Test with different video sizes
  - Test conversion parameter variations for each format (GIF, Lottie, PAG)
  - Verify generated GIF quality
  - Verify generated Lottie JSON validity (test with Lottie player)
  - Verify generated PAG file validity (test with PAG player/viewer)
  - Test format selection UI and parameter application

## 7. Documentation and Error Handling

- [x] 7.1 Add JavaDoc comments to service classes
  - Added JavaDoc to VideoProcessingService
  - Added JavaDoc to VideoController
  - Added JavaDoc to VideoInfo, VideoToAnimationOptions, AnimationFormat
- [x] 7.2 Add error handling for common failure scenarios
  - FFmpeg not available (handled via EncoderException)
  - Lottie conversion tools not available (throws UnsupportedOperationException with clear message)
  - PAG conversion tools not available (throws UnsupportedOperationException with clear message)
  - Invalid video format (validation in upload and conversion)
  - Unsupported output animation format (validation in conversion endpoint)
  - File too large (validation in upload)
  - Processing timeout (can be added later if needed)
  - Insufficient disk space (IOException handling)
  - Format-specific conversion failures (caught and returned as error responses)
- [x] 7.3 Create usage documentation (similar to image tool docs)
  - API usage examples for each format (GIF, Lottie, PAG)
  - Parameter descriptions (including format-specific parameters)
  - Best practices for each animation format
  - Format comparison guide (when to use which format)
  - External tool requirements and installation (for Lottie/PAG if needed)
  - License and dependency information for PAG SDK
  - Created comprehensive usage guide at `docs/12-开发指南/视频转动画工具使用指南.md`

## 8. Validation and Code Quality

- [x] 8.1 Run linting and fix any issues
  - All linting checks passed
  - No compilation errors
- [x] 8.2 Ensure code follows existing patterns and conventions
  - Follows existing Spring Boot patterns
  - Uses same error handling approach as ImageController
  - Follows same frontend patterns as ImageManagement component
- [x] 8.3 Verify OpenSpec validation passes: `openspec validate add-video-to-animation-tool --strict`
  - OpenSpec validation passed successfully