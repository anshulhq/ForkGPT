<p align="center">
    <img src="public/logo.png" alt="ForkGPT Logo" width="125" height="125" />
</p>
<h1 align="center">ForkGPT</h1>
<p align="center"><strong>Git-style branching for AI conversations. Fork any thought. Merge what matters.</strong></p>

<p align="center">
  <a href="#getting-started">Getting Started</a> &middot; <a href="#screenshots">Screenshots</a> &middot; <a href="#architecture">Architecture</a> &middot; <a href="#technical-highlights">Technical Highlights</a> &middot; <a href="#tech-stack">Tech Stack</a> &middot; <a href="#database-schema">Database</a> &middot; <a href="#project-structure">Structure</a> &middot; <a href="#what-i-learned">Learnings</a> &middot; <a href="#future-roadmap">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?logo=groq&logoColor=white" alt="Groq" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

<br />

<!-- VIDEO DEMO -->

https://github.com/user-attachments/assets/9324f196-1554-454d-84fe-038a4564bb3f

> **Watch the full walkthrough above** forking, merging, sibling navigation, and the branch tree in action.

<br />

---

## The Problem

Every mainstream AI chatbot treats conversations as a **flat, linear timeline**. The moment you want to explore a different idea from an earlier point, you face a lose-lose choice:

- **Overwrite** your current thread and lose the context you built.
- **Start over** in a brand-new chat and lose the entire history.

Neither option respects how people actually think. Ideas branch. Explorations fork. Conversations are **trees**, not lists.

## The Solution

**BranchGPT** models every conversation as a **Directed Acyclic Graph (DAG)** stored in PostgreSQL using a recursive adjacency list. Users can:

|    Action    | What it does                                                                                                                  |
| :----------: | :---------------------------------------------------------------------------------------------------------------------------- |
|   **Fork**   | Create a parallel timeline from any message. The new branch inherits all shared history up to the fork point.                 |
| **Navigate** | Visually jump between branches in a real-time tree sidebar with animated SVG connectors.                                      |
|  **Merge**   | Collapse a branch back into its parent. An LLM generates a summary of only the _unique_ content (shared history is filtered). |
|  **Stream**  | Receive token-by-token AI responses via a custom `ReadableStream` pipeline with `flushSync` rendering.                        |

The result is a thinking tool that mirrors how brainstorming actually works: you diverge, explore, and converge.

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** either a [Neon](https://neon.tech) serverless database or a local instance via Docker
- **Groq API Key** free tier available at [console.groq.com](https://console.groq.com)

### 1. Clone & Install

```bash
git clone https://github.com/anshulhq/ForkGPT.git
cd forkgpt
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your credentials:

```bash
cp env.example .env
```

```env
# .env
DATABASE_URL="postgresql://user:pass@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"
GROQ_API_KEY="gsk_your_groq_api_key"
```

**Using Docker instead of Neon?**

```bash
docker compose up -d
# Then set: DATABASE_URL="postgresql://branchgpt:branchgpt_secret@localhost:5432/branchgpt"
```

### 3. Push Database Schema

```bash
npm run db:push
```

This uses Drizzle Kit to create the `branches`, `messages` tables, indexes, and the `message_role` enum.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **"Try Demo"** to explore features instantly with no API key required for the demo.

---

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Landing Page &amp; Hero</strong></td>
    <td align="center"><strong>Chat with Streaming AI</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/main_initial_landing_page.webp" alt="Landing page with particle graph animation" width="480" /></td>
    <td><img src="assets/screenshots/chat_screenshot_end.webp" alt="Chat view with streaming AI response" width="480" /></td>
  </tr>
  <tr>
    <td align="center"><strong>Fork Modal: Branch Anywhere</strong></td>
    <td align="center"><strong>Branch Tree Sidebar</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/create_branch_modal.webp" alt="Fork dialog to create a new branch" width="480" /></td>
    <td><img src="assets/screenshots/right_sidebar_showing_branching.webp" alt="Git-style tree visualization of branches" width="480" /></td>
  </tr>
  <tr>
    <td align="center"><strong>Merge Confirmation</strong></td>
    <td align="center"><strong>Post-Merge Summary</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/merge_branch_dialog.webp" alt="Merge confirmation dialog" width="480" /></td>
    <td><img src="assets/screenshots/merged_screenshot.webp" alt="Branch merged with AI-generated summary" width="480" /></td>
  </tr>
</table>

---

## Architecture

<p align="center">
  <img src="assets/screenshots/forkgpt_architecture_diagram.webp" alt="System architecture diagram" width="720" />
</p>

The application follows a **3-tier architecture** built entirely on Next.js App Router primitives:

|        Tier        | Responsibility                                       | Implementation                                                                 |
| :----------------: | :--------------------------------------------------- | :----------------------------------------------------------------------------- |
|     **Client**     | All UI state, optimistic updates, streaming display  | Single `"use client"` page component orchestrating React state                 |
| **Server Actions** | Every database CRUD operation (fork, merge, history) | `"use server"` functions called directly from the client, no REST boilerplate  |
|   **API Route**    | AI streaming endpoint (`POST /api/chat`)             | Separate route because SSE/streaming requires custom `ReadableStream` handling |
|    **Database**    | Persistent tree storage with recursive CTE support   | PostgreSQL on Neon (serverless, HTTP driver for fast cold starts)              |
|       **AI**       | Token-by-token response generation                   | Groq LPU architecture running Llama 3.3 70B for near-instant streaming         |

### Why This Architecture?

**Server Actions** eliminate the need for a separate REST API layer. The client calls server-side database functions as plain async functions with no request parsing, no response formatting, no boilerplate. The AI streaming endpoint is the sole exception because it requires a custom `ReadableStream` response that doesn't fit the Server Action model.

---

## Technical Highlights

### Recursive Adjacency List + CTE

Both `branches` and `messages` tables use **self-referencing foreign keys** (`parent_branch_id` -> `branches.id`, `parent_id` -> `messages.id`). This creates a tree structure that PostgreSQL's `WITH RECURSIVE` CTEs can traverse in a **single query** with no N+1 problem:

```sql
WITH RECURSIVE chain AS (
    SELECT * FROM messages WHERE id = $1      -- base case: start at head
    UNION ALL
    SELECT m.* FROM messages m
    INNER JOIN chain c ON m.id = c.parent_id  -- recursive step: walk up
)
SELECT * FROM chain ORDER BY created_at ASC;
```

This loads an entire conversation history (from any node to root) in **one database round-trip**.

### Merge Algorithm

Merging is the most complex operation. The key insight is the `root_message_id` stored on each branch. It marks the exact fork point:

1. Load the branch's full history via the recursive CTE.
2. **Filter** to only messages _after_ `root_message_id`, excluding all shared history.
3. Send the filtered transcript to the LLM for summarization.
4. Insert a `system` message in the **parent** branch containing the summary.
5. Mark the branch as `is_merged = true`.

This ensures the merge summary contains only the unique contribution of that branch.

### Optimistic UI Updates

User actions (sending a message, forking) render **immediately** with temporary IDs (`temp-{timestamp}`). When the server responds with real UUIDs, the temp entries are swapped in-place. If the server fails, the optimistic update is rolled back and an error is shown.

During streaming, `flushSync` from React DOM forces synchronous rendering of each token chunk, preventing React from batching updates into visual lag.

### Demo Mode

A built-in demo conversation (planning a weekend trip with 4 branches including a merge) lets users explore every feature without needing a database or API key. The demo runs entirely client-side with hardcoded data that mirrors the server action signatures.

---

## Tech Stack

| Layer             | Technology                                                                          | Rationale                                                                                        |
| :---------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **Framework**     | [Next.js 16](https://nextjs.org/) (App Router)                                      | File-based routing, React Server Components, Server Actions, eliminates REST boilerplate         |
| **Language**      | [TypeScript 5](https://www.typescriptlang.org/)                                     | Type safety across complex tree data structures; prevents runtime shape errors                   |
| **Database**      | [PostgreSQL](https://neon.tech/) via Neon Serverless                                | Gold standard for relational/tree data; Neon adds HTTP driver for instant cold starts            |
| **ORM**           | [Drizzle ORM](https://orm.drizzle.team/)                                            | Zero-runtime-overhead, type-safe query builder with native raw SQL support for recursive CTEs    |
| **AI Engine**     | [Vercel AI SDK](https://sdk.vercel.ai/) + [Groq](https://groq.com/) (Llama 3.3 70B) | Groq's LPU architecture gives sub-100ms token latency, streaming feels instant                   |
| **Styling**       | [Tailwind CSS v4](https://tailwindcss.com/)                                         | CSS-first config (no `tailwind.config.js`), utility classes for rapid iteration                  |
| **Animations**    | [Framer Motion](https://motion.dev/)                                                | Industry-standard React animation library for message entry, sidebar transitions, hero particles |
| **UI Primitives** | [shadcn/ui](https://ui.shadcn.com/) (Radix-based)                                   | Copy-paste component model, we own the code, zero unused bundle weight                           |
| **Markdown**      | react-markdown + remark-gfm + KaTeX                                                 | Full rendering of code blocks, tables, GitHub-flavored markdown, and LaTeX equations             |
| **Fonts**         | Space Grotesk + JetBrains Mono                                                      | Geometric sans-serif for UI, monospace for code, loaded via `next/font`                          |

---

## Database Schema

The entire branching system is built on **two tables** with self-referencing foreign keys:

```
branches                              messages
┌──────────────────────┐              ┌──────────────────────┐
│ id            (PK)   │              │ id            (PK)   │
│ name                 │              │ content              │
│ root_message_id (FK) │              │ role (user|asst|sys) │
│ parent_branch_id(FK) │              │ parent_id  (FK→self) │
│ is_merged           │              │ branch_id (FK→branch)│
│ user_id              │              │ is_head              │
│ created_at           │              │ created_at           │
└──────────────────────┘              └──────────────────────┘
       │                                      │
       └── self-referencing tree               └── linked list per branch
```

**Key design decisions:**

- `is_head` boolean ensures exactly one "tip" message per branch at any time, updated atomically on every new message.
- `root_message_id` on branches records the fork point, enabling the merge algorithm to filter shared vs. unique content.
- `ON DELETE CASCADE` on `branch_id` means deleting a branch automatically cleans up all its messages.
- Database-level indexes on `parent_id`, `branch_id`, `user_id`, and `parent_branch_id` keep tree traversal queries fast.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, analytics
│   ├── page.tsx                # Main orchestrator, all client state (~990 LOC)
│   ├── globals.css             # Tailwind v4 config, glassmorphic utilities, custom scrollbar
│   ├── loading.tsx             # Skeleton loading state
│   └── api/chat/route.ts       # AI streaming endpoint (ReadableStream + Groq)
│
├── actions/
│   └── messages.ts             # All Server Actions: CRUD, fork, merge, CTE (~520 LOC)
│
├── components/
│   ├── chat/
│   │   ├── ChatView.tsx        # Message list + input + fork modal
│   │   ├── ChatInput.tsx       # Auto-resizing textarea with Enter-to-send
│   │   └── MessageBubble.tsx   # Single message: markdown render, fork btn, sibling nav
│   ├── layout/
│   │   ├── Sidebar.tsx         # Left panel: conversation list, new chat
│   │   ├── GitTree.tsx         # Right panel: animated SVG branch tree with merge/delete
│   │   └── HelpDialog.tsx      # Onboarding help modal
│   ├── home/
│   │   └── HeroAnimation.tsx   # SVG particle/node graph animation on empty state
│   └── ui/                     # shadcn/ui primitives (dialog, sheet, button, etc.)
│
├── db/
│   ├── schema.ts               # Drizzle schema: branches, messages, relations, types
│   └── index.ts                # Connection: auto-detects Neon HTTP vs. local TCP
│
├── lib/
│   ├── utils.ts                # cn() utility (clsx + tailwind-merge)
│   └── demo-data.ts            # Hardcoded demo conversation with 4 branches
│
└── middleware.ts                # Anonymous session cookie generation
```

---

## Available Scripts

| Command           | Description                                       |
| :---------------- | :------------------------------------------------ |
| `npm run dev`     | Start the Next.js development server on port 3000 |
| `npm run build`   | Create an optimized production build              |
| `npm run start`   | Serve the production build                        |
| `npm run lint`    | Run ESLint with Next.js + TypeScript rules        |
| `npm run db:push` | Push the Drizzle schema to your database          |

---

## Design System

The interface is built around a **dark-first, glassmorphic** aesthetic:

- **Background:** `#09090b` (near-black) with `#111113` surface panels
- **Primary Accent:** `#2dd4bf` (teal/cyan) for active branches, buttons, neon glows
- **Secondary Accent:** `#a78bfa` (purple) for merge operations, merged branch indicators
- **Glass effects:** Semi-transparent panels with `backdrop-blur` for depth
- **Typography:** Space Grotesk (UI) + JetBrains Mono (code), loaded via `next/font` for zero CLS
- **Animations:** Framer Motion for message entry (slide-up + fade), staggered sidebar items, animated SVG branch connectors, and the hero particle system

---

## Performance Considerations

| Technique                                          | Impact                                                                 |
| :------------------------------------------------- | :--------------------------------------------------------------------- |
| **Recursive CTE** instead of N sequential queries  | Entire conversation history loaded in 1 database round-trip            |
| **Client-side branch cache** (`conversationCache`) | Switching branches shows messages instantly from memory                |
| **Optimistic updates** with temp IDs               | User actions render before the server responds                         |
| **`flushSync` during streaming**                   | Each AI token renders synchronously, no React batching lag             |
| **Neon HTTP driver**                               | Serverless-optimized connection (no TCP overhead, instant cold starts) |
| **Database indexes** on all FK columns             | O(1) lookups for parent traversal, branch filtering, and user scoping  |
| **`React.memo` on MessageBubble**                  | Prevents re-renders when sibling messages change                       |
| **Single-query message counts**                    | `getConversationsWithCounts()` uses a LEFT JOIN + GROUP BY, no N+1     |

---

## What I Learned

- Designing tree data structures in relational databases: when to use adjacency lists vs. materialized paths vs. nested sets, and why PostgreSQL's recursive CTEs make adjacency lists the clear winner here.
- Building a streaming pipeline from scratch: `ReadableStream`, `TextDecoder`, and the nuances of `flushSync` for real-time rendering in React 19.
- Managing complex client state without external libraries: organizing 14+ state variables in a single component with `useState` and `useCallback`, plus a manual cache invalidation strategy.
- The tradeoff between Server Actions (simple RPC) and API Routes (full HTTP control), and when each is appropriate in a Next.js App Router app.

---

## Future Roadmap

- [ ] **Authentication:** OAuth via NextAuth.js (Google, GitHub)
- [ ] **Real-time collaboration:** WebSocket sync for multi-user conversation trees
- [ ] **Branch diff view:** Side-by-side comparison of two branches
- [ ] **Multi-model support:** GPT-4o, Claude, Gemini via Vercel AI SDK providers
- [ ] **Conversation search:** Full-text search across all branches and messages
- [ ] **Export:** Download conversations as Markdown or PDF
- [ ] **Virtual scrolling:** Render only visible messages for 10K+ message conversations
- [ ] **Token usage dashboard:** Track cost per conversation and per branch
- [ ] **Branch templates:** Pre-built conversation structures for common workflows

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Anshul Kumar** [GitHub @anshulhq](https://github.com/anshulhq)

<p align="center">
  Made with ❤️ by <a href="https://github.com/anshulhq">anshulhq</a>
</p>

<p align="center">
  Built with Next.js, PostgreSQL, and too many branches.
</p>
