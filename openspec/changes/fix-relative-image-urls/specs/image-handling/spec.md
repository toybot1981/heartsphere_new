# Image Handling Spec Delta

## MODIFIED Requirements

### Requirement: Image URL Format in API Responses

The system **SHALL** return full URLs (with schema and base URL) for all image URLs in API responses, instead of relative paths.

#### Scenario: Era Image URL in API Response
- **WHEN** the system returns era data via `GET /api/eras`
- **THEN** the `imageUrl` field contains a full URL (e.g., `http://localhost:8081/images/era/2026/01/xxx.png`)
- **AND** the `imageVariants` object contains full URLs for all variants (thumbnail, medium, highQuality)
- **AND** all URLs start with `http://` or `https://`

#### Scenario: Character Image URL in API Response
- **WHEN** the system returns character data via `GET /api/characters`
- **THEN** the `avatarUrl` and `backgroundUrl` fields contain full URLs
- **AND** the `avatarVariants` and `backgroundVariants` objects contain full URLs for all variants
- **AND** all URLs start with `http://` or `https://`

#### Scenario: Image Variants URL Format
- **WHEN** the system generates image variants via `ImageUrlUtils.generateImageVariants()`
- **THEN** all variant URLs (original, thumbnail, medium, highQuality) are full URLs
- **AND** all URLs start with `http://` or `https://`
- **AND** the base URL is correctly configured based on the environment

## ADDED Requirements

### Requirement: Frontend Image URL Conversion Utility

The frontend **SHALL** provide a utility function to convert relative image paths to full URLs as a fallback mechanism.

#### Scenario: Relative Path to Full URL Conversion
- **WHEN** the frontend receives a relative image path (e.g., `era/2026/01/xxx.png`)
- **THEN** the `toFullImageUrl()` function converts it to a full URL (e.g., `http://localhost:8081/images/era/2026/01/xxx.png`)
- **AND** the base URL is configurable via environment variable `VITE_IMAGE_BASE_URL`
- **AND** if the environment variable is not set, it uses the default value `http://localhost:8081/images`

#### Scenario: Full URL Pass-Through
- **WHEN** the frontend receives a full URL (starting with `http://` or `https://`)
- **THEN** the `toFullImageUrl()` function returns it unchanged
- **AND** no conversion is performed

#### Scenario: Image Component URL Handling
- **WHEN** the `LazyImage` component receives an image URL
- **THEN** it checks if the URL is a relative path
- **AND** if it is a relative path, it converts it to a full URL before loading
- **AND** all variant URLs in the `variants` prop are also converted if needed
- **AND** the image loads successfully with the full URL
