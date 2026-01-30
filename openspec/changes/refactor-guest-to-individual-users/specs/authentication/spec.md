# Authentication Spec Delta

## MODIFIED Requirements

### Requirement: Guest User Login

The system **SHALL** create a new temporary user account for each guest login, instead of reusing a fixed guest user account.

#### Scenario: Individual Guest User Creation
- **WHEN** a user requests guest login via `POST /api/auth/guest-login`
- **THEN** the system creates a new temporary user account with username format `guest_<timestamp>_<random>`
- **AND** the system ensures username uniqueness (retries if conflict)
- **AND** the system creates an independent membership record for the new user
- **AND** the system allocates independent token quota (10,000 text tokens) for the new user
- **AND** the system returns authentication token and user information

#### Scenario: Guest User Uniqueness
- **WHEN** creating a guest user with username `guest_<timestamp>_<random>`
- **AND** the username already exists in the database
- **THEN** the system generates a new username with different timestamp/random
- **AND** the system retries up to 10 times
- **AND** if all retries fail, the system returns an error

#### Scenario: Guest User Identification
- **WHEN** the system needs to identify a temporary user
- **THEN** it checks if the username starts with `guest_`
- **AND** if true, the user is considered a temporary guest user

## ADDED Requirements

### Requirement: Temporary User Account Management

The system **SHALL** manage temporary user accounts independently, with each guest having their own account, membership, and quota.

#### Scenario: Independent User Accounts
- **WHEN** multiple guests log in simultaneously
- **THEN** each guest receives a separate user account
- **AND** each guest has an independent membership record
- **AND** each guest has independent token quota
- **AND** quota usage does not affect other guests

#### Scenario: Data Isolation
- **WHEN** a guest user interacts with the system
- **THEN** all conversation records and usage data are isolated to that specific guest user
- **AND** data from one guest is not visible to other guests

#### Scenario: Guest User Upgrade
- **WHEN** a temporary guest user upgrades to a registered user
- **THEN** the system updates the user account information (username, email, etc.)
- **AND** the system upgrades the membership type from trial to the selected plan
- **AND** all conversation records and data are preserved and associated with the upgraded account
