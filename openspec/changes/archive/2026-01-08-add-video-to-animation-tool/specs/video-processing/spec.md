# Video Processing Specification

## ADDED Requirements

### Requirement: Video File Upload
The system SHALL support uploading video files through a REST API endpoint. Uploaded videos SHALL be validated for format and size, stored in a category-based directory structure, and assigned unique filenames.

#### Scenario: Successful video upload
- **WHEN** a user uploads a valid video file (MP4, MOV, AVI, or WebM) that is within the maximum size limit (100MB default)
- **THEN** the video SHALL be saved to the storage system in the format `{category}/{year}/{month}/{uuid}.{extension}`
- **AND** the API SHALL return a success response containing the video URL and relative path
- **AND** the video file SHALL be accessible via the returned URL

#### Scenario: Video upload with invalid format
- **WHEN** a user attempts to upload a file that is not a supported video format
- **THEN** the API SHALL reject the upload with a 400 Bad Request response
- **AND** the response SHALL include an error message indicating the unsupported format

#### Scenario: Video upload exceeds size limit
- **WHEN** a user attempts to upload a video file that exceeds the maximum allowed size
- **THEN** the API SHALL reject the upload with a 400 Bad Request response
- **AND** the response SHALL include an error message indicating the file size limit

### Requirement: Video to Animation Conversion
The system SHALL convert uploaded video files to animation formats (GIF, Lottie JSON, or PAG) with configurable parameters including frame rate (FPS), dimensions, quality, start time, and duration. The output format SHALL be specified by the user in the conversion request.

#### Scenario: Convert video to GIF with default parameters
- **WHEN** a user requests conversion of a valid video to GIF format without specifying parameters
- **THEN** the system SHALL convert the video to GIF using default parameters (10 FPS, maintain aspect ratio, medium quality)
- **AND** the converted GIF SHALL be saved in the same directory as the source video
- **AND** the filename SHALL follow the pattern `{original-name}_animation_{width}x{height}_{fps}fps.gif`
- **AND** the API SHALL return the GIF URL and conversion metadata

#### Scenario: Convert video to Lottie JSON format
- **WHEN** a user requests conversion of a valid video to Lottie JSON format
- **THEN** the system SHALL convert the video to Lottie JSON animation file
- **AND** the converted Lottie file SHALL be saved in the same directory as the source video
- **AND** the filename SHALL follow the pattern `{original-name}_animation_lottie.json`
- **AND** the Lottie JSON SHALL be valid and renderable by Lottie players
- **AND** the API SHALL return the Lottie file URL and conversion metadata

#### Scenario: Convert video to PAG format
- **WHEN** a user requests conversion of a valid video to PAG format
- **THEN** the system SHALL convert the video to PAG animation file
- **AND** the converted PAG file SHALL be saved in the same directory as the source video
- **AND** the filename SHALL follow the pattern `{original-name}_animation.pag`
- **AND** the PAG file SHALL be valid and renderable by PAG players
- **AND** the API SHALL return the PAG file URL and conversion metadata

#### Scenario: Convert video to animation with custom parameters
- **WHEN** a user requests conversion to any animation format (GIF, Lottie, or PAG) with custom FPS, dimensions, quality, start time, or duration
- **THEN** the system SHALL convert the video using the specified parameters
- **AND** the conversion SHALL respect maximum limits (30 FPS max, 30 seconds duration max)
- **AND** if aspect ratio is not maintained, dimensions SHALL be applied as specified
- **AND** format-specific parameters SHALL be applied appropriately (e.g., Lottie precision, PAG compression)

#### Scenario: Convert video segment (start time and duration)
- **WHEN** a user specifies a start time and/or duration for conversion to any animation format
- **THEN** the system SHALL extract only the specified segment from the video
- **AND** the conversion SHALL begin at the specified start time
- **AND** the conversion SHALL be limited to the specified duration (not exceeding video length or maximum duration)

#### Scenario: Video conversion failure
- **WHEN** video conversion fails due to invalid video file, corrupted file, unsupported format, or processing error
- **THEN** the API SHALL return a 500 Internal Server Error response
- **AND** the response SHALL include an error message describing the failure reason
- **AND** no partial or corrupted output files SHALL be saved

#### Scenario: Unsupported animation format
- **WHEN** a user requests conversion to an animation format that is not supported (not GIF, Lottie, or PAG)
- **THEN** the API SHALL return a 400 Bad Request response
- **AND** the response SHALL include an error message listing supported animation formats

### Requirement: Video Metadata Extraction
The system SHALL extract and return metadata about uploaded videos including duration, dimensions (width and height), file size, format, and frame rate.

#### Scenario: Get video information
- **WHEN** a user requests video information via API
- **THEN** the system SHALL return video metadata including duration in seconds, width and height in pixels, file size in bytes, format codec, and frame rate
- **AND** the metadata SHALL be extracted from the video file using FFmpeg

#### Scenario: Video info for non-existent file
- **WHEN** a user requests information for a video file that does not exist
- **THEN** the API SHALL return a 404 Not Found response
- **AND** the response SHALL include an error message indicating the file was not found

### Requirement: Video Storage and Organization
The system SHALL store videos using the same organizational structure as images, supporting category-based organization and system/user resource distinction.

#### Scenario: Store system resource video
- **WHEN** a video is uploaded as a system resource (no userId)
- **THEN** the video SHALL be stored in the path format `{category}/{year}/{month}/{filename}`
- **AND** the video SHALL be accessible to all users

#### Scenario: Store user resource video
- **WHEN** a video is uploaded with a userId
- **THEN** the video SHALL be stored in the path format `{userId}/{category}/{year}/{month}/{filename}`
- **AND** the video SHALL only be accessible to the owning user (subject to authorization)

### Requirement: Video Format Validation
The system SHALL validate uploaded video files to ensure they are in supported formats and meet quality standards for processing.

#### Scenario: Validate supported video format
- **WHEN** a video file is uploaded
- **THEN** the system SHALL verify the file is one of: MP4, MOV, AVI, or WebM
- **AND** the system SHALL validate the file is a valid video file (not just renamed)
- **AND** validation SHALL occur before file storage

#### Scenario: Reject unsupported format
- **WHEN** a file with unsupported format is uploaded
- **THEN** the system SHALL reject the file before storage
- **AND** the error response SHALL list supported formats

### Requirement: Video List Management
The system SHALL provide the ability to list uploaded videos filtered by category, similar to the image listing functionality.

#### Scenario: List videos by category
- **WHEN** a user requests a list of videos with a specific category
- **THEN** the system SHALL return a list of videos in that category
- **AND** the list SHALL include video URLs, names, categories, file sizes, and metadata
- **AND** results SHALL be sorted by creation time (newest first)

#### Scenario: List all system videos
- **WHEN** a user requests all videos without specifying a category (or with category "all")
- **THEN** the system SHALL return all system resource videos across all categories
- **AND** the response SHALL include the total count of videos

### Requirement: Animation Output Quality Configuration
The system SHALL support configurable quality presets (low, medium, high) for animation output, affecting file size and visual quality. Quality configuration SHALL apply to all supported animation formats (GIF, Lottie, PAG) with format-specific optimizations.

#### Scenario: Generate low quality animation
- **WHEN** a user requests conversion with quality preset "low" for any animation format
- **THEN** the system SHALL generate an animation optimized for small file size
- **AND** for GIF: color palette optimization SHALL be applied
- **AND** for Lottie: precision and keyframe reduction SHALL be applied
- **AND** for PAG: compression settings SHALL be optimized for size
- **AND** the output file SHALL be smaller than medium or high quality versions

#### Scenario: Generate high quality animation
- **WHEN** a user requests conversion with quality preset "high" for any animation format
- **THEN** the system SHALL generate an animation optimized for visual quality
- **AND** for GIF: larger color palette and minimal compression SHALL be used
- **AND** for Lottie: higher precision and more keyframes SHALL be preserved
- **AND** for PAG: lower compression and higher quality settings SHALL be applied
- **AND** the output file SHALL be larger but visually superior to low or medium quality versions

#### Scenario: Format-specific quality parameters
- **WHEN** a user specifies format-specific quality parameters (e.g., Lottie precision, PAG compression level)
- **THEN** the system SHALL apply those parameters in addition to or instead of the quality preset
- **AND** format-unsupported parameters SHALL be ignored with a warning (not an error)

### Requirement: Video Processing Error Handling
The system SHALL provide clear error messages and handle edge cases gracefully during video processing operations.

#### Scenario: Handle missing FFmpeg dependency
- **WHEN** video processing is attempted but FFmpeg is not available
- **THEN** the system SHALL return a clear error message indicating the processing dependency is missing
- **AND** the error SHALL suggest installation or configuration steps

#### Scenario: Handle corrupted video file
- **WHEN** a corrupted or partially downloaded video file is uploaded
- **THEN** the system SHALL detect the corruption during validation or processing
- **AND** the system SHALL return an appropriate error message
- **AND** no output files SHALL be created

#### Scenario: Handle insufficient disk space
- **WHEN** video processing attempts to create output files but disk space is insufficient
- **THEN** the system SHALL detect the disk space issue
- **AND** the system SHALL return an error message
- **AND** partial files SHALL be cleaned up