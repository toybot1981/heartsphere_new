# Membership Management Spec Delta

## ADDED Requirements

### Requirement: Trial Membership Type

The system **SHALL** provide a Trial Membership type specifically for guest users, with limited token quotas.

#### Scenario: Trial Membership Configuration
1. System has Trial Membership record in database
2. Trial Membership has:
   - Type: "TRIAL"
   - Text Token Quota: 10,000
   - Image Token Quota: 0
   - Video Token Quota: 0
   - All other quotas: 0
3. Trial Membership is assigned to all guest users automatically

#### Scenario: Guest Token Allocation
1. Guest user logs in
2. System assigns Trial Membership
3. System initializes user's token balances:
   - Text tokens: 10,000
   - Image tokens: 0
   - Video tokens: 0
4. User can use tokens for AI conversations

#### Scenario: Guest Token Exhaustion
1. Guest user consumes all 10,000 text tokens
2. User attempts to send another message
3. System checks token balance
4. System returns error: "Token配额已用完，请注册正式用户以获得更多配额"
5. System suggests registration

## MODIFIED Requirements

### Requirement: Membership Assignment

The membership assignment logic **SHALL** automatically assign Trial Membership to guest users.

#### Scenario: Automatic Trial Assignment
1. Guest user account is created
2. System finds Trial Membership by type "TRIAL"
3. System creates membership association for new user
4. System initializes token balances according to Trial Membership quotas
