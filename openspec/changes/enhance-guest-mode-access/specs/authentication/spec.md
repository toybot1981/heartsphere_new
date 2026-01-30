# Authentication Spec Delta

## ADDED Requirements

### Requirement: Guest User Auto-Creation

**SHALL** automatically create a temporary user account when a user chooses guest mode, instead of just marking them as a guest on the frontend.

#### Scenario: Guest Login Flow
1. User clicks "Enter as Guest" button
2. Frontend calls `POST /api/auth/guest-login` (独立接口，不同于正式用户登录)
3. System generates unique guest username (e.g., `guest_<timestamp>_<random>`)
4. System creates User entity with guest flag
5. System assigns Trial Membership to the user
6. **System does NOT initialize personal eras/characters** (guest uses system presets)
7. System generates JWT token
8. System returns token and user info to frontend
9. Frontend saves token and sets user as logged in
10. Frontend uses hardcoded preset era (ID: 50) and characters (ID: 315-320)

#### Scenario: Guest Username Uniqueness
1. System generates guest username
2. System checks if username already exists
3. If exists, generates new username with different random suffix
4. Repeats until unique username is found

### Requirement: Guest-to-Registered User Upgrade

**SHALL** allow guest users to upgrade to registered users while preserving their data.

#### Scenario: Guest Registration Upgrade
1. Guest user clicks "Register as Full User" button
2. Frontend calls `POST /api/auth/guest-register` (独立接口，不同于正式用户注册)
3. User enters username, password, email
4. System detects current user is guest (Trial membership)
5. System updates existing user record:
   - Updates username, password, email
   - Updates membership from Trial to selected/default membership
6. **System initializes personal eras and characters** (first time creation)
7. System generates new JWT token
8. System returns updated user info and token
9. Frontend re-authenticates with new credentials
10. Frontend shows initialization wizard for new registered user

#### Scenario: Guest Data Preservation
1. Guest user has conversation history
2. Guest user upgrades to registered user
3. All conversation records remain linked to same user ID
4. User can access all previous conversations after upgrade

## MODIFIED Requirements

### Requirement: Authentication Endpoint Enhancement

The authentication system **SHALL** support guest login and guest-to-registered upgrade.

#### Scenario: Guest Login Endpoint
- **Endpoint**: `POST /api/auth/guest-login` (独立接口，与正式用户登录 `/api/auth/login` 分离)
- **Request**: Optional nickname parameter
- **Behavior**: 
  - Creates temporary user account
  - Assigns Trial Membership
  - **Does NOT initialize personal eras/characters**
- **Response**: 
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": 123,
      "username": "guest_1234567890_abc",
      "isGuest": true
    },
    "membership": {
      "type": "TRIAL",
      "textTokenQuota": 10000
    },
    "presetEraId": 50,
    "presetCharacterIds": [315, 316, 317, 318, 319, 320]
  }
  ```

#### Scenario: Guest Register Endpoint
- **Endpoint**: `POST /api/auth/guest-register` (独立接口，与正式用户注册 `/api/auth/register` 分离)
- **Request**: username, password, email (current token identifies guest user)
- **Behavior**: 
  - Checks current user is guest (Trial membership)
  - Updates existing user account (username, password, email)
  - Upgrades membership from Trial to selected/default
  - **Initializes personal eras and characters** (first time)
- **Response**: Updated user info and new token
