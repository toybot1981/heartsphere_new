# Design: Task Progress Panel in Conversation View

## Context

Users interact with the Mentis AI agent through a conversation interface. When users send messages that require task decomposition (e.g., "帮我查一下明天北京的天气"), the AI agent breaks down the request into multiple executable tasks. Currently, users cannot see these tasks or their execution progress without leaving the conversation view.

## Goals / Non-Goals

### Goals
- Display task decomposition and execution progress within the conversation view
- Provide real-time updates as tasks are executed
- Maintain conversation flow without requiring view switching
- Follow Manus design patterns for consistency

### Non-Goals
- Full task management UI (detailed task editing, cancellation, etc.)
- Task history beyond current session
- Task execution control (pause, resume, cancel) - this is handled elsewhere

## Decisions

### Decision: Collapsible Panel Above Message Input
**Rationale**: 
- Keeps tasks visible but not intrusive
- Follows Manus design pattern for collapsible panels
- Maintains conversation focus while providing context
- Easy to hide when not needed

**Alternatives considered**:
- Fixed panel: Too intrusive, takes up screen space
- Sidebar panel: Requires layout changes, breaks conversation flow
- Modal overlay: Blocks conversation view, poor UX

### Decision: Real-time Updates via SSE
**Rationale**:
- Already have SSE infrastructure for real-time updates
- Low latency for status changes
- Efficient for multiple concurrent updates

**Alternatives considered**:
- Polling: Higher latency, more server load
- WebSocket: More complex, SSE sufficient for one-way updates

### Decision: Visual Strikethrough for Completed Tasks
**Rationale**:
- Clear visual indicator of completion
- Maintains task list context (users can see what was done)
- Standard UI pattern for completed items

**Alternatives considered**:
- Remove completed tasks: Loses context
- Gray out: Less clear than strikethrough
- Checkmark only: Less visible

## Component Structure

```
ConversationView
├── MessageListManus
├── TaskProgressPanel (NEW)
│   ├── CollapseToggleButton
│   ├── TaskList
│   │   ├── TaskItem (with status badge)
│   │   └── TaskItem (completed with strikethrough)
│   └── EmptyState
└── MessageInput
```

## Data Flow

1. User sends message → `ConversationView.handleSend()`
2. Message triggers task creation → Backend creates tasks
3. SSE event `task_created` → `useRealtimeUpdates` receives event
4. Task list updated → `TaskProgressPanel` displays new task
5. Task execution starts → SSE event `task_status_changed` (RUNNING)
6. Task completes → SSE event `task_status_changed` (COMPLETED)
7. Task item updated → Strikethrough animation applied

## Styling

- Panel: White background, border-top, shadow, padding
- Collapse button: Icon (chevron up/down), positioned top-right
- Task items: List with status badges, hover effects
- Completed tasks: Strikethrough text, muted color
- Animation: Smooth height transition on expand/collapse

## Risks / Trade-offs

### Risk: Panel Height on Mobile
**Mitigation**: 
- Limit visible tasks (max 5-7)
- Smooth scrolling within panel
- Collapsed by default on mobile

### Risk: Performance with Many Tasks
**Mitigation**:
- Only show active/recent tasks (last 10)
- Virtual scrolling if needed
- Debounce rapid status updates

### Risk: Real-time Update Reliability
**Mitigation**:
- Fallback to polling if SSE fails
- Retry logic in `useRealtimeUpdates`
- Graceful degradation (show last known status)

## Open Questions

- Should completed tasks auto-hide after N seconds? (Probably not - keep for context)
- Should panel auto-expand when new tasks are created? (Yes, for visibility)
- Maximum number of tasks to display? (10-15 seems reasonable)
