# Real World Journal Specification

## ADDED Requirements

### Requirement: Date Range Quick Filters
The Real World journal SHALL support quick date-range filters (今日 / 本周 / 本月, and optionally 自定义) so that users can narrow the list to entries within a chosen period. Filters SHALL work together with existing keyword search and tag filters.

#### Scenario: Filter by today
- **WHEN** user selects the "今日" quick filter
- **THEN** the journal list shows only entries whose `entryDate` falls on the current local date
- **AND** keyword search and tag filter still apply to the resulting list

#### Scenario: Filter by week and month
- **WHEN** user selects "本周" or "本月"
- **THEN** the list shows only entries within the current week or month (local timezone)
- **AND** week boundaries (e.g. Monday–Sunday) are consistent and documented

### Requirement: Journal List Grouping and Sorting
The Real World journal list SHALL support grouping by date (by day or by week) and sorting (by journal date or by last updated). The default sort SHALL be by journal date descending.

#### Scenario: Group by day
- **WHEN** user enables "按日" grouping
- **THEN** entries are displayed in groups by `entryDate`
- **AND** each group has a clear date heading (e.g. "2025-01-15")
- **AND** within each group, entries follow the active sort order

#### Scenario: Sort by journal date vs updated time
- **WHEN** user switches sort to "按更新时间"
- **THEN** the list (and within-group order) is ordered by `updatedAt` descending
- **AND** when "按日记日期" is selected, order is by `entryDate` descending

### Requirement: Quick "Write Today" Entry
The Real World SHALL provide a "写今日" (or equivalent) quick action that creates a new journal entry with `entryDate` set to the current local date, and optionally prefilled title or template content.

#### Scenario: Create today's entry via quick action
- **WHEN** user clicks "写今日"
- **THEN** the create form opens with `entryDate` set to today
- **AND** title may be prefilled (e.g. "今日") or left empty
- **AND** user can type content and save as a normal journal entry

#### Scenario: Create today's entry from template
- **WHEN** user chooses "从模板写今日" and selects a template
- **THEN** a new entry is created with `entryDate` as today and title/content prefilled from the template
- **AND** user can edit and save as usual

### Requirement: Default Entry Date for New Entries
All new journal entries SHALL default `entryDate` to the current local date, unless explicitly overridden by the user.

#### Scenario: New entry default date
- **WHEN** user creates a new journal entry (via any entry point)
- **THEN** `entryDate` is initially set to today
- **AND** user can change it when editing if needed

### Requirement: Journal Optimizations on Mobile
The same journal optimizations (date filters, grouping, sorting, "写今日", template shortcuts, default `entryDate`) SHALL be available in the Mobile Real World screen, with UI adapted for mobile (e.g. compact filters, touch-friendly controls).

#### Scenario: Mobile date filter and quick write
- **WHEN** user opens the Real World journal on mobile
- **THEN** date quick filters and "写今日" are available
- **AND** behavior matches PC (same filters, same default date, same template flow) with mobile-appropriate layout
