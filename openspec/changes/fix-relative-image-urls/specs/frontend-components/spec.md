# Frontend Components Spec Delta

## MODIFIED Requirements

### Requirement: LazyImage Component URL Handling

The `LazyImage` component **SHALL** automatically convert relative image paths to full URLs before loading images.

#### Scenario: Relative Path Conversion in LazyImage
- **WHEN** the `LazyImage` component receives a relative path in the `src` prop (e.g., `era/2026/01/xxx.png`)
- **THEN** it converts the path to a full URL (e.g., `http://localhost:8081/images/era/2026/01/xxx.png`)
- **AND** it uses the converted URL to load the image
- **AND** the image loads successfully

#### Scenario: Variant URL Conversion in LazyImage
- **WHEN** the `LazyImage` component receives relative paths in the `variants` prop
- **THEN** it converts all variant URLs (thumbnail, medium, highQuality) to full URLs
- **AND** it uses the converted URLs in the fallback chain
- **AND** all variant images load successfully

#### Scenario: Full URL Handling in LazyImage
- **WHEN** the `LazyImage` component receives a full URL (starting with `http://` or `https://`)
- **THEN** it uses the URL directly without conversion
- **AND** the image loads successfully

## MODIFIED Requirements

### Requirement: SceneCard Component Image URL Handling

The `SceneCard` component **SHALL** convert relative image paths to full URLs before generating image variants.

#### Scenario: Scene Image URL Conversion
- **WHEN** the `SceneCard` component receives a scene with a relative `imageUrl` (e.g., `era/2026/01/xxx.png`)
- **THEN** it converts the URL to a full URL before generating variants
- **AND** all generated variant URLs (thumbnail, medium, highQuality) are full URLs
- **AND** the `LazyImage` component receives full URLs
- **AND** the scene card image displays correctly

#### Scenario: Guest Mode Scene Card Display
- **WHEN** a guest user logs in and views the scene list
- **THEN** all scene card images are displayed correctly
- **AND** no image loading errors occur
- **AND** all image URLs are full URLs

## ADDED Requirements

### Requirement: Image URL Utility Function

The frontend **SHALL** provide a utility function `toFullImageUrl()` for converting relative image paths to full URLs.

#### Scenario: Utility Function Implementation
- **WHEN** the `toFullImageUrl()` function is called with a relative path
- **THEN** it returns a full URL with the correct base URL
- **AND** the base URL is configurable via environment variable
- **AND** if the input is already a full URL, it returns it unchanged
- **AND** if the input is null or empty, it returns an empty string

#### Scenario: Utility Function Usage
- **WHEN** frontend components need to display images
- **THEN** they use `toFullImageUrl()` to ensure URLs are full URLs
- **AND** the function is used consistently across all image-related components
- **AND** image loading errors are reduced
