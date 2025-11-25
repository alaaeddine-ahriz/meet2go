# Meet2Go

Meet2Go is a mobile-first group decision-making app that transforms chaotic group chat discussions into organized, fair, and fun voting experiences. Using an intuitive swipe-based interface, friends can quickly express preference strength on various options, enabling groups to reach consensus faster.

## Tech Stack

*   **Framework:** [Expo](https://expo.dev/) (React Native)
*   **Language:** TypeScript
*   **Navigation:** Expo Router
*   **Backend:** Supabase (Auth, Database, Realtime, Storage)
*   **State Management:** Zustand & TanStack Query
*   **Animations:** React Native Reanimated & Gesture Handler

## Project Structure

The project follows a standard Expo Router structure with a separate `src` directory for logic.

### `app/`
Contains the file-based routing for the application.
*   `(auth)/`: Authentication screens (Login, Sign Up).
*   `(tabs)/`: Main application tabs (Home, Profile, etc.).
*   `quest/`: Routes for Quest details and management.
*   `poll/`: Routes for Poll creation, voting, and results.
*   `join/`: Route for handling invite links.
*   `_layout.tsx`: Root layout configuration.

### `src/`
Contains the core application logic and reusable code.
*   `components/`: Reusable UI components (Buttons, Cards, Inputs).
*   `hooks/`: Custom React hooks (e.g., for authentication, data fetching).
*   `lib/`: Configuration for external services (Supabase client).
*   `store/`: Global state management stores (Zustand).
*   `types/`: TypeScript type definitions.
*   `utils/`: Helper functions and utilities.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root directory with your Supabase credentials:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Run the App:**
    ```bash
    npx expo start
    ```
    *   Press `i` to open in iOS Simulator.
    *   Press `a` to open in Android Emulator.
    *   Press `w` to open in Web Browser.

## Key Features

*   **Quests:** Create a dedicated space for your trip or event.
*   **Polls:** Create polls for specific decisions (e.g., "Dinner Spot").
*   **Swipe Voting:** Swipe Left (No), Right (Yes), or Up (Amazing) to vote.
*   **Real-time Results:** See consensus build in real-time.
