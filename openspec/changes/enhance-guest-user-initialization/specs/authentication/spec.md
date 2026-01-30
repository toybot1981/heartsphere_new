# Authentication Spec Delta

## MODIFIED Requirements

### Requirement: Guest User Login

The system **SHALL** accept a single guest name on guest entry; that name is used as the user's nickname and to form the username (e.g. `guest_<name>_<unique_suffix>`). If an existing guest user with that name is found, the system **SHALL** return that user's token (re-entry); otherwise the system **SHALL** create a new temporary user, membership, and default scene/character data. When registering from a guest account, the system **SHALL** allow the username and nickname to be changed once.

#### Scenario: Guest Entry With Name Only
- **WHEN** a user requests guest login via `POST /api/auth/guest-login` with a guest name (e.g. in request body as `nickname`)
- **THEN** that name is used as the user's **nickname**
- **AND** that name is used to **form the username** (e.g. `guest_<name>_<unique_suffix>`), ensuring uniqueness
- **AND** the system returns authentication token and user information

#### Scenario: Re-Entry By Same Name
- **WHEN** a user requests guest login via `POST /api/auth/guest-login` with a guest name
- **AND** an existing guest user exists whose nickname equals that name (and who is a trial member / temporary user)
- **THEN** the system does not create a new user
- **AND** the system returns the existing user's authentication token so the user enters that guest account directly
- **AND** existing world, era, character data and token quota for that guest are preserved

#### Scenario: New Guest User Creation
- **WHEN** a user requests guest login via `POST /api/auth/guest-login` with a guest name
- **AND** no existing guest user is found for that name
- **THEN** the system creates a new temporary user with nickname equal to the guest name and username derived from it (e.g. `guest_<name>_<unique_suffix>`)
- **AND** the system creates an independent membership record and allocates independent token quota (10,000 text tokens)
- **AND** the system creates in the database one default world, one default era (system preset "日常生活助手", system_era_id=50), and six characters (system preset ids 315–320)
- **AND** the system returns authentication token and user information

#### Scenario: Guest User Uniqueness
- **WHEN** creating a new guest user with username derived from the guest name
- **AND** the generated username already exists in the database
- **THEN** the system generates a new username with a different unique suffix
- **AND** the system retries as needed (e.g. up to 10 times) or uses a sufficiently unique suffix so that the username is unique
- **AND** if uniqueness cannot be achieved, the system returns an error

#### Scenario: Guest User Identification
- **WHEN** the system needs to identify a temporary user
- **THEN** it checks if the username starts with `guest_`
- **AND** if true, the user is considered a temporary guest user

#### Scenario: Register From Guest — Username and Nickname Editable Once
- **WHEN** a guest user registers via the guest-register (or equivalent) flow
- **THEN** the system allows the user to set a new **username** and a new **nickname** in the registration request
- **AND** the system updates the account with the new username and nickname (each editable once at registration), replacing the previous guest username and nickname
- **AND** membership is upgraded from trial to the selected plan and all data remains associated with the account

## ADDED Requirements

### Requirement: Guest Default Scene and Characters

The system **SHALL** create for each new guest user, at the time of guest login, default world, era, and character records in the database so that the guest has the same data shape as a regular user (one world, one era, six characters).

#### Scenario: Default World and Era Created
- **WHEN** a guest user is created via guest login
- **THEN** the system creates exactly one world record for that user (e.g. name "心域")
- **AND** the system creates exactly one era record for that user, linked to that world and to the system preset "日常生活助手" (system_era_id=50)
- **AND** the era content (name, description, style, etc.) is copied from the system_eras record with id=50

#### Scenario: Six Default Characters Created
- **WHEN** a guest user is created via guest login
- **THEN** the system creates exactly six character records for that user, linked to the guest's world and era
- **AND** the character content is copied from the system_characters records (e.g. ids 315–320: 时小光、康小健、学小知、心小暖、心小安、暖小阳)
- **AND** each character has era_id pointing to the guest's default era so that list APIs and frontend grouping work correctly

#### Scenario: Idempotent Guest Initialization
- **WHEN** guest initialization runs for a user who already has at least one world (or era) record
- **THEN** the system does not create duplicate world, era, or character records for that user
- **AND** existing data for that user remains unchanged
