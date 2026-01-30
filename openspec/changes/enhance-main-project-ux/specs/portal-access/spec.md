# Portal Access Specification Delta

## MODIFIED Requirements

### Requirement: Portal Access Method
The system SHALL provide portal access through a button in the shared heart sphere screen, instead of displaying portals in scenes.

#### Scenario: Portal button in shared heart sphere screen
- **WHEN** user views the shared heart sphere screen
- **THEN** a portal button is displayed in the top-right corner
- **AND** the button is clearly visible and accessible
- **AND** the button works on both PC and mobile
- **AND** the button uses an appropriate icon (e.g., portal or teleport icon)

#### Scenario: Portal selection modal
- **WHEN** user clicks the portal button
- **THEN** a modal dialog is displayed
- **AND** the modal shows a list of available shared heart spheres (destinations)
- **AND** the modal shows portal effect options
- **AND** the modal allows searching or filtering destinations
- **AND** the modal has a confirm button to execute teleportation

#### Scenario: Portal execution
- **WHEN** user selects a destination and effect, then confirms
- **THEN** the teleportation is executed
- **AND** the selected portal effect animation is played
- **AND** the user is transported to the selected shared heart sphere
- **AND** the modal is closed after teleportation

### Requirement: Portal Display in Scenes
The system SHALL NOT display portals in scene views, but SHALL retain portal configuration data.

#### Scenario: No portal display in scenes
- **WHEN** user views a scene
- **THEN** portals are not displayed in the scene
- **AND** portal configuration data is retained in the database
- **AND** existing portal configurations are not deleted

#### Scenario: Portal data migration
- **WHEN** the system is updated
- **THEN** existing portal configurations are preserved
- **AND** portal access is redirected to the new button-based method
- **AND** users can still access portals through the new method

## REMOVED Requirements

### Requirement: Portal Display in Scene Views
The system SHALL NOT display portals as interactive elements within scene views.

#### Scenario: Portal removal from scenes
- **WHEN** user views a scene
- **THEN** portals are not rendered in the scene
- **AND** the PortalLayer component does not display portals in scenes
- **AND** portal click events are not handled in scene views
