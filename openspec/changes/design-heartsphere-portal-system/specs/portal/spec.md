# Portal System

## Module Independence Requirements

### Requirement: Portal Module Independence
The portal system SHALL be implemented as an independent module that does not affect existing heartsphere sharing functionality.

#### Scenario: Portal module can be disabled without affecting sharing
- **WHEN** portal feature is disabled via configuration
- **THEN** all portal-related endpoints return "feature disabled" error
- **AND** portal components do not render in frontend
- **AND** existing heartsphere sharing functionality continues to work normally
- **AND** no portal-related code is executed

#### Scenario: Portal module uses independent package structure
- **WHEN** portal code is implemented
- **THEN** backend code is in `com.heartsphere.heartconnect.portal` package (as a submodule of `heartconnect`)
- **AND** frontend code is in `components/portal/` and `services/api/portal/` directories
- **AND** portal module does not directly depend on internal implementation of existing modules
- **AND** communication with existing modules is through interfaces or events

#### Scenario: Portal database tables are independent
- **WHEN** portal tables are created
- **THEN** portal tables do not have foreign key constraints to existing tables
- **AND** relationships are managed through application logic
- **AND** portal tables can exist without affecting existing table queries
- **AND** portal data queries do not impact performance of existing tables

### Requirement: Reuse of Existing Tools and Patterns
The portal system SHALL reuse existing tools, patterns, and architectures where applicable.

#### Scenario: Portal code generator reuses existing pattern
- **WHEN** portal ID is generated
- **THEN** PortalCodeGenerator follows the same pattern as ShareCodeGenerator
- **AND** uses format PT-XXXXXX (6 alphanumeric characters)
- **AND** excludes confusing characters (0, O, I, 1)
- **AND** provides validation method similar to ShareCodeGenerator

#### Scenario: Portal service follows existing service architecture
- **WHEN** PortalService is implemented
- **THEN** follows the same architectural patterns as ShareConfigService
- **AND** uses similar transaction management
- **AND** uses similar error handling patterns
- **AND** uses similar DTO conversion methods
- **BUT** is implemented independently without direct dependency

#### Scenario: Portal API follows existing API conventions
- **WHEN** portal API endpoints are implemented
- **THEN** uses the same RESTful conventions as existing APIs
- **AND** uses the same response format (ApiResponse wrapper)
- **AND** uses the same error response format
- **AND** uses independent API path prefix `/api/portal/...`

## ADDED Requirements

### Requirement: Portal Creation and Configuration
The system SHALL allow heartsphere owners to create portals in their scenes that connect to other heartspheres.

#### Scenario: Owner creates a portal
- **WHEN** a heartsphere owner navigates to portal management in scene editor
- **AND** selects "Create Portal" option
- **AND** configures portal properties (type, target heartsphere, position, permissions)
- **THEN** a portal entity is created and saved
- **AND** the portal appears in the scene at the specified location

#### Scenario: Portal configuration includes target selection
- **WHEN** owner configures a portal
- **THEN** they can select target heartsphere by share code or from list
- **AND** they can preview target heartsphere information (name, owner, description, cover image)
- **AND** they can set portal name and description

#### Scenario: Portal type selection
- **WHEN** owner creates a portal
- **THEN** they can choose from three portal types:
  - Stargate Portal (circular energy ring with vortex)
  - Wormhole Portal (spatial distortion effect)
  - Quantum Portal (holographic geometric frame)
- **AND** each type has distinct visual appearance

### Requirement: Portal Visual Rendering
The system SHALL render portals with science-fiction themed visual effects that match their type.

#### Scenario: Stargate portal rendering
- **WHEN** a Stargate portal is rendered in a scene
- **THEN** it displays as a circular frame (2-4m diameter, configurable)
- **AND** shows rotating energy ring with blue-purple glow
- **AND** displays central energy vortex with depth effect
- **AND** emits particles from center outward
- **AND** has pulsing edge lighting effect (0.5-2Hz frequency)
- **AND** affects ambient lighting in surrounding area

#### Scenario: Wormhole portal rendering
- **WHEN** a Wormhole portal is rendered in a scene
- **THEN** it displays as elliptical spatial distortion
- **AND** shows background warping through portal
- **AND** displays dark center with light halo
- **AND** shows multiple concentric energy rings rotating at different speeds
- **AND** displays particle trails simulating matter absorption
- **AND** has irregular edge flickering effect

#### Scenario: Quantum portal rendering
- **WHEN** a Quantum portal is rendered in a scene
- **THEN** it displays as geometric frame (hexagon/octagon shape)
- **AND** shows holographic semi-transparent frame
- **AND** displays quantum particles randomly flickering inside frame
- **AND** shows energy grid pattern within frame
- **AND** displays vertical scanning lines moving top to bottom
- **AND** shows data stream effects around frame

#### Scenario: Portal animation states
- **WHEN** a portal is in different states
- **THEN** idle state shows slow rotation/particle movement
- **AND** activated state shows enhanced effects and faster animation
- **AND** teleporting state shows particles/energy converging toward center
- **AND** cooldown state shows gradual energy restoration

### Requirement: Portal Interaction and Preview
The system SHALL allow visitors to interact with portals to view information and initiate teleportation.

#### Scenario: Portal hover interaction
- **WHEN** a visitor hovers over a portal
- **THEN** portal activates (visual effects intensify)
- **AND** displays target heartsphere preview card with:
  - Heartsphere name and owner
  - Cover image
  - Description (truncated if long)
  - Character count and scene count
  - Access permission status
- **AND** plays activation sound effect

#### Scenario: Portal click interaction
- **WHEN** a visitor clicks on an activated portal
- **THEN** system checks teleportation permission
- **AND** if permission granted, shows teleportation confirmation dialog
- **AND** if permission denied, shows permission denied message with reason
- **AND** preview card remains visible during interaction

#### Scenario: Teleportation permission check
- **WHEN** visitor attempts to teleport through portal
- **THEN** system checks:
  - Portal-specific permission settings
  - Target heartsphere access permission
  - Visitor's connection status with target heartsphere
- **AND** grants or denies teleportation based on permission rules

### Requirement: Teleportation Animation Sequence
The system SHALL provide an immersive teleportation animation sequence when visitors travel through portals.

#### Scenario: Teleportation sequence - approach phase
- **WHEN** visitor confirms teleportation
- **THEN** portal visual effects intensify (1 second duration)
- **AND** target heartsphere preview information remains visible
- **AND** activation sound effect plays
- **AND** portal reaches peak visual intensity

#### Scenario: Teleportation sequence - teleport phase
- **WHEN** approach phase completes
- **THEN** current scene gradually fades out (2-3 seconds)
- **AND** portal visual effects reach maximum intensity
- **AND** particles/energy converge toward portal center
- **AND** teleportation sound effect plays
- **AND** screen shows brief "travelling through space" effect (darkness or warp effect)

#### Scenario: Teleportation sequence - arrival phase
- **WHEN** teleport phase completes
- **THEN** target heartsphere scene fades in (1 second)
- **AND** displays "Arrived at [Heartsphere Name]" notification
- **AND** portal completion animation plays
- **AND** visitor is positioned at arrival point in target scene

#### Scenario: Animation skip option
- **WHEN** teleportation animation is playing
- **THEN** visitor can skip animation by clicking skip button
- **AND** if skipped, scene transition completes immediately
- **AND** target heartsphere loads in background during animation (allowing skip to work smoothly)

### Requirement: Portal Management Interface
The system SHALL provide an interface for heartsphere owners to manage portals in their scenes.

#### Scenario: Portal list view
- **WHEN** owner opens portal management interface
- **THEN** displays list of all portals in current scene
- **AND** each portal shows:
  - Portal type icon
  - Portal name
  - Target heartsphere name
  - Position in scene
  - Permission status
  - Active/inactive status
- **AND** provides options to edit, delete, or create new portal

#### Scenario: Portal creation form
- **WHEN** owner clicks "Create Portal"
- **THEN** displays portal creation form with fields:
  - Portal name (required)
  - Portal type selection (required)
  - Target heartsphere selection (required, with search/preview)
  - Position in scene (X, Y, Z coordinates or visual placement)
  - Permission settings (public, approval required, invite only)
  - Portal description (optional)
  - Visual size configuration (for portal diameter/size)
- **AND** shows live preview of portal appearance
- **AND** validates form before submission

#### Scenario: Portal editing
- **WHEN** owner edits an existing portal
- **THEN** loads portal configuration into form
- **AND** allows modification of all portal properties except portal ID
- **AND** saves changes when owner clicks save
- **AND** updates portal appearance in scene immediately

#### Scenario: Portal deletion
- **WHEN** owner deletes a portal
- **THEN** shows confirmation dialog
- **AND** if confirmed, removes portal from scene and database
- **AND** updates scene to remove portal visual element

### Requirement: Portal Permissions System
The system SHALL support flexible permission rules for portal access.

#### Scenario: Public portal access
- **WHEN** portal is configured with "public" permission
- **THEN** any visitor to the heartsphere can use the portal
- **AND** no additional approval is required
- **AND** teleportation proceeds immediately upon confirmation

#### Scenario: Approval-required portal access
- **WHEN** portal is configured with "approval required" permission
- **THEN** visitor must send teleportation request to portal owner
- **AND** owner receives notification of request
- **AND** owner can approve or deny request
- **AND** if approved, visitor can teleport through portal
- **AND** approval is remembered for future teleportations

#### Scenario: Invite-only portal access
- **WHEN** portal is configured with "invite only" permission
- **THEN** only invited users can see and use the portal
- **AND** owner can send portal invitations to specific users
- **AND** invited users receive invitation notification
- **AND** portal appears in invited users' available portals list

#### Scenario: Portal permission override
- **WHEN** portal has specific permission setting
- **AND** target heartsphere has different access permission
- **THEN** both permissions are checked
- **AND** visitor must have permission for both portal and target heartsphere
- **AND** system shows clear message if either permission is denied

### Requirement: Portal Position and Placement
The system SHALL allow owners to position portals within scene space.

#### Scenario: Visual portal placement
- **WHEN** owner creates or edits portal position
- **THEN** displays 3D scene view
- **AND** allows owner to click/drag to set portal position
- **AND** shows portal preview at selected position
- **AND** displays X, Y, Z coordinates
- **AND** allows manual coordinate input

#### Scenario: Portal placement validation
- **WHEN** owner sets portal position
- **THEN** system validates position is within scene bounds
- **AND** checks for conflicts with other scene objects (optional, can overlap)
- **AND** shows error if position is invalid
- **AND** prevents saving invalid positions

#### Scenario: Portal size configuration
- **WHEN** owner configures portal
- **THEN** can set portal size/diameter (2-4 meters for Stargate, proportional for others)
- **AND** size affects visual appearance and interaction area
- **AND** preview updates immediately when size changes

### Requirement: Portal Teleportation Logging
The system SHALL log portal teleportations for analytics and debugging.

#### Scenario: Teleportation event logging
- **WHEN** visitor successfully teleports through portal
- **THEN** system logs:
  - Timestamp
  - Visitor user ID
  - Source heartsphere ID
  - Target heartsphere ID
  - Portal ID
  - Teleportation duration (animation time)
- **AND** updates portal usage statistics

#### Scenario: Teleportation failure logging
- **WHEN** teleportation fails (permission denied, target unavailable, etc.)
- **THEN** system logs failure reason
- **AND** includes visitor ID, portal ID, and error type
- **AND** does not expose sensitive information in logs
