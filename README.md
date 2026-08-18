# Fun Chat

Real-time online chat with private messaging, read receipts, typing indicators, online presence, and user profiles.

<p>
  <a href="https://chat-app-nasteew.netlify.app"><strong>Open app</strong></a>
  ·
  <a href="https://chat-server-eb5x.onrender.com/health">API health</a>
</p>

---

## Live demo

| Service | URL |
|---------|-----|
| **Frontend** (Netlify) | [https://chat-app-nasteew.netlify.app](https://chat-app-nasteew.netlify.app) |
| **Backend API** (Render) | [https://chat-server-eb5x.onrender.com](https://chat-server-eb5x.onrender.com) |

---

## Tech stack

### Frontend (this folder)

| | |
|---|---|
| **Runtime** | React 19, TypeScript |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS 4, CSS Modules |
| **State** | Zustand |
| **Routing** | React Router 7 |
| **Realtime** | WebSocket (singleton `socketService`) |
| **UI** | Lucide React, React Hot Toast |

### Backend (`https://github.com/nasteew/chat-server`)

| | |
|---|---|
| **Runtime** | Node.js, Express 5 |
| **WebSocket** | `ws` |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT (access) + httpOnly cookie (refresh) |
| **Files** | Multer → Supabase Storage (avatars) |

## Features

- Sign up and sign in
- Chat list with message preview and unread count
- User search and new chat creation
- Send, edit, and delete messages
- Delivery status: pending → sent → read
- Typing indicator
- Online / offline presence
- Profile: avatar, username, email, password
- Responsive UI (desktop + mobile)

---

## Local setup

### Requirements

- **Node.js** 18+
- **npm** 9+
- **Supabase** account (free tier is enough)

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
3. Ensure tables `users`, `chats`, `messages`, `chat_reads` exist (and an `avatars` bucket for profile photos).

### 2. Backend

```bash
npm install
```

Create `.env` (see `.env.example`):

```env
PORT=4000
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_AVATAR_BUCKET=avatars

ACCESS_SECRET=your_access_secret
REFRESH_SECRET=your_refresh_secret
```

Start the server:

```bash
npm start
```

Server runs at **http://localhost:4000**

Health check:

```bash
curl http://localhost:4000/health
```

### 3. Frontend

```bash
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:4000
```

Start dev server:

```bash
npm run dev
```

Open **http://localhost:5173** and sign up or sign in.

### 4. Startup order

1. Backend (`fun-chat-server`) — port `4000`
2. Frontend (`chat`) — port `5173`
3. Server `CLIENT_URL` = `http://localhost:5173`
4. Client `VITE_API_URL` = `http://localhost:4000`

---

## Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

### Backend (`https://github.com/nasteew/chat-server`)

| Command | Description |
|---------|-------------|
| `npm start` | Start server |
| `npm test` | Jest |
| `npm run lint` | ESLint |

---

## Deployment

### Frontend → Netlify

Deploy **this folder** (`chat/`). Config in `netlify.toml`:

- build: `npm run build`
- publish: `dist`
- `VITE_API_URL` → Render server URL

**Live app:** [https://chat-app-nasteew.netlify.app](https://chat-app-nasteew.netlify.app)

### Backend → Render

- Root: `fun-chat-server`
- Start: `npm start`
- Env: `PORT`, `CLIENT_URL`, `SUPABASE_*`, `ACCESS_SECRET`, `REFRESH_SECRET`
- **`CLIENT_URL`** = `https://chat-app-nasteew.netlify.app` (no trailing slash)

---

## WebSocket

The client connects to the same host as the API (`VITE_API_URL` is converted to `ws://` / `wss://` automatically).

Main events:

| Client → server | Server → client |
|-----------------|-----------------|
| `AUTH` | `AUTH_SUCCESS` / `AUTH_FAILURE` |
| `CHAT_OPEN` | `MSG_NEW` |
| `MSG_SEND` | `MSG_EDITED`, `MSG_DELETED` |
| `MSG_EDIT`, `MSG_DELETE` | `USER_TYPING`, `USER_STOPPED_TYPING` |
| `MESSAGES_READ` | `MESSAGES_READ_ACK` |
| `TYPING_START`, `TYPING_STOP` | `USER_ONLINE`, `USER_OFFLINE` |
