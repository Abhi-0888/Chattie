 ---

# Chattie - Real Time Messaging Application

Chattie is a lightweight, student-built real-time messaging application developed using Next.js, React, TypeScript, and localStorage. The project focuses on learning frontend architecture, state management, and simulated real-time interactions without a backend.

## Overview

Chattie supports direct messaging, group chats, friend requests, stories, user authentication, message status tracking, and cross-tab synchronization. All user, chat, and message data is stored locally in the browser, making it simple to run and ideal for experimentation and development learning.

## Features

### Messaging

* Direct one-on-one chats
* Group chats with add/remove member support
* Message states: sent, delivered, read
* Typing indicators and simulated online/offline presence
* Edit chat names, manage users, and delete conversations

### User Management

* Registration and login using localStorage
* Persistent sessions across page reloads
* User directory with search
* Friend request system: send, accept, reject, and remove
* Multi-tab synchronization for simulating multiple users

### Stories

* Create text or image stories
* Automatic expiry after 24 hours
* Viewer tracking for each story

### UI/UX

* Light and dark theme support
* Responsive layout for mobile and desktop
* Login-first workflow
* Custom student-designed green chat bubble logo

## Data Storage

localStorage keys used by Chattie:

```
quickchat_registered_users
quickchat_user
quickchat_chats
quickchat_messages
quickchat_all_requests_db
quickchat_all_friendships_db
quickchat_stories
```

All logic runs on the client side. Multiple users can be simulated by using different browser tabs or profiles.

## Architecture

* React Context API manages authentication, chat state, friend management, and the simulated socket layer.
* Real-time behavior is implemented through localStorage events and timed polling.
* The mock socket provider can be replaced with a real WebSocket client for backend integration.

## Running the Project

1. Install dependencies:

```
npm install
```

2. Start the development server:

```
npm run dev
```

3. Open the application:

```
http://localhost:3000
```

To reset all data, clear the relevant localStorage keys in the browser.

## Development Notes

* The project uses mocked services for easier testing and faster iteration.
* The repository may exclude build folders for size reduction; these can be restored using `npm install`.
* File structure includes contexts, components, utilities, and dummy data.

## Future Enhancements

* Backend API integration
* Real WebSocket functionality
* Database support
* File and image sharing
* Voice and video calling
* Message search and reactions
* End-to-end encryption

## Build Commands

```
npm run dev
npm run build
npm start
npm run lint
```

---
## Like This Project?

If this project helped you or you enjoyed it, consider giving it a **star ⭐ on GitHub**!
It encourages me to do more work like this.

---
