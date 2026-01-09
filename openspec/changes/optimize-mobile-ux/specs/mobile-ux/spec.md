## ADDED Requirements

### Requirement: Mobile UX Design Guidelines
The system SHALL maintain comprehensive Mobile UX design guidelines that define layout, navigation, component design, and interaction patterns for mobile interfaces, following a design philosophy of "flat, simple, and tech-forward".

#### Scenario: Developer implements new mobile page
- **WHEN** a developer needs to implement a new mobile page
- **THEN** they can reference the Mobile UX guidelines for layout, spacing, and component patterns
- **AND** they ensure content area has proper bottom padding to avoid TabBar overlap
- **AND** they use safe area insets for top and bottom spacing
- **AND** the resulting page matches the "flat, simple, and tech-forward" design style

#### Scenario: TabBar does not overlap content
- **WHEN** a user views any mobile page
- **THEN** all page content is visible and accessible
- **AND** no content is hidden behind the TabBar
- **AND** scrolling works correctly with proper bottom padding

#### Scenario: Navigation works correctly
- **WHEN** a user taps a TabBar button
- **THEN** the app navigates to the correct screen
- **WHEN** a user taps the back button
- **THEN** the app returns to the previous screen
- **AND** navigation state is correctly maintained

#### Scenario: Login page has proper proportions
- **WHEN** a user views the login page on mobile
- **THEN** buttons meet minimum touch target size (44x44px)
- **AND** form elements are properly sized and spaced
- **AND** the page layout is balanced and visually appealing

### Requirement: Safe Area Adaptation
The system SHALL properly handle safe area insets on all mobile pages to ensure content is not obscured by device notches, status bars, or home indicators.

#### Scenario: Content visible on devices with notches
- **WHEN** a user views a page on a device with a notch (e.g., iPhone X+)
- **THEN** top content is not hidden behind the status bar
- **AND** bottom content is not hidden behind the home indicator
- **AND** safe area insets are properly applied

#### Scenario: Content visible on devices without notches
- **WHEN** a user views a page on a device without a notch
- **THEN** content is properly spaced from screen edges
- **AND** safe area insets default to appropriate values

### Requirement: Mobile Component Design Standards
The system SHALL provide standardized mobile component designs with defined sizes, styles, and interaction patterns.

#### Scenario: Button follows mobile design standards
- **WHEN** a button is rendered on mobile
- **THEN** it meets minimum touch target size (44x44px)
- **AND** it uses appropriate visual style (flat, simple, tech-forward)
- **AND** it provides proper touch feedback (active:scale-95)
- **AND** it follows spacing and typography guidelines

#### Scenario: Form input follows mobile design standards
- **WHEN** a form input is rendered on mobile
- **THEN** it has appropriate size for mobile interaction
- **AND** it has proper spacing from other elements
- **AND** it handles keyboard appearance correctly
- **AND** it follows visual style guidelines
