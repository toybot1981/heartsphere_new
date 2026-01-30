## ADDED Requirements

### Requirement: Scene Creation Wizard
The system SHALL provide a scene creation wizard that allows users to batch create scenes, characters, main stories, and scripts from preset templates in an existing world.

#### Scenario: User opens scene creation wizard
- **WHEN** user clicks "Batch Create Scenes" button in the scene list page
- **THEN** the system SHALL display a multi-step wizard interface
- **AND** the wizard SHALL start at step 1 (scene selection)

#### Scenario: User selects multiple preset scenes
- **WHEN** user is on step 1 (scene selection)
- **THEN** the system SHALL display a list of preset scenes
- **AND** each scene SHALL display its name, description, and thumbnail image (200×200 resolution)
- **AND** user SHALL be able to select multiple scenes using checkboxes
- **AND** user SHALL be able to customize the name of each selected scene (manual input or AI-generated)
- **AND** user SHALL be able to proceed to step 2 only if at least one scene is selected

#### Scenario: User selects characters for selected scenes
- **WHEN** user is on step 2 (character selection)
- **THEN** the system SHALL display characters grouped by scene
- **AND** each character SHALL display its name, role, avatar (thumbnail resolution), and bio
- **AND** user SHALL be able to select multiple characters per scene using checkboxes
- **AND** user SHALL be able to customize the name of each selected character (manual input or AI-generated)
- **AND** user SHALL be able to proceed to step 3 (or skip to step 4 if no main stories are available)

#### Scenario: User selects main story for selected scenes
- **WHEN** user is on step 3 (main story selection)
- **THEN** the system SHALL display main stories grouped by scene
- **AND** each scene SHALL allow selecting at most one main story
- **AND** user SHALL be able to customize the name of each selected main story (manual input or AI-generated)
- **AND** user SHALL be able to skip this step if no main stories are available for selected scenes
- **AND** user SHALL be able to proceed to step 4

#### Scenario: User selects scripts for selected scenes
- **WHEN** user is on step 4 (script selection)
- **THEN** the system SHALL display scripts grouped by scene
- **AND** each script SHALL display its title, description, and scene count
- **AND** user SHALL be able to select multiple scripts per scene using checkboxes
- **AND** user SHALL be able to customize the name of each selected script (manual input or AI-generated)
- **AND** user SHALL be able to skip this step if no scripts are available for selected scenes
- **AND** user SHALL be able to complete the wizard

#### Scenario: User completes scene creation
- **WHEN** user clicks "Complete" button on step 4
- **THEN** the system SHALL create all selected scenes in the specified order (scenes → characters → main stories → scripts)
- **AND** the system SHALL display creation progress (e.g., "Creating scenes...", "Creating characters...")
- **AND** the system SHALL handle partial creation failures gracefully (continue creating other items even if some fail)
- **AND** the system SHALL display creation results (number of successful and failed creations)
- **AND** the system SHALL refresh the scene list after successful creation
- **AND** the system SHALL close the wizard and call the `onComplete` callback

#### Scenario: User cancels scene creation
- **WHEN** user clicks "Cancel" button at any step
- **THEN** the system SHALL close the wizard without creating any scenes
- **AND** the system SHALL call the `onCancel` callback (if provided)

#### Scenario: User navigates between steps
- **WHEN** user is on any step (except step 1)
- **THEN** the system SHALL display "Previous" button
- **AND** clicking "Previous" SHALL navigate to the previous step
- **AND** the system SHALL preserve all user selections when navigating between steps

#### Scenario: System loads preset data
- **WHEN** wizard is opened
- **THEN** the system SHALL load preset scenes from `eraApi.getSystemEras()`
- **AND** when user selects scenes
- **THEN** the system SHALL load characters for selected scenes from `characterApi.getSystemCharacters(eraId)`
- **AND** the system SHALL load main stories for selected scenes from `presetMainStoryApi.getByEraId(eraId)`
- **AND** the system SHALL load scripts for selected scenes from `presetScriptApi.getByEraId(eraId)`
- **AND** the system SHALL handle loading errors gracefully (e.g., if a scene has no characters, display empty list)

#### Scenario: System handles creation errors
- **WHEN** creation of a scene, character, main story, or script fails
- **THEN** the system SHALL continue creating other items
- **AND** the system SHALL record which items failed and why
- **AND** the system SHALL display error details in the creation results
- **AND** the system SHALL allow user to retry failed creations manually

### Requirement: Scene Creation Wizard Integration
The scene creation wizard SHALL be integrated into the scene list page and optionally into the scene creation modal.

#### Scenario: User accesses wizard from scene list
- **WHEN** user is on the scene list page
- **THEN** the system SHALL display a "Batch Create Scenes" button
- **AND** clicking the button SHALL open the scene creation wizard
- **AND** after successful creation, the scene list SHALL refresh to show newly created scenes

#### Scenario: User accesses wizard from scene creation modal (optional)
- **WHEN** user opens `EraConstructorModal` to create a new scene
- **THEN** the system MAY display a "Use Wizard to Create" option
- **AND** clicking the option SHALL open the scene creation wizard
- **AND** the modal SHALL close when wizard is opened

### Requirement: Scene Creation Wizard Image Display
The scene creation wizard SHALL display images using the correct resolution rules.

#### Scenario: Scene images display with thumbnail resolution
- **WHEN** preset scenes are displayed in the wizard
- **THEN** scene images SHALL use `LazyImage` component with `purpose="thumbnail"`
- **AND** images SHALL be displayed at 200×200 resolution
- **AND** images SHALL use `generateVariantUrl` to generate variant URLs

#### Scenario: Character avatars display with thumbnail resolution
- **WHEN** characters are displayed in the wizard
- **THEN** character avatars SHALL use `LazyImage` component with `purpose="thumbnail"`
- **AND** avatars SHALL be displayed at 200×200 resolution
- **AND** avatars SHALL use `generateVariantUrl` to generate variant URLs
