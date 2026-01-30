# Membership Management Spec Delta

## MODIFIED Requirements

### Requirement: Trial Membership Assignment

The system **SHALL** create an independent trial membership record for each temporary guest user, instead of sharing a single membership record.

#### Scenario: Independent Membership Creation
- **WHEN** a new temporary guest user is created
- **THEN** the system creates a new membership record in the `memberships` table
- **AND** the membership is associated with the new guest user's ID
- **AND** the membership type is set to `trial`
- **AND** the membership plan ID references the trial subscription plan
- **AND** the membership status is set to `active`

#### Scenario: Independent Quota Allocation
- **WHEN** a trial membership is created for a guest user
- **THEN** the system allocates 10,000 text tokens to that specific user
- **AND** the quota is tracked independently in the user's membership record
- **AND** quota usage does not affect other guest users' quotas

#### Scenario: Quota Isolation
- **WHEN** multiple guest users use the system simultaneously
- **THEN** each guest user's token consumption is tracked separately
- **AND** when one guest user exhausts their quota, other guests are not affected
- **AND** each guest user can only use their own allocated quota

## ADDED Requirements

### Requirement: Per-User Quota Tracking

The system **SHALL** track token quota usage independently for each temporary guest user.

#### Scenario: Independent Quota Tracking
- **WHEN** a guest user consumes tokens
- **THEN** the system deducts tokens from that specific user's membership record
- **AND** the deduction does not affect other users' quotas
- **AND** the system accurately tracks remaining quota for each user

#### Scenario: Quota Exhaustion Handling
- **WHEN** a guest user's text token quota is exhausted
- **THEN** the system prevents that specific user from making further requests
- **AND** the system returns an error message suggesting registration
- **AND** other guest users can continue using their remaining quota
