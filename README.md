# Collaborative Code Editor with AI Assistance
A high-fidelity, real-time collaborative workspace designed for developers. This application features live code synchronization, team chat, dynamic file exports, and a resilient AI assistant powered by the Gemini API. The interface is meticulously designed around professional developer tools (e.g., VS Code and GitHub dark theme aesthetics) with zero distracting glow effects and full layout control.
## 🚀 Key Features
### 👥 1. Real-Time Collaborative Workspace
* **Socket-Driven Sync**: Multi-user rooms where code updates are broadcasted instantly to all connected peers via Socket.io.
* **Persistent Session State**: Code and language selections are cached on the server, meaning rooms preserve their exact states across browser refreshes or when new members join late.
* **Dynamic Programming Languages**: Real-time language selector supporting **C++, Python, JavaScript, HTML, CSS, Java, and C**. Selected syntaxes apply immediate syntax coloring changes to Monaco Editor across all room users.
### 💬 2. Real-Time Team Chat
* **Collaborative Sidebar**: A dedicated tab to coordinate, review, and exchange feedback with members of your room.
* **Minimalist Design**: Custom message bubbles visually matching participants' active states (Blue for self, Dark Gray for others) along with clean, precise timestamps.
### 🤖 3. AI Assistant Integration (Gemini 2.5)
* **Explain Code**: Generates step-by-step logic, syntax, and architectural explanations for your active codebase.
* **Review Code**: Analyzes code quality, points out code smells, optimization paths, potential security flaws, and delivers clean refactored examples.
* **Inline Autocomplete**: Provides smart inline code suggestions (ghost text) as you type, optimized with an 800ms debounce to save API quota.
* **Quota-Resilient Handler**: The backend intercepts API quota issues (like `429 Too Many Requests`) or network drops gracefully, returning structured error messages to the UI and failing silently on autocompletions to ensure a seamless workflow.
* **AI Toggle Switch**: Easily disable or enable AI Autocomplete on-the-fly to manage key usage.
### 💻 4. Resizable & Customizable UI Layout
* **Draggable Panel Resizing**: An interactive handle allows you to drag and resize the Chat/AI sidebar from `250px` to `600px` based on screen real estate.
* **Transition Lag Prevention**: Smooth animations for panel collapsing, with animations paused during manual drag operations to avoid mouse lag.
* **Compact Toggles**: One-click floating buttons allow users to hide the header bar or the right panel completely.
### 💾 5. Local File Downloads
* **Dynamic Code Export**: Download the workspace code directly to your local file system.
* **Automatic Extension Formatting**: File names are formatted dynamically based on your chosen language (e.g., `room-20.cpp`, `room-20.py`, `room-20.js`).
---
## 🛠️ Technology Stack
* **Frontend**: React (Vite), Tailwind CSS (for structure/positioning), Monaco Editor (`@monaco-editor/react`), Axios, Socket.io-client.
* **Backend**: Node.js, Express, Socket.io, MongoDB, `@google/generative-ai` SDK.
* **Styling Theme**: Developer Dark (based on GitHub `#0D1117` main backgrounds, `#161B22` sidebar card containers, `#30363D` thin borders, and solid Accent colors).
---
## 📦 Project Structure
* **client/** (Frontend React Application)
  * **src/**
    * **components/** (React Components: EditorPage, Chat, Home)
    * **pages/** (Pages: Login, Register, ForgotPassword)
    * **index.css** (Core Tailwind & custom variables theme)
    * **socket.js** (Socket.io Client Setup)
  * **package.json**
* **server/** (Backend Node/Express Application)
  * **config/** (Database configuration: MongoDB Connect)
  * **controllers/** (Business Logic Controllers: aiController)
  * **routes/** (Router Endpoints: aiRoutes, authRoutes)
  * **.env** (Server Environment Variables)
  * **index.js** (Server Entry Point & Socket events mapping)
## ⚙️ Getting Started
### Prerequisites
* Node.js (v18+ recommended)
* MongoDB database instance
* Google Gemini API Key


## Server Setup :
<h3>Server Setup</h3>
<ul>
  <li>Navigate to the server directory: <code>cd server</code></li>
  <li>Install dependencies: <code>npm install</code></li>
  <li>Create a <code>.env</code> file in the server root containing:
    <br><code>PORT=8080</code>
    <br><code>MONGO_URI=your_mongodb_connection_string</code>
    <br><code>JWT_SECRET=your_jwt_secret</code>
    <br><code>GEMINI_API_KEY=your_gemini_api_key</code>
  </li>
  <li>Start the backend server: <code>npm run dev</code></li>
</ul>

<h3>Client Setup</h3>
<ul>
  <li>Navigate to the client directory: <code>cd ../client</code></li>
  <li>Install dependencies: <code>npm install</code></li>
  <li>Start the Vite development server: <code>npm run dev</code></li>
  <li>Open the app in your browser at: <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></li>
</ul>
