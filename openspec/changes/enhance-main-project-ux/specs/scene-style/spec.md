# Scene Style Specification Delta

## ADDED Requirements

### Requirement: Scene Style Field
The system SHALL store scene style in the scene (Era) entity, with a default value of "realistic".

#### Scenario: Scene style storage
- **WHEN** a scene is created or updated
- **THEN** the scene has a `style` field
- **AND** the style field defaults to "realistic" if not specified
- **AND** the style is saved to the database
- **AND** the style can be one of: 'realistic', 'anime', 'cyberpunk', 'fantasy', 'steampunk', 'minimalist', 'watercolor', 'oil-painting'

#### Scenario: Scene style retrieval
- **WHEN** a scene is loaded
- **THEN** the scene style is retrieved from the database
- **AND** the style is available for use in scene and character generation
- **AND** the style is used consistently across the scene

### Requirement: Scene Style Selection in Creation
The system SHALL allow users to select scene style when creating a scene, with realistic as the default.

#### Scenario: Style selector in scene creation
- **WHEN** user creates a new scene
- **THEN** a style selector is displayed in the scene creation modal
- **AND** the selector shows all available styles
- **AND** the default selection is "realistic"
- **AND** the selector works on both PC and mobile

#### Scenario: Style selection and saving
- **WHEN** user selects a style and creates the scene
- **THEN** the selected style is saved with the scene
- **AND** the style is used for scene image generation
- **AND** the style affects character generation in the scene

### Requirement: Scene Style Impact on Generation
The system SHALL use scene style to influence scene and character image generation and character attribute settings.

#### Scenario: Scene image generation with style
- **WHEN** generating scene images
- **THEN** the scene style is used as a generation parameter
- **AND** the generated images match the selected style
- **AND** the style is consistently applied across all scene images

#### Scenario: Character image generation with style
- **WHEN** generating character images in a scene
- **THEN** the scene style is used as a generation parameter
- **AND** the generated character images match the scene style
- **AND** characters are visually consistent with the scene style

#### Scenario: Character attributes with style
- **WHEN** setting character attributes
- **THEN** the scene style influences attribute values
- **AND** style-appropriate attributes are suggested or applied
- **AND** attributes align with the scene style (e.g., tech-focused attributes for cyberpunk style)

## MODIFIED Requirements

### Requirement: World Style Selection Location
The system SHALL NOT provide world style selection in the EntryPoint component.

#### Scenario: Style selector removal from EntryPoint
- **WHEN** user views the EntryPoint
- **THEN** the world style selector is not displayed
- **AND** style selection is only available during scene creation
- **AND** existing style selection UI is removed

### Requirement: Scene Creation with Style
Scene creation SHALL include style selection as a required step, with realistic as the default.

#### Scenario: Scene creation modal with style
- **WHEN** user opens the scene creation modal
- **THEN** the modal includes a style selection field
- **AND** the style field defaults to "realistic"
- **AND** the style is saved when the scene is created
- **AND** the modal works on both PC and mobile

## REMOVED Requirements

### Requirement: World Style Selection in EntryPoint
The system SHALL NOT provide world style selection in the EntryPoint component.

#### Scenario: EntryPoint without style selector
- **WHEN** user views the EntryPoint
- **THEN** there is no style selector button or dropdown
- **AND** style-related state management is removed
- **AND** style-related props are removed from EntryPoint
