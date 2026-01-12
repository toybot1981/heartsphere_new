# Design: HeartSphere Education Edition

## Context

HeartSphere Education Edition is a separate, independent system built on top of HeartSphere's core capabilities. It targets K-12 students (elementary and middle school) to learn and apply AI in an engaging, educational way. The system needs to be:

1. **Independent**: Separate frontend, backend, and admin codebases
2. **Isolated**: Independent database and deployment
3. **Educational**: Age-appropriate content and learning-focused features
4. **Safe**: Child privacy protection, content filtering, and safety mechanisms
5. **Scalable**: Support multiple schools, teachers, students, and parents

## Goals / Non-Goals

### Goals
- Provide a complete, independent education platform
- Enable students to learn AI concepts through hands-on experience
- Support teachers in creating educational content and monitoring students
- Provide parents with visibility and control over their children's usage
- Maintain data isolation from the main HeartSphere system
- Ensure child safety and privacy compliance

### Non-Goals
- Direct integration with main HeartSphere user accounts (optional SSO only)
- Real-time synchronization with main system data
- Full feature parity with main HeartSphere (focus on education-specific features)
- Support for high school or adult learners (future expansion)

## Architecture Decisions

### Decision 1: Monorepo vs Separate Repositories

**Decision**: Use monorepo structure with separate directories (`frontend-edu/`, `backend-edu/`, `admin-edu/`)

**Rationale**:
- Easier code sharing for common utilities and types
- Unified CI/CD pipeline
- Easier dependency management
- Better for small to medium teams

**Alternatives Considered**:
- Separate repositories: Better isolation but harder to share code
- Single codebase with feature flags: Too complex, risk of coupling

### Decision 2: Database Strategy

**Decision**: Use separate database schema with `edu_` table prefix, or completely separate database

**Rationale**:
- Complete data isolation for security and compliance
- Easier to manage backups and migrations independently
- Clear separation of concerns
- Can share database server but maintain logical separation

**Alternatives Considered**:
- Shared database with prefixes: Simpler but less isolation
- Same tables with `user_type` field: Too risky, data mixing concerns

### Decision 3: AI Service Integration

**Decision**: Reuse main HeartSphere AI services via shared library or API calls

**Rationale**:
- Avoid duplicating AI integration code
- Consistent AI behavior across systems
- Easier to maintain and update
- Can add education-specific prompt engineering on top

**Alternatives Considered**:
- Independent AI integration: More work, potential inconsistency
- Direct database access to main system: Breaks isolation principle

### Decision 4: Authentication Strategy

**Decision**: Independent authentication system with optional SSO support

**Rationale**:
- Maintains independence and security
- Can support school SSO systems in future
- Clear user roles (student, teacher, parent, admin)
- No dependency on main system authentication

**Alternatives Considered**:
- Shared authentication: Creates coupling and security concerns
- OAuth integration only: Too complex for initial version

### Decision 5: Content Filtering Approach

**Decision**: Multi-layer content filtering: AI-based filtering + keyword filtering + human review queue

**Rationale**:
- Critical for child safety
- Need both automated and manual review
- Age-appropriate content is non-negotiable
- Must catch edge cases that AI might miss

**Alternatives Considered**:
- AI-only filtering: Too risky, false negatives unacceptable
- Human-only review: Too slow, doesn't scale

### Decision 6: Crisis Detection and Escalation

**Decision**: Automated crisis detection with immediate human escalation protocol

**Rationale**:
- Student safety is paramount
- Must detect self-harm, abuse, or dangerous situations
- Requires immediate human intervention
- Must balance privacy with safety

**Alternatives Considered**:
- AI-only response: Insufficient for crisis situations
- Delayed escalation: Too slow for emergencies

## Technical Patterns

### Frontend Architecture

**Pattern**: Component-based React architecture with feature-based organization

```
frontend-edu/
├── src/
│   ├── pages/           # Route-level pages
│   │   ├── student/     # Student-facing pages
│   │   ├── teacher/     # Teacher-facing pages
│   │   └── parent/      # Parent-facing pages
│   ├── components/      # Reusable components
│   │   ├── learning/    # Learning-specific components
│   │   ├── homework/    # Homework components
│   │   └── counseling/  # Counseling components
│   ├── services/        # API service layer
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts for state
│   └── utils/           # Utility functions
```

**Design Principles**:
- Age-appropriate UI: Larger buttons, simpler navigation for younger students
- Progressive disclosure: Show complexity based on age/grade level
- Accessibility: WCAG AA compliance for all users
- Mobile-first: Support tablets and phones

### Backend Architecture

**Pattern**: Layered architecture with clear separation of concerns

```
backend-edu/
├── controller/    # REST API endpoints
├── service/       # Business logic
├── repository/    # Data access
├── entity/        # JPA entities
├── dto/           # Data transfer objects
└── config/        # Configuration classes
```

**Design Principles**:
- RESTful API design
- Service layer handles business logic
- Repository layer handles data access
- DTOs for API boundaries
- Transaction management at service layer

### Data Model Design

**Key Entities**:
- `Student`: Student profile, age, grade, school
- `Teacher`: Teacher profile, assigned classes
- `Parent`: Parent profile, linked students
- `Course`: Course definition, assignments
- `Homework`: Homework assignments and submissions
- `Scene`: Educational scenes (simplified from main system)
- `Character`: Educational characters (simplified from main system)
- `CounselingSession`: Counseling conversation records
- `EmotionRecord`: Emotional state tracking
- `LearningRecord`: Learning activity tracking

**Relationships**:
- Student belongs to School, has Parents, enrolled in Courses
- Teacher teaches Courses, monitors Students
- Parent monitors Student(s)
- Student creates Scenes and Characters
- Student submits Homework
- Student has CounselingSessions and EmotionRecords

### Security Patterns

1. **Authentication**: JWT tokens with role-based claims
2. **Authorization**: RBAC with fine-grained permissions
3. **Data Isolation**: Row-level security based on user relationships
4. **Content Filtering**: Multi-layer filtering pipeline
5. **Encryption**: Data at rest and in transit
6. **Audit Logging**: All sensitive operations logged
7. **Rate Limiting**: Prevent abuse and ensure fair usage

### AI Integration Pattern

**Pattern**: Service abstraction layer with education-specific prompts

```
AI Service Layer
├── Text Generation (with education prompts)
├── Emotion Analysis (for counseling)
├── Content Filtering (safety)
├── Homework Analysis (educational)
└── Learning Recommendations (personalized)
```

**Prompt Engineering**:
- Age-appropriate language
- Educational focus
- Safety-first responses
- Encouraging and supportive tone

## Risks / Trade-offs

### Risk 1: Data Isolation Complexity
**Risk**: Maintaining true isolation while sharing some infrastructure
**Mitigation**: Clear boundaries, separate schemas, comprehensive testing

### Risk 2: Child Safety and Privacy
**Risk**: Inadequate protection of children's data and safety
**Mitigation**: Compliance review, security audit, content filtering, crisis protocols

### Risk 3: Performance at Scale
**Risk**: System performance degrades with many concurrent students
**Mitigation**: Load testing, caching strategies, horizontal scaling design

### Risk 4: Content Quality
**Risk**: User-generated content may be inappropriate or low quality
**Mitigation**: Multi-layer filtering, teacher oversight, template system

### Risk 5: AI Service Dependency
**Risk**: Dependency on external AI services creates single point of failure
**Mitigation**: Fallback strategies, service monitoring, graceful degradation

### Trade-off: Independence vs Code Reuse
**Trade-off**: More independence means more code duplication
**Decision**: Accept some duplication for better isolation and maintainability

### Trade-off: Safety vs Privacy
**Trade-off**: More safety monitoring may reduce privacy
**Decision**: Balance with clear policies, transparency, and appropriate access controls

## Migration Plan

### Phase 1: Infrastructure Setup
1. Create project structure
2. Set up development environments
3. Configure CI/CD pipelines
4. Set up database schemas

### Phase 2: Core Features
1. User authentication and authorization
2. Basic student/teacher/parent management
3. Age-appropriate content system
4. Basic AI learning tools

### Phase 3: Educational Features
1. Homework assistant
2. Psychological counseling
3. Teacher tools
4. Parent dashboard

### Phase 4: Polish and Launch
1. Security hardening
2. Performance optimization
3. User testing
4. Production deployment

### Rollback Strategy
- Each phase can be rolled back independently
- Database migrations are reversible
- Feature flags for gradual rollout
- Blue-green deployment for zero-downtime updates

## Open Questions

1. **SSO Integration**: Should we support school district SSO systems from day one, or add later?
2. **Offline Support**: Do we need offline capabilities for students with limited internet?
3. **Multi-language**: Should we support multiple languages initially or focus on Chinese?
4. **Gamification Level**: How much gamification (badges, points, leaderboards) is appropriate?
5. **Parent Communication**: What's the best channel for parent notifications (email, SMS, in-app)?
6. **Content Moderation**: Should teachers review all student-created content, or only flagged content?
7. **Data Retention**: How long should we retain student data after they graduate or leave?
