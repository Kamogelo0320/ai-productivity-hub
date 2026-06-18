## AI Workplace Productivity Assistant — Build Plan

A dark-mode SaaS dashboard ("Synapse" style) with five AI tools, a single-conversation chat assistant, localStorage history, and a responsible-AI disclaimer throughout. Powered by Lovable AI (Gemini) on the server.

### Design tokens (locked, from chosen direction)
- Background `#09090b`, surface `#18181b`, surface-hover `#27272a`, border `#27272a`, muted `#a1a1aa`, brand `#6366f1` (indigo).
- Fonts: Space Grotesk (display) + Inter (body), loaded via `<link>` in `__root.tsx`.
- All tokens defined in `src/styles.css` under `@theme` (Tailwind v4). No hardcoded colors in components.

### App shell
- `src/components/AppLayout.tsx` — fixed left sidebar (collapsible on mobile via Sheet) + top bar (search, AI Status indicator, theme toggle, profile) + content `<Outlet />`.
- `src/components/Sidebar.tsx` — nav: Dashboard, Smart Email, Meeting Notes, Task Planner, Research, AI Chat, History, Settings. Active state via `useRouterState`.
- `src/components/ResponsibleAIBar.tsx` — persistent footer disclaimer on every page.

### Routes (`src/routes/`)
- `__root.tsx` — fonts, head meta, layout wrapper.
- `index.tsx` — Dashboard: welcome, 5 stat cards (read from localStorage counters), Quick Actions grid (4 feature buttons), Recent Activity (last 5 history items).
- `email.tsx` — Smart Email Generator (form: purpose, recipient, key points, tone select; output card with subject/body/closing + edit/copy/regenerate/clear/download).
- `meetings.tsx` — Meeting Notes Summarizer (textarea → Summary / Key Decisions / Action Items / Deadlines / Follow-Up sections).
- `tasks.tsx` — AI Task Planner (task list builder, deadlines, priority → Daily / Weekly / Priority Ranking / Focus / Time Allocation).
- `research.tsx` — AI Research Assistant (topic → Overview / Key Points / Insights / Recommendations / Next Steps).
- `chat.tsx` — Single-conversation chat (AI Elements: Conversation, Message, MessageResponse, PromptInput, Shimmer; suggested prompts; "New conversation" clears localStorage).
- `history.tsx` — list of stored items with feature badge, date, preview, reopen, delete; clear-all action.
- `settings.tsx` — theme toggle, AI response style (concise/balanced/detailed), notification toggles, data-privacy toggle, clear-history button, About.

### Server (TanStack Start)
- `src/lib/ai-gateway.server.ts` — Lovable AI Gateway provider helper (openai-compatible, `Lovable-API-Key` header).
- `src/lib/ai.functions.ts` — `createServerFn` handlers: `generateEmail`, `summarizeMeeting`, `planTasks`, `researchTopic`. Each uses `generateText` with `Output.object` + Zod schema, model `google/gemini-3-flash-preview`. Surfaces 429/402 errors clearly.
- `src/routes/api/chat.ts` — streaming chat endpoint using `streamText` + `toUIMessageStreamResponse` for the AI Chat tab.
- Enable Lovable Cloud to provision `LOVABLE_API_KEY` (no DB tables needed since storage is localStorage).

### Client storage (localStorage)
- `src/lib/history.ts` — typed `HistoryItem { id, feature, title, input, output, createdAt }` with `addHistory/listHistory/removeHistory/clearHistory` and a `useHistory` hook. Stat counters derived from history.
- `src/lib/chat-storage.ts` — single `UIMessage[]` keyed `synapse.chat.v1`, plus `resetChat()`.
- `src/lib/settings.ts` — preferences (theme, response style, etc.) in `synapse.settings.v1`.

### Output card pattern (reused across 4 tools)
Shared `src/components/AIOutputCard.tsx`: edit toggle, copy, regenerate, clear, download as `.txt`. Shows loading shimmer during generation. Saves to history on success.

### AI Chat (single conversation)
- AI Elements installed: `conversation message prompt-input shimmer tool`.
- `useChat` with stable id `"main"`, transport `/api/chat`, messages hydrated from localStorage, persisted on `onFinish`/effect.
- Suggested prompt chips from the brief.
- Domain logo (generated) in empty state — not Sparkles.

### Polish
- Mobile: sidebar collapses to Sheet via `useIsMobile`.
- Toasts via existing Sonner for copy/save/errors.
- Loading skeletons on stat cards; shimmer text on AI calls.
- SEO: per-route `head()` with title + description.
- Footer with version + responsible AI notice.

### Out of scope
- No auth / Supabase tables (storage is localStorage by request).
- No real notification system (icon + static list only).
- No file upload for meetings (textarea only) — can be added later.

### Technical notes
- Tailwind v4 `@theme` tokens; shadcn `@theme inline` mapping preserved.
- All AI calls server-side; `LOVABLE_API_KEY` never exposed.
- Chat textarea autofocuses on mount, after send, after stream end, and after reset.
