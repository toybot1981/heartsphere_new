# Theme Management Specification

## Overview

The theme management system allows users to switch between different visual styles (themes/skins) for the HeartSphere application. The system supports multiple themes, including the current "Tech Style" and the new "Serene Horizon" style, and applies consistently across both PC and mobile platforms.

## ADDED Requirements

### Requirement: Theme System Infrastructure
The system SHALL provide a theme management infrastructure that supports multiple visual themes.

#### Scenario: Theme System Initialization
- **Given** the application starts
- **When** the ThemeProvider initializes
- **Then** it SHALL load the user's saved theme preference from localStorage
- **And** if no preference exists, it SHALL use the default "Tech Style" theme
- **And** it SHALL apply the theme to the document root element via `data-theme` attribute

#### Scenario: Theme Persistence
- **Given** a user selects a theme
- **When** the theme is changed
- **Then** the selection SHALL be saved to localStorage
- **And** the theme SHALL persist across page refreshes and browser sessions

### Requirement: Theme Definitions
The system SHALL support at least two predefined themes: "Tech Style" and "Serene Horizon".

#### Scenario: Tech Style Theme
- **Given** the "Tech Style" theme is active
- **When** the application renders
- **Then** it SHALL use dark backgrounds (black, dark purple, indigo)
- **And** it SHALL use high contrast text colors (white, light gray)
- **And** it SHALL maintain the current tech-focused aesthetic

#### Scenario: Serene Horizon Theme
- **Given** the "Serene Horizon" theme is active
- **When** the application renders
- **Then** it SHALL use light blue backgrounds (#E8F4F8, #BFD9E8, #9FC9E0)
- **And** it SHALL use dark blue-gray text colors (#2C3E50, #5A6C7D)
- **And** it SHALL create a calm, peaceful, and relaxing visual experience
- **And** it SHALL align with the design concept: "the tranquility of sea and sky, the connection of stars"

### Requirement: Theme Switching
Users SHALL be able to switch between available themes at runtime.

#### Scenario: Theme Switch from Settings
- **Given** a user is on the settings page
- **When** the user selects a different theme from the theme selector
- **Then** the theme SHALL change immediately without page refresh
- **And** all UI elements SHALL update to reflect the new theme
- **And** the selection SHALL be saved to localStorage
- **And** the theme change SHALL include a smooth transition animation

#### Scenario: Theme Switch Persistence
- **Given** a user has selected a theme
- **When** the user refreshes the page or returns to the application
- **Then** the previously selected theme SHALL be restored automatically

#### Scenario: Theme Switch Transition Animation
- **Given** a user switches themes
- **When** the theme change occurs
- **Then** color changes SHALL be animated smoothly (using CSS transitions)
- **And** the transition duration SHALL be between 200ms and 300ms
- **And** the animation SHALL not cause performance issues or jank

### Requirement: CSS Variable System
The system SHALL use CSS Custom Properties (CSS variables) to implement theme switching.

#### Scenario: CSS Variable Application
- **Given** a theme is active
- **When** CSS variables are defined for that theme
- **Then** all components SHALL reference CSS variables instead of hardcoded colors
- **And** the CSS variables SHALL be scoped to `:root[data-theme="<theme-id>"]`
- **And** changing the `data-theme` attribute SHALL switch all CSS variables instantly

#### Scenario: Design Tokens Coverage
- **Given** a theme definition
- **When** CSS variables are generated
- **Then** they SHALL include all design tokens:
  - Background colors (primary, secondary, card, overlay)
  - Text colors (primary, secondary, tertiary, disabled, link, accent)
  - Primary colors (main, light, lighter, lightest)
  - Semantic colors (success, warning, error, info)
  - Shadows (sm, md, lg, primary)
  - Border radius (sm, md, lg, xl, full)

### Requirement: PC Platform Support
The theme system SHALL work consistently across all PC platform components.

#### Scenario: PC Component Theme Application
- **Given** a theme is active
- **When** PC platform components render
- **Then** they SHALL use CSS variables from the active theme
- **And** they SHALL not use hardcoded color values
- **And** all visual elements SHALL reflect the selected theme

#### Scenario: PC Settings Integration
- **Given** a user is on the PC platform
- **When** the user opens the settings modal
- **Then** it SHALL display a theme selector
- **And** the theme selector SHALL show available themes with previews (thumbnails or live preview)
- **And** each theme preview SHALL display key visual elements (background color, text color, primary color)
- **And** selecting a theme SHALL immediately apply it to the PC interface

### Requirement: Mobile Platform Support
The theme system SHALL work consistently across all mobile platform components.

#### Scenario: Mobile Component Theme Application
- **Given** a theme is active
- **When** mobile platform components render
- **Then** they SHALL use CSS variables from the active theme
- **And** they SHALL not use hardcoded color values
- **And** all visual elements SHALL reflect the selected theme

#### Scenario: Mobile Serene Horizon Implementation
- **Given** the "Serene Horizon" theme is active
- **When** mobile platform components render
- **Then** they SHALL implement the design specifications from the mobile UI redesign document
- **And** scene selection pages SHALL use light blue cloud-patterned backgrounds
- **And** scene cards SHALL be large rounded white floating cards
- **And** the connection space SHALL use immersive starry backgrounds
- **And** bottom navigation SHALL use semi-transparent white with Clear Sky Blue icons

#### Scenario: Mobile Settings Integration
- **Given** a user is on the mobile platform
- **When** the user opens the mobile settings modal
- **Then** it SHALL display a theme selector
- **And** the theme selector SHALL show available themes with previews (mobile-optimized)
- **And** each theme preview SHALL be optimized for mobile screens (appropriate size, touch-friendly)
- **And** selecting a theme SHALL immediately apply it to the mobile interface

### Requirement: Theme Context API
The system SHALL provide a React Context API for theme management.

#### Scenario: Theme Context Usage
- **Given** a component needs theme information
- **When** the component uses the `useTheme` hook
- **Then** it SHALL receive the current theme object
- **And** it SHALL receive a function to change the theme
- **And** it SHALL receive a list of available themes

#### Scenario: Theme Provider Integration
- **Given** the application root component
- **When** the ThemeProvider is mounted
- **Then** it SHALL wrap the application
- **And** it SHALL provide theme context to all child components
- **And** it SHALL initialize the theme on mount

### Requirement: Backward Compatibility
The system SHALL maintain backward compatibility with existing code.

#### Scenario: Default Theme
- **Given** no theme preference is saved
- **When** the application initializes
- **Then** it SHALL default to "Tech Style" theme
- **And** existing users SHALL see no visual change unless they explicitly switch themes

#### Scenario: Legacy Theme Support
- **Given** a user has the old `[data-theme="dark"]` attribute
- **When** the application initializes
- **Then** it SHALL map to the "Tech Style" theme (`data-theme="tech"`)
- **And** the old theme attribute SHALL be updated to the new format

#### Scenario: Component Migration
- **Given** components with hardcoded colors
- **When** migrating to the theme system
- **Then** they SHALL continue to work with the default theme
- **And** they SHALL be gradually migrated to use CSS variables

### Requirement: Error Handling
The system SHALL handle errors gracefully and provide fallback behavior.

#### Scenario: LocalStorage Unavailable
- **Given** localStorage is not available (e.g., private browsing mode)
- **When** the application tries to save or load theme preference
- **Then** it SHALL use in-memory storage instead
- **And** the theme preference SHALL work for the current session
- **And** the application SHALL continue to function normally

#### Scenario: Theme Definition Load Failure
- **Given** a theme definition file fails to load
- **When** the application initializes
- **Then** it SHALL fall back to the default "Tech Style" theme
- **And** it SHALL log a warning to the console
- **And** the application SHALL continue to function normally

#### Scenario: Invalid Theme ID
- **Given** a user has an invalid theme ID saved in localStorage
- **When** the application tries to apply the theme
- **Then** it SHALL validate the theme ID
- **And** if invalid, it SHALL fall back to the default "Tech Style" theme
- **And** it SHALL update localStorage with the valid theme ID

#### Scenario: CSS Variable Missing
- **Given** a CSS variable is not defined for a theme
- **When** a component tries to use that variable
- **Then** it SHALL use a fallback value
- **And** the component SHALL render correctly (though possibly with default styling)

### Requirement: Performance
The theme system SHALL perform efficiently without causing performance issues.

#### Scenario: Theme Switch Performance
- **Given** a user switches themes
- **When** the theme change occurs
- **Then** the update SHALL complete within 100ms
- **And** it SHALL not cause frame drops or jank
- **And** it SHALL use efficient DOM updates (e.g., requestAnimationFrame)

#### Scenario: Large Component Tree Update
- **Given** a page with many components
- **When** the theme is switched
- **Then** all components SHALL update efficiently
- **And** the update SHALL not cause noticeable lag
- **And** CSS variables SHALL be used to minimize JavaScript work

### Requirement: Theme Preview
Users SHALL be able to preview themes before applying them.

#### Scenario: Theme Preview Display
- **Given** a user is on the settings page
- **When** the theme selector is displayed
- **Then** each theme SHALL show a preview (thumbnail or live preview)
- **And** the preview SHALL display key visual elements (background, text, primary color)
- **And** the preview SHALL be clear and representative of the theme

#### Scenario: Theme Preview Interaction
- **Given** a theme preview is displayed
- **When** a user hovers over (PC) or taps (mobile) the preview
- **Then** the preview SHALL provide visual feedback
- **And** on PC, hovering MAY show a larger preview or tooltip

## MODIFIED Requirements

### Requirement: Component Color Usage
All components SHALL use CSS variables instead of hardcoded colors.

#### Scenario: Component Color Migration
- **Given** a component with hardcoded colors
- **When** migrating to the theme system
- **Then** hardcoded color values SHALL be replaced with CSS variable references
- **And** the component SHALL work correctly with all available themes

## Notes

- Theme definitions are stored in TypeScript files for type safety
- CSS variables are generated from theme definitions
- Theme switching is instant and does not require page refresh
- Theme preferences are stored in localStorage with key `heartsphere-theme`
- The system is designed to be extensible for future theme additions
- Theme IDs use kebab-case naming convention (e.g., `tech`, `serene-horizon`)
- The system maintains backward compatibility with the existing `[data-theme="dark"]` attribute
- Theme transitions use CSS transitions for smooth color changes (200-300ms duration)
- Error handling ensures the application continues to function even if theme operations fail
