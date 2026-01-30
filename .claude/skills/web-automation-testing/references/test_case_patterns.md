# Test Case Patterns

## Common Test Patterns

### 1. Login Flow
```
Steps:
- navigate to http://localhost:3000/login
- type "testuser" in #username
- type "password123" in #password
- click #login-button
- wait for navigation
- verify text=Dashboard
```

### 2. Form Submission
```
Steps:
- navigate to http://localhost:3000/form
- type "John Doe" in #name-input
- type "john@example.com" in #email-input
- click #submit-button
- wait for 2 seconds
- verify text=Success
```

### 3. Navigation Test
```
Steps:
- navigate to http://localhost:3000
- click text=About
- wait for navigation
- verify text=About Us
- click text=Home
- verify text=Welcome
```

### 4. Search Functionality
```
Steps:
- navigate to http://localhost:3000/search
- type "test query" in #search-input
- click #search-button
- wait for 3 seconds
- verify text=Results
```

### 5. Data Display
```
Steps:
- navigate to http://localhost:3000/data
- wait for #data-table
- verify #data-table
- check text=Item 1
```

## Error Handling Patterns

### Timeout Handling
If elements don't appear quickly, add explicit waits:
```
- wait for #slow-loading-element
- click #slow-loading-element
```

### Dynamic Content
For dynamically loaded content:
```
- navigate to http://localhost:3000
- wait for networkidle
- verify text=Loaded
```

### Conditional Steps
Some tests may need conditional logic (requires manual intervention or script modification):
```
- navigate to http://localhost:3000
- if element exists #modal:
  - click #close-modal
- click #main-button
```

## Chinese UI Patterns

For applications with Chinese interface (e.g. 心域 main 现实世界日记):

- Use `text=` with Chinese directly: `click text=进入现实`, `verify text=写今日`
- Ensure test plan JSON is UTF-8; if selector is unstable, use `button:has-text("写今日")`
- See `references/chinese_ui_testing.md` for details

Example:
```
- navigate to http://localhost:3000
- wait for 2 seconds
- click text=进入现实
- wait for 3 seconds
- verify text=写今日
```

## SPA Navigation (No URL Change)

For SPA screens that don't change URL:

- Do not rely on URL; use feature text or element to verify screen state
- After clicking entry (e.g. 进入现实), use `wait for text=写今日` then `verify text=写今日`
- For modals: `wait for text=日记记忆` after opening the modal
- See `references/spa_navigation_testing.md` for details
