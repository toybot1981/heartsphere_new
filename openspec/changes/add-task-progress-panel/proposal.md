# Change: Add Task Progress Panel in Conversation View

## Why

Currently, when users send messages that trigger task decomposition and execution, they cannot see the progress of these tasks in real-time within the conversation view. Users need to switch to the task view to see task status, which breaks the conversation flow and reduces visibility into what the AI agent is doing.

By adding a collapsible task progress panel above the message input area (similar to Manus design), users can:
- See task decomposition immediately after sending a message
- Track task execution progress in real-time
- See completed tasks visually crossed out
- Maintain context without leaving the conversation view

## What Changes

- **ADDED**: Collapsible task progress panel component above message input in ConversationView
- **ADDED**: Real-time task status updates via SSE/WebSocket integration
- **ADDED**: Visual task completion indicators (strikethrough for completed tasks)
- **ADDED**: Task list display with status badges and progress indicators
- **MODIFIED**: ConversationView to include task progress panel
- **MODIFIED**: Real-time update hooks to handle task status changes

## Impact

- **Affected specs**: `conversation-ui` capability
- **Affected code**: 
  - `mentis/frontend/src/components/manus/content/ConversationView.tsx`
  - `mentis/frontend/src/components/manus/content/MessageInput.tsx`
  - `mentis/frontend/src/hooks/useRealtimeUpdates.ts`
  - New component: `mentis/frontend/src/components/manus/content/TaskProgressPanel.tsx`
- **User experience**: Improved visibility into AI agent task execution without leaving conversation context
