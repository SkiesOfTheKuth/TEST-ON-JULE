# YouTube Downloader UI

This project is a sophisticated, UX-first frontend for a YouTube downloader application, built with React and TypeScript. It was architected with a focus on maintainability, scalability, and a clean separation of concerns.

## Core Features

- **Beautiful & Intuitive UI**: A mobile-friendly interface with clear states for the download process.
- **Advanced Options**: Support for format, quality, trimming, subtitles, and filename templating.
- **Queue Management**: A robust download queue with per-item controls and concurrency management.
- **Local Persistence**: User preferences are saved locally in the browser.
- **Dark Mode & Compact Layout**: Modern UI themes and layouts for user comfort.
- **Keyboard Shortcuts**: Enhanced accessibility with keyboard navigation and shortcuts.

## Project Architecture

This application follows a modern, professional React architecture that emphasizes a strong separation of concerns.

### Core Technologies
- **React**: For building the user interface.
- **Vite**: As the build tool and development server.
- **TypeScript**: For static type safety and improved code quality.
- **Tailwind CSS**: (Configured but not installed) For utility-first styling.

### Directory Structure
The `src` directory is organized as follows:

-   **/api**: Contains functions for interacting with backend services. Currently holds the mock API for simulating downloads.
-   **/components**: Contains all the React UI components, broken down by feature.
-   **/context**: Contains the main `AppContext.tsx`, which provides global state to the application.
-   **/hooks**: Contains all custom React hooks, organized by domain (`useAnalysis`, `useQueue`, etc.).
-   **/types.ts**: A central file that defines all shared TypeScript interfaces for the application's data structures.
-   **/utils**: Contains all general-purpose utility functions.

### State Management
The application uses a centralized, hooks-based state management strategy.

1.  **Domain-Specific Hooks**: All state and logic are encapsulated within domain-specific custom hooks (e.g., `useQueue`, `useDownloadOptions`). This keeps related logic together and makes it easy to test and maintain.
2.  **React Context**: The `AppContext.tsx` file composes these custom hooks and provides their combined state and handlers to the entire application via the React Context API.
3.  **`useApp` Hook**: Components consume the global state by using the `useApp()` custom hook, which provides easy and type-safe access to the `AppContext`.

This architecture avoids prop drilling and keeps components clean and focused on their presentation responsibilities.

## Getting Started

**Note:** The development environment for this project has had persistent issues preventing the installation of `npm` dependencies. The following instructions are for a stable environment.

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to the URL provided by Vite (usually `http://localhost:5173`).

## Future Development

-   **Wire up the Backend**: Replace the mock API calls in `src/api/mock.ts` with actual calls to a backend service (e.g., a server running `yt-dlp`).
-   **Implement Real-time Progress**: Use Server-Sent Events (SSE) or WebSockets to stream download progress from the backend and update the UI in real-time.
-   **Expand Test Coverage**: While the project includes an internal QA test suite, adding a dedicated testing framework like Jest or Vitest for unit and integration tests would be a valuable next step.