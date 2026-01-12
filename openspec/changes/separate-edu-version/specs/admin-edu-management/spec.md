# Admin Education Platform Management Specification

## ADDED Requirements

### Requirement: Admin Backend Education Service Communication
Admin backend SHALL communicate with education backend through HTTP REST API calls, not by directly accessing the education database.

#### Scenario: Admin backend HTTP client configuration
- **WHEN** admin backend starts
- **THEN** it SHALL have configuration for education backend base URL in `admin/backend/src/main/resources/application.yml`
- **AND** it SHALL use Spring RestTemplate or WebClient for HTTP calls
- **AND** connection timeout and retry policies SHALL be configured

#### Scenario: Admin backend edu service client
- **WHEN** admin backend needs to access education data
- **THEN** it SHALL use `EduBackendClient` for HTTP calls
- **AND** HTTP calls SHALL be made to education backend API endpoints
- **AND** responses SHALL be mapped to admin DTOs
- **AND** errors SHALL be handled with `EduBackendException`

#### Scenario: No direct database access
- **WHEN** admin backend accesses education data
- **THEN** it SHALL NOT directly connect to `heartsphere_edu` database
- **AND** it SHALL NOT use education backend repositories
- **AND** all data access SHALL go through HTTP API calls

### Requirement: Student Management Service
Admin backend SHALL provide complete student management functionality through `AdminEduStudentService`.

#### Scenario: List students with filters
- **WHEN** admin requests student list with filters
- **THEN** `AdminEduStudentService.getStudents()` SHALL call GET `/api/edu/students` endpoint
- **AND** it SHALL support pagination parameters (page, size)
- **AND** it SHALL support search by name or username
- **AND** it SHALL support filtering by age group (6-12, 13-18)
- **AND** it SHALL support filtering by school name
- **AND** it SHALL return `Page<AdminEduStudentDTO>`

#### Scenario: Get student details
- **WHEN** admin requests student details by ID
- **THEN** `AdminEduStudentService.getStudentById()` SHALL call GET `/api/edu/students/{id}` endpoint
- **AND** it SHALL return `AdminEduStudentDTO` with complete student information
- **AND** if student not found, it SHALL throw appropriate exception

#### Scenario: Update student information
- **WHEN** admin updates student information
- **THEN** `AdminEduStudentService.updateStudent()` SHALL call PUT `/api/edu/students/{id}` endpoint
- **AND** it SHALL send `AdminEduStudentDTO` in request body
- **AND** it SHALL return updated `AdminEduStudentDTO`
- **AND** it SHALL validate input data before sending request

#### Scenario: Update student status
- **WHEN** admin enables or disables student account
- **THEN** `AdminEduStudentService.updateStudentStatus()` SHALL call PATCH `/api/edu/students/{id}/status` endpoint
- **AND** it SHALL send status boolean in request body
- **AND** it SHALL return updated `AdminEduStudentDTO`
- **AND** disabled students SHALL NOT be able to login

#### Scenario: Delete student account
- **WHEN** admin deletes student account
- **THEN** `AdminEduStudentService.deleteStudent()` SHALL call DELETE `/api/edu/students/{id}` endpoint
- **AND** deletion SHALL be soft delete (set deleted_at timestamp)
- **AND** student data SHALL be retained for historical records

#### Scenario: Get student statistics
- **WHEN** admin requests student statistics
- **THEN** `AdminEduStudentService.getStudentStatistics()` SHALL call GET `/api/edu/students/{id}/statistics` endpoint
- **AND** it SHALL return Map containing learning records count, homework submitted count, scenes created count, characters created count, and counseling sessions count

### Requirement: Teacher Management Service
Admin backend SHALL provide complete teacher management functionality through `AdminEduTeacherService`.

#### Scenario: List teachers with filters
- **WHEN** admin requests teacher list with filters
- **THEN** `AdminEduTeacherService.getTeachers()` SHALL call GET `/api/edu/teachers` endpoint
- **AND** it SHALL support pagination parameters
- **AND** it SHALL support search by name or email
- **AND** it SHALL support filtering by status (pending, approved, rejected)
- **AND** it SHALL return `Page<AdminEduTeacherDTO>`

#### Scenario: Approve teacher application
- **WHEN** admin approves a teacher application
- **THEN** `AdminEduTeacherService.approveTeacher()` SHALL call POST `/api/edu/teachers/{id}/approve` endpoint
- **AND** teacher status SHALL be updated to "approved"
- **AND** teacher SHALL receive approval notification
- **AND** it SHALL return updated `AdminEduTeacherDTO`

#### Scenario: Reject teacher application
- **WHEN** admin rejects a teacher application
- **THEN** `AdminEduTeacherService.rejectTeacher()` SHALL call POST `/api/edu/teachers/{id}/reject` endpoint
- **AND** it SHALL send rejection reason in request body
- **AND** teacher status SHALL be updated to "rejected"
- **AND** teacher SHALL receive rejection notification with reason
- **AND** it SHALL return updated `AdminEduTeacherDTO`

#### Scenario: Update teacher permissions
- **WHEN** admin updates teacher permissions
- **THEN** `AdminEduTeacherService.updateTeacherPermissions()` SHALL call PATCH `/api/edu/teachers/{id}/permissions` endpoint
- **AND** it SHALL send permissions map in request body
- **AND** permissions SHALL include course management, student management, content management, etc.
- **AND** it SHALL return updated `AdminEduTeacherDTO`

### Requirement: Content Management Service
Admin backend SHALL provide content review and management functionality through `AdminEduContentService`.

#### Scenario: Get content review queue
- **WHEN** admin requests content review queue
- **THEN** `AdminEduContentService.getReviewQueue()` SHALL call GET `/api/edu/content/review-queue` endpoint
- **AND** it SHALL support pagination parameters
- **AND** it SHALL support filtering by content type (scene, character)
- **AND** it SHALL support filtering by status (pending, approved, rejected)
- **AND** it SHALL return `Page<AdminEduContentDTO>` sorted by submission time

#### Scenario: Approve content
- **WHEN** admin approves content
- **THEN** `AdminEduContentService.approveContent()` SHALL call POST `/api/edu/content/{id}/approve` endpoint
- **AND** content status SHALL be updated to "approved"
- **AND** content SHALL be visible to appropriate users
- **AND** creator SHALL receive approval notification

#### Scenario: Reject content
- **WHEN** admin rejects content
- **THEN** `AdminEduContentService.rejectContent()` SHALL call POST `/api/edu/content/{id}/reject` endpoint
- **AND** it SHALL send rejection reason in request body
- **AND** content status SHALL be updated to "rejected"
- **AND** content SHALL NOT be visible to users
- **AND** creator SHALL receive rejection notification with reason

### Requirement: Analytics Service
Admin backend SHALL provide education platform analytics functionality through `AdminEduAnalyticsService`.

#### Scenario: Get user growth statistics
- **WHEN** admin requests user growth statistics
- **THEN** `AdminEduAnalyticsService.getUserGrowthStats()` SHALL call GET `/api/edu/analytics/user-growth` endpoint
- **AND** it SHALL support date range parameters
- **AND** it SHALL return statistics by user type (student, teacher, parent)
- **AND** it SHALL return growth trends over time

#### Scenario: Get learning time statistics
- **WHEN** admin requests learning time statistics
- **THEN** `AdminEduAnalyticsService.getLearningTimeStats()` SHALL call GET `/api/edu/analytics/learning-time` endpoint
- **AND** it SHALL support date range parameters
- **AND** it SHALL return average learning time per day/week/month
- **AND** it SHALL return statistics by age group and subject

#### Scenario: Get activity distribution
- **WHEN** admin requests activity distribution
- **THEN** `AdminEduAnalyticsService.getActivityDistribution()` SHALL call GET `/api/edu/analytics/activity-distribution` endpoint
- **AND** it SHALL return distribution of activities (AI chat, scene creation, homework, counseling, etc.)
- **AND** it SHALL support date range parameters

#### Scenario: Get homework completion rate
- **WHEN** admin requests homework completion rate
- **THEN** `AdminEduAnalyticsService.getHomeworkCompletionRate()` SHALL call GET `/api/edu/analytics/homework-completion` endpoint
- **AND** it SHALL support date range parameters
- **AND** it SHALL return completion rate by subject, grade level, and time period

### Requirement: Admin Frontend Education Management Interface
Admin frontend SHALL provide user interface for education platform management.

#### Scenario: Students management page
- **WHEN** admin navigates to students management
- **THEN** `StudentsManagePage.tsx` SHALL display student list with pagination
- **AND** it SHALL provide search and filter functionality
- **AND** it SHALL allow viewing, editing, enabling/disabling, and deleting students
- **AND** it SHALL display student statistics on detail view
- **AND** it SHALL handle loading states and errors gracefully

#### Scenario: Teachers management page
- **WHEN** admin navigates to teachers management
- **THEN** `TeachersManagePage.tsx` SHALL display teacher list with pagination
- **AND** it SHALL provide search and filter functionality
- **AND** it SHALL allow approving, rejecting, and updating teachers
- **AND** it SHALL allow updating teacher permissions
- **AND** it SHALL handle loading states and errors gracefully

#### Scenario: Content management page
- **WHEN** admin navigates to content management
- **THEN** `ContentManagePage.tsx` SHALL display content review queue
- **AND** it SHALL provide filtering by type and status
- **AND** it SHALL allow approving and rejecting content with reason
- **AND** it SHALL display content preview
- **AND** it SHALL handle loading states and errors gracefully

#### Scenario: Analytics page
- **WHEN** admin navigates to analytics
- **THEN** `AnalyticsPage.tsx` SHALL display analytics dashboard
- **AND** it SHALL show user growth charts
- **AND** it SHALL show learning time statistics
- **AND** it SHALL show activity distribution charts
- **AND** it SHALL show homework completion rate
- **AND** it SHALL support date range selection
- **AND** it SHALL handle loading states and errors gracefully

#### Scenario: Admin navigation integration
- **WHEN** admin logs into admin system
- **THEN** AdminSidebar SHALL include "Education Management" menu section
- **AND** menu SHALL include links to Students, Teachers, Content, and Analytics pages
- **AND** navigation SHALL work correctly with routing

### Requirement: Error Handling and Resilience
Admin edu management services SHALL handle errors and service unavailability gracefully.

#### Scenario: Education backend unavailable
- **WHEN** education backend is unavailable
- **THEN** admin services SHALL catch connection exceptions
- **AND** admin frontend SHALL display user-friendly error message
- **AND** error SHALL be logged for monitoring
- **AND** admin SHALL be able to retry the operation

#### Scenario: Invalid API response
- **WHEN** education backend returns invalid response
- **THEN** admin services SHALL validate response structure
- **AND** admin frontend SHALL display error message
- **AND** error details SHALL be logged for debugging

#### Scenario: Timeout handling
- **WHEN** API call times out
- **THEN** admin services SHALL respect configured timeout
- **AND** timeout SHALL be handled gracefully
- **AND** admin frontend SHALL display timeout error message
