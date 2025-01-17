# Coding Standards

```typescript
{
  "standards": {
    "typescript": {
      "required": true,
      "returnTypes": "explicit",
      "noFloatingPromises": true,
      "namingConventions": {
        "default": ["camelCase", "PascalCase"],
        "variables": ["camelCase", "PascalCase", "UPPER_CASE"],
        "types": ["PascalCase"],
        "enums": ["UPPER_CASE"],
        "dbFields": ["snake_case"]
      }
    },
    "logging": {
      "required": true,
      "excludeSmallFunctions": true,
      "smallFunctionThreshold": 3,
      "methodEntry": {
        "format": "logMethodEntry('methodName', { args })",
        "required": true
      },
      "methodExit": {
        "format": "logMethodExit('methodName', { result })",
        "required": true
      },
      "errors": {
        "format": "logError(error instanceof Error ? error : new Error('Message'), 'context')",
        "required": true
      },
      "excludedPatterns": [
        "^(get|set)[A-Z].*$",
        "^handle(Change|Click|Submit|Delete)$",
        "^on[A-Z].*$",
        "^render[A-Z].*$",
        "^use[A-Z].*$",
        "^(map|filter|reduce)[A-Z].*$",
        "^(format|transform|validate|compute|parse)[A-Z].*$",
        "^(serialize|normalize|denormalize)[A-Z].*$",
        "^(to|from|is|has|should|can|will|did)[A-Z].*$",
        "^component.*$",
        "^anonymous$"
      ]
    },
    "testing": {
      "cypress": {
        "required": true,
        "types": ["component", "e2e"],
        "electronLogging": true
      }
    },
    "git": {
      "commitMessages": {
        "format": "single-line",
        "type": "conventional"
      }
    },
    "dependencies": {
      "packageManager": "npm",
      "versionStrategy": "latest",
      "typescript": "required",
      "javascript": "forbidden"
    }
  }
}
```

# Development Tasks
```markdown
# ChatGenius TODO List

This TODO list provides a detailed, step-by-step implementation plan for **ChatGenius**, focusing on incremental feature development to build a fully functional chat application. Each step includes user stories and actionable items to guide the development process, ensuring clarity and manageability for the team. Notes are added where significant changes may require updates to tests or other project areas.

---

## 1. **Create Landing Page with Guest Login**

### **User Stories**
- **As a user**, I want to access a landing page where I can enter my name and join the chat as a guest, enabling quick and frictionless onboarding.
- **As a developer**, I want to implement a simple authentication mechanism that allows users to join without creating an account, facilitating easy access for demo purposes.

### **Tasks**
- [ ] **Design Landing Page UI**
  - Create a clean and minimalistic landing page layout with a form to enter the user's name.
  - Include a "Join Chat" button to submit the form.
- [ ] **Implement Frontend Form Functionality**
  - Develop a React component for the landing page with input validation to ensure the user enters a valid name.
  - Handle form submission to initiate the guest login process.
- [ ] **Set Up Guest User State Management**
  - Configure state management (e.g., using React Context or Redux) to store the guest user's name and authentication status.
- [ ] **Connect Frontend to Backend for Guest Login**
  - Establish a connection to Supabase to create or retrieve a guest user record based on the entered name.
  - Use AWS Amplify with GraphQL to manage the authentication flow.
- [ ] **Implement Navigation to Chat Interface**
  - Upon successful guest login, redirect the user to the main chat interface.
- [ ] **Write Tests for Landing Page**
  - Develop Cypress tests to verify:
    - The landing page renders correctly.
    - Form validations work as intended.
    - Successful submission redirects to the chat interface.
    - Guest user data is correctly stored in the state.

### **Notes**
- **Testing Updates**: Ensure that new tests cover the guest login flow. Mock Supabase and AWS AppSync responses as needed to simulate backend interactions.

---

## 2. **Establish Database Connection with Supabase and AWS AppSync**

### **User Stories**
- **As a developer**, I want to set up a reliable and scalable database connection to handle user data and chat messages, ensuring data integrity and real-time capabilities.
- **As a team member**, I need the backend infrastructure to support seamless communication between the frontend and the database.

### **Tasks**
- [ ] **Configure Supabase Project**
  - Set up a new project in the Supabase dashboard.
  - Create necessary tables for `users`, `messages`, and `channels`.
  - Define relationships and indexes to optimize query performance.
- [ ] **Set Up AWS AppSync GraphQL API**
  - Initialize a new AppSync API in the AWS Management Console.
  - Define GraphQL schemas for users, messages, and channels.
  - Configure resolvers to interact with Supabase tables.
- [ ] **Integrate Supabase with AWS AppSync**
  - Connect Supabase as a data source in AppSync.
  - Ensure real-time subscriptions are enabled for chat messages.
- [ ] **Implement Frontend Database Client**
  - Initialize Supabase client in `src/lib/supabaseClient.ts` with appropriate configuration.
  - Set up Apollo Client for GraphQL interactions with AppSync.
- [ ] **Secure API Keys and Environment Variables**
  - Add Supabase and AppSync credentials to the frontend `.env` file.
  - Ensure sensitive information is managed securely and not exposed in the codebase.
- [ ] **Write Tests for Database Connection**
  - Develop Cypress tests to verify:
    - Successful connection to Supabase and AppSync.
    - CRUD operations on `users`, `messages`, and `channels`.
    - Real-time data synchronization works as expected.

### **Notes**
- **Testing Updates**: Update environment variable mocks in tests to simulate different database states. Ensure that GraphQL queries and mutations are correctly handled in test scenarios.

---

## 3. **Develop Chat Interface Frontend Layout**

### **User Stories**
- **As a user**, I want a visually appealing and intuitive chat interface that allows me to interact seamlessly with other team members.
- **As a developer**, I want to create a responsive and component-driven UI that ensures consistency and ease of maintenance.

### **Tasks**
- [ ] **Design Chat Interface Wireframes**
  - Create wireframes for the chat interface, including areas for message display, message input, user list, and channel navigation.
  - Highlight areas with colorful status indicators for enhanced user experience.
- [ ] **Implement ChatWindow Component**
  - Develop the main `ChatWindow` component using React and shadcn components.
  - Ensure the layout is clean, mostly black and white, with colorful highlights as per the design.
- [ ] **Create MessageList and MessageItem Components**
  - Develop `MessageList` to display a list of `MessageItem` components.
  - Ensure messages are styled consistently and are easily readable.
- [ ] **Develop MessageInput Component**
  - Implement an input field for users to type and send messages.
  - Handle input state and submission logic.
- [ ] **Integrate Tailwind CSS for Styling**
  - Apply Tailwind CSS classes to style all components according to the wireframes.
  - Ensure the design is responsive and adapts to various screen sizes.
- [ ] **Set Up Responsive Layout**
  - Ensure that the chat interface maintains usability and aesthetics on both desktop and mobile devices.
- [ ] **Write Tests for Chat Interface Layout**
  - Develop Cypress component tests to verify:
    - All UI components render correctly.
    - Responsive behavior works as intended.
    - Status indicators display the correct colors based on user status.

### **Notes**
- **Testing Updates**: Ensure that UI component tests cover different screen sizes and states. Mock data can be used to simulate various chat scenarios.

---

## 4. **Implement Guest User Login Functionality**

### **User Stories**
- **As a user**, I want to join the chat by simply entering my name, allowing for quick and easy access without unnecessary friction.
- **As a developer**, I need to implement a straightforward guest login mechanism that creates a user session and connects to the chat interface.

### **Tasks**
- [ ] **Develop Guest Login API Endpoint**
  - Create a GraphQL mutation in AWS AppSync to handle guest user creation or retrieval based on the entered name.
- [ ] **Connect Frontend to Guest Login API**
  - Update the landing page form submission to trigger the guest login mutation.
  - Handle responses to set the user state accordingly.
- [ ] **Store Guest User Information**
  - Save the guest user's name and unique identifier in the frontend state management system.
- [ ] **Redirect to Chat Interface After Login**
  - Ensure that after a successful guest login, the user is navigated to the main chat interface.
- [ ] **Display Guest User in User List**
  - Ensure that the newly logged-in guest user appears in the user list within the chat interface.
- [ ] **Write Tests for Guest Login Functionality**
  - Develop Cypress end-to-end tests to verify:
    - Successful guest login with a valid name.
    - Handling of invalid or empty name submissions.
    - Correct redirection to the chat interface after login.
    - Guest user appears in the user list.

### **Notes**
- **Testing Updates**: Mock the guest login API responses to test different scenarios, including successful logins and error handling for invalid inputs.

---

## 5. **Enable Sending Messages**

### **User Stories**
- **As a user**, I want to send messages to the chat so that I can communicate with my team members effectively.
- **As a developer**, I want to implement message sending functionality that interacts with the backend to store and distribute messages in real-time.

### **Tasks**
- [ ] **Create SendMessage API Mutation**
  - Define a GraphQL mutation in AWS AppSync for sending messages.
  - Ensure messages include necessary fields such as `sender`, `content`, `timestamp`, and `channel`.
- [ ] **Develop Frontend Service for Sending Messages**
  - Implement a service in `src/lib/api.ts` to call the `sendMessage` mutation.
  - Handle optimistic UI updates to display messages immediately upon sending.
- [ ] **Connect MessageInput Component to SendMessage Service**
  - Update the `MessageInput` component to use the send message service upon form submission.
  - Clear the input field after a message is sent successfully.
- [ ] **Handle Error Scenarios**
  - Implement error handling for failed message sends, providing user feedback as necessary.
- [ ] **Write Tests for Message Sending**
  - Develop Cypress tests to verify:
    - Messages are sent successfully and appear in the chat window.
    - Optimistic UI updates work correctly.
    - Error handling displays appropriate feedback to the user.

### **Notes**
- **Testing Updates**: Mock the `sendMessage` mutation to simulate both successful and failed message sends. Ensure tests cover all possible user interactions with the message input.

---

## 6. **Display Received Messages in Real-Time**

### **User Stories**
- **As a user**, I want to see messages from others appear instantly in the chat, ensuring real-time communication.
- **As a developer**, I need to implement real-time message reception to provide a seamless chat experience.

### **Tasks**
- [ ] **Set Up GraphQL Subscriptions for Messages**
  - Define a GraphQL subscription in AWS AppSync to listen for new messages in real-time.
- [ ] **Develop Frontend Service for Subscribing to Messages**
  - Implement a service in `src/lib/api.ts` using Apollo Client to subscribe to the `newMessage` subscription.
  - Update the `MessageList` component to append new messages as they arrive.
- [ ] **Handle Subscription Lifecycle**
  - Manage subscription start and teardown to prevent memory leaks and ensure efficient resource usage.
- [ ] **Ensure Messages are Displayed Correctly**
  - Format and style incoming messages to match the design specifications.
  - Differentiate between messages sent by the current user and others (e.g., alignment, color).
- [ ] **Write Tests for Real-Time Message Reception**
  - Develop Cypress tests to verify:
    - New messages are received and displayed without page reloads.
    - Subscription handles multiple messages arriving in quick succession.
    - Message formatting aligns with design specifications.

### **Notes**
- **Testing Updates**: Mock the `newMessage` subscription to emit messages during tests. Ensure that the frontend correctly handles multiple incoming messages and updates the UI accordingly.

---

## 7. **Create and Manage Chat Channels**

### **User Stories**
- **As a user**, I want to create and switch between different chat channels to organize my conversations effectively.
- **As a developer**, I need to implement channel management functionality that allows users to create, view, and select chat channels.

### **Tasks**
- [ ] **Design Channel Management UI**
  - Create components for displaying available channels and adding new channels.
  - Include features like channel names, descriptions, and creation buttons.
- [ ] **Develop CreateChannel API Mutation**
  - Define a GraphQL mutation in AWS AppSync for creating new channels.
  - Ensure channels have unique identifiers and necessary metadata.
- [ ] **Implement Frontend Service for Creating Channels**
  - Develop a service in `src/lib/api.ts` to call the `createChannel` mutation.
  - Handle UI updates to display newly created channels immediately.
- [ ] **Set Up Channel Selection Mechanism**
  - Allow users to select a channel from the channel list, updating the chat window to display messages from the selected channel.
- [ ] **Manage Channel Data in State**
  - Update state management to track the currently selected channel and the list of available channels.
- [ ] **Write Tests for Channel Management**
  - Develop Cypress tests to verify:
    - Channels can be created successfully.
    - Newly created channels appear in the channel list.
    - Selecting a channel updates the chat window with the correct messages.
    - Navigation between channels works seamlessly.

### **Notes**
- **Testing Updates**: Mock the `createChannel` mutation and channel subscription to test the creation and selection flows. Ensure that UI updates reflect channel changes accurately during testing.

---

## 8. **Display User List**

### **User Stories**
- **As a user**, I want to see a list of all active users in the chat, allowing me to know who else is available for communication.
- **As a developer**, I need to implement a user list component that dynamically displays active users and updates in real-time.

### **Tasks**
- [ ] **Design User List UI**
  - Create a `UserList` component to display active users, including their names and statuses.
  - Incorporate colorful highlights for status indicators (e.g., online, away).
- [ ] **Create GetUsers API Query**
  - Define a GraphQL query in AWS AppSync to retrieve the list of active users.
- [ ] **Develop Frontend Service for Fetching Users**
  - Implement a service in `src/lib/api.ts` to execute the `getUsers` query.
  - Subscribe to user status changes using GraphQL subscriptions if applicable.
- [ ] **Integrate UserList Component into Chat Interface**
  - Place the `UserList` component in the appropriate location within the chat interface layout (e.g., sidebar).
- [ ] **Manage User Data in State**
  - Update state management to store and update the list of active users dynamically.
- [ ] **Write Tests for User List Display**
  - Develop Cypress tests to verify:
    - The user list renders correctly with all active users.
    - Status indicators display the appropriate colors based on user status.
    - Real-time updates reflect user activities (e.g., users joining or leaving).

### **Notes**
- **Testing Updates**: Mock the `getUsers` query and user status subscriptions to test dynamic updates in the user list. Ensure that the UI responds correctly to changes in user data during tests.

---

## 9. **Implement Sidebar Functionality**

### **User Stories**
- **As a user**, I want a sidebar that I can toggle open and closed to manage channel navigation and user lists without cluttering the main chat area.
- **As a developer**, I need to create a responsive and interactive sidebar that enhances the usability of the chat interface.

### **Tasks**
- [ ] **Design Sidebar UI**
  - Create a `Sidebar` component that houses the `ChannelList` and `UserList` components.
  - Ensure the sidebar has a clean and minimalistic design with necessary controls for opening and closing.
- [ ] **Develop Toggle Functionality**
  - Implement a toggle button that allows users to open and close the sidebar.
  - Animate the sidebar transition for a smooth user experience.
- [ ] **Integrate Sidebar with Layout**
  - Position the `Sidebar` component within the main chat interface layout.
  - Ensure that the main chat area adjusts appropriately when the sidebar is open or closed.
- [ ] **Ensure Responsive Behavior**
  - Make sure the sidebar functions correctly on various screen sizes, adapting its layout as needed for mobile devices.
- [ ] **Write Tests for Sidebar Functionality**
  - Develop Cypress tests to verify:
    - The sidebar can be opened and closed using the toggle button.
    - The layout adjusts correctly when the sidebar state changes.
    - Responsive behavior works as intended on different screen sizes.

### **Notes**
- **Testing Updates**: Mock interaction events to test the toggle functionality. Ensure that responsive tests cover both desktop and mobile layouts.

---

## 10. **Enable Real-Time Updates for Channels and Users**

### **User Stories**
- **As a user**, I want the channel list and user list to update in real-time as new channels are created or users join/leave, ensuring that I have the latest information without needing to refresh.
- **As a developer**, I need to implement real-time subscriptions for channels and users to keep the frontend data synchronized with backend changes.

### **Tasks**
- [ ] **Set Up GraphQL Subscriptions for Channels**
  - Define a subscription in AWS AppSync to listen for new channel creations and updates.
- [ ] **Set Up GraphQL Subscriptions for User Status**
  - Define a subscription in AWS AppSync to listen for user status changes (e.g., online, offline).
- [ ] **Develop Frontend Subscription Services**
  - Implement services in `src/lib/api.ts` to handle channel and user subscriptions.
  - Update the `ChannelList` and `UserList` components to respond to real-time updates.
- [ ] **Handle Real-Time Data Integration**
  - Ensure that new channels and user status changes are reflected immediately in the UI without requiring page reloads.
- [ ] **Optimize Subscription Performance**
  - Manage active subscriptions efficiently to prevent unnecessary data usage and maintain performance.
- [ ] **Write Tests for Real-Time Updates**
  - Develop Cypress tests to verify:
    - New channels appear in the channel list as they are created.
    - User statuses update in real-time (e.g., a user goes offline).
    - The UI reflects these changes accurately without manual intervention.

### **Notes**
- **Testing Updates**: Mock real-time subscription events to test live updates in the frontend. Ensure that the UI correctly handles rapid or multiple simultaneous updates.

---

## 11. **Implement Basic Messaging Features**

### **User Stories**
- **As a user**, I want to perform basic messaging actions such as editing and deleting my messages to maintain accurate and relevant communication.
- **As a developer**, I need to implement these messaging features while ensuring data integrity and user permissions.

### **Tasks**
- [ ] **Develop EditMessage API Mutation**
  - Define a GraphQL mutation in AWS AppSync to allow users to edit their messages.
  - Ensure that only the message sender can perform edits.
- [ ] **Develop DeleteMessage API Mutation**
  - Define a GraphQL mutation in AWS AppSync to allow users to delete their messages.
  - Ensure that only the message sender can perform deletions.
- [ ] **Update Frontend Services for Editing and Deleting Messages**
  - Implement services in `src/lib/api.ts` to call the `editMessage` and `deleteMessage` mutations.
  - Handle optimistic UI updates for immediate feedback upon editing or deleting.
- [ ] **Add Edit and Delete Controls to MessageItem Component**
  - Include buttons or icons within each `MessageItem` for editing and deleting messages.
  - Ensure controls are only visible to the message sender.
- [ ] **Implement Modal or Inline Editing UI**
  - Allow users to modify their message content through a modal dialog or inline text editing.
  - Confirm changes before submission.
- [ ] **Handle Authorization and Validation**
  - Ensure that backend mutations validate user permissions and message ownership.
  - Provide appropriate error feedback for unauthorized actions.
- [ ] **Write Tests for Messaging Features**
  - Develop Cypress tests to verify:
    - Users can successfully edit their messages.
    - Users can successfully delete their messages.
    - Unauthorized attempts to edit or delete others' messages are prevented and appropriately handled.
    - UI updates reflect changes made to messages.

### **Notes**
- **Testing Updates**: Mock `editMessage` and `deleteMessage` mutations to test successful and failed operations. Ensure that UI components respond correctly to these actions during tests.

---

## 12. **Optimize Chat Performance and Responsiveness**

### **User Stories**
- **As a user**, I want the chat application to perform smoothly without lag, ensuring a pleasant and efficient communication experience.
- **As a developer**, I need to optimize the application's performance and responsiveness to handle real-time data efficiently and provide a seamless user experience.

### **Tasks**
- [ ] **Implement Infinite Scrolling or Pagination for Messages**
  - Allow users to load older messages as they scroll up, enhancing performance by limiting initial data load.
- [ ] **Optimize Rendering of MessageList**
  - Use virtualization libraries (e.g., react-window) to efficiently render large lists of messages.
- [ ] **Debounce Input to Prevent Excessive API Calls**
  - Implement debouncing on the message input to avoid sending unnecessary API requests during rapid typing.
- [ ] **Minimize Re-Renders with Memoization**
  - Utilize React's `memo` and `useMemo` to prevent unnecessary re-renders of components.
- [ ] **Implement Lazy Loading for Non-Critical Components**
  - Load non-essential components on demand to improve initial load times.
- [ ] **Profile and Optimize GraphQL Queries**
  - Analyze and refine GraphQL queries to reduce data payloads and improve response times.
- [ ] **Conduct Performance Audits**
  - Use tools like Lighthouse to assess application performance and identify bottlenecks.
- [ ] **Write Tests for Performance Optimizations**
  - Develop Cypress tests to monitor application responsiveness under various scenarios.
  - Ensure that optimizations do not negatively impact functionality.

### **Notes**
- **Testing Updates**: While performance tests are less common in Cypress, ensure that functionality remains intact after optimizations. Use tooling like Lighthouse for performance-specific testing outside of Cypress.

---

## 13. **Prepare for User Authentication Integration**

### **User Stories**
- **As a developer**, I want to plan and prepare for integrating a robust authentication system (e.g., Auth0) to enhance security and user management in the future.
- **As a team member**, I need to ensure that the current guest login system is compatible with future authentication enhancements without major refactoring.

### **Tasks**
- [ ] **Design Authentication Architecture**
  - Outline how Auth0 will integrate with the existing guest login system and chat functionalities.
  - Ensure that user data models can accommodate authenticated and guest users.
- [ ] **Abstract Authentication Logic**
  - Refactor existing guest login services to allow easy integration with Auth0.
  - Implement hooks or context providers that can handle both guest and authenticated users.
- [ ] **Set Up Placeholder for Auth0 Integration**
  - Create placeholders in the codebase where Auth0-related functionalities will be added.
  - Document areas that will require updates once Auth0 is implemented.
- [ ] **Ensure Secure Handling of User Data**
  - Review and enhance security measures to protect user input and data storage.
- [ ] **Write Documentation for Future Authentication Steps**
  - Document the planned authentication integration process for future reference and implementation.
- [ ] **Plan Tests for Authentication Integration**
  - Outline test cases that will be needed once Auth0 is integrated, ensuring coverage of new authentication flows.

### **Notes**
- **Testing Updates**: While actual authentication integration is postponed, ensure that the current guest login system is tested thoroughly to minimize conflicts during future integration.

---

## 14. **Finalize Initial Chat Application Functionality**

### **User Stories**
- **As a user**, I want a fully functional chat application that allows me to join as a guest, send and receive messages in real-time, manage channels, and view active users seamlessly.
- **As a developer**, I want to ensure that all core features are implemented correctly and work together harmoniously before adding additional functionalities.

### **Tasks**
- [ ] **Conduct Full Feature Testing**
  - Perform comprehensive testing of all implemented features to ensure they work as intended.
  - Identify and fix any bugs or issues that arise during testing.
- [ ] **Perform User Acceptance Testing (UAT)**
  - Gather feedback from team members or selected users to validate the application’s usability and functionality.
- [ ] **Refine UI/UX Based on Feedback**
  - Make necessary adjustments to the user interface and user experience based on feedback received during UAT.
- [ ] **Ensure Cross-Browser Compatibility**
  - Test the application across different web browsers to ensure consistent behavior and appearance.
- [ ] **Optimize Application Performance**
  - Address any remaining performance issues identified during testing to ensure smooth operation.
- [ ] **Update Documentation**
  - Ensure all documentation accurately reflects the current state of the application and its features.
- [ ] **Write Comprehensive Test Coverage Reports**
  - Generate and review test coverage reports to identify any untested areas that may require attention.

### **Notes**
- **Testing Updates**: Ensure that all tests pass and cover the entire application scope. Address any gaps in test coverage identified during coverage report analysis.

---

## 15. **Plan Next Steps for Enhanced Features and Authentication**

### **User Stories**
- **As a developer**, I want to outline the next phases of development to incorporate advanced features and robust authentication, ensuring the continued growth and improvement of ChatGenius.
- **As a team member**, I need a clear roadmap for future enhancements to understand the project’s direction and prioritize tasks accordingly.

### **Tasks**
- [ ] **Outline Enhanced Authentication Integration**
  - Detail the steps required to integrate Auth0, including configuration, frontend adjustments, and backend security measures.
- [ ] **Identify Advanced AI-Powered Features to Implement**
  - List potential AI features such as smart replies, message summarization, and sentiment analysis to differentiate ChatGenius from other platforms.
- [ ] **Plan for Additional Messaging Functionalities**
  - Consider features like file sharing, media uploads, message reactions, and typing indicators.
- [ ] **Schedule Performance and Security Enhancements**
  - Prioritize optimizations and security measures to ensure scalability and data protection as the user base grows.
- [ ] **Develop Integration Roadmap for Third-Party Tools**
  - Identify and plan integrations with productivity tools like Google Drive, Trello, or GitHub to enhance collaboration capabilities.
- [ ] **Set Milestones and Timelines for Future Developments**
  - Create a timeline for implementing planned features and integrations, assigning responsibilities and deadlines to team members.
- [ ] **Update Project Documentation with Future Plans**
  - Document the planned next steps in the `FEATURES.md` and `ARCHITECTURE.md` files to keep the team aligned on upcoming developments.

### **Notes**
- **Testing Updates**: As new features are planned, consider how they will integrate with existing tests and what new tests will be required to maintain comprehensive coverage.
