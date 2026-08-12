# SupportPilot — Viva / Review Q&A Prep

## 1. Project Overview

1. **What is this project?**
   SupportPilot is an AI-assisted IT support ticket management system. Employees raise tickets, an AI-style engine auto-classifies their priority/category, Support agents resolve them (with AI-suggested Knowledge Base articles), and Admins manage users, monitor all tickets, view reports, and maintain a Knowledge Base.

2. **What problem does it solve?**
   It centralizes IT/helpdesk ticket handling across three roles (Employee, Support, Admin) so tickets are automatically triaged by priority/category instead of manually sorted, and agents get suggested help articles instead of searching manually.

3. **Who are the users / roles in the system?**
   Three roles: **Employee** (raises tickets, tracks their own tickets, browses KB), **Support** (resolves/escalates tickets, browses KB, sees AI-suggested articles), **Admin** (manages users, monitors all tickets, views reports, manages KB, system settings).

4. **What tech stack did you use?**
   React 18 + Vite for the frontend, React Router v6 for routing, Context API for auth state, Recharts for charts, react-toastify for notifications, plain CSS (theme.css) for styling. No backend server — all data persists in the browser's `localStorage`.

5. **Is there a backend / database?**
   No real backend or database. It's a frontend-only simulation: all "API calls" are async service functions that read/write to `localStorage`, mimicking how a real backend would behave (including artificial delays), so the UI/UX works exactly like a full-stack app would.

6. **Why did you build it without a real backend?**
   To focus on frontend architecture, role-based UI, and business logic (classification, suggestions, reporting) within a scoped project, while keeping the data layer swappable — the service layer is isolated so it could be pointed at a real API later without touching UI code.

## 2. Architecture & Code Structure

7. **How is the codebase organized?**
   By feature/role: `src/pages/Admin`, `src/pages/Employee`, `src/pages/Support` for role-specific screens; `src/layouts` for each role's shell/nav; `src/services` for all business logic (auth, tickets, admin, knowledge base); `src/context` for global auth state; `src/components/common` for shared UI (Button, Input, Modal, Loader, etc.).

8. **How does authentication work?**
   `authService.js` stores a `users` array and the logged-in `user` + a fake token in `localStorage`. `AuthContext` wraps the app, exposes `login`, `register`, `logout`, and current user. `ProtectedRoute` checks the context and the user's `role` before allowing access to role-specific routes.

9. **How do you prevent an Employee from accessing Admin pages?**
   Routes are grouped under `<ProtectedRoute roles={[...]} />` wrappers in `App.jsx`. If the logged-in user's role isn't in the allowed list, they're redirected — so URL-typing into another role's route doesn't work either.

10. **How is state shared across the app?**
    Global state (current user, auth status) lives in `AuthContext` via React Context + `useState`/`useEffect`, consumed with a `useAuth()` hook. Page-level state (tickets, forms) is local `useState` per page, fetched from the relevant service on mount.

11. **Why did you split `adminService.js` and `knowledgeBaseService.js`?**
    Originally KB logic lived inside `adminService.js`, but Employee/Support pages needed KB access without importing an "admin" module. I extracted it into a standalone `knowledgeBaseService.js`; `adminService.js` now delegates its KB methods to it, keeping the Admin KB page's behavior unchanged while giving other roles clean access.

12. **How does data persist between page reloads?**
    Everything (`users`, `tickets`, `kb_articles`, current session) is stored under fixed keys in the browser's `localStorage`, so it survives refreshes as long as it's the same browser/profile.

## 3. Ticket Management

13. **How does ticket creation work?**
    An Employee fills a form (title, category, description) in `Create Ticket`. On submit, `ticketService.createTicket()` runs the classifier, timestamps it, assigns an ID, and stores it in the `tickets` array in `localStorage`.

14. **How does the AI priority/category classification work?**
    It's a keyword-based scoring function (not a real ML model): it scans the ticket's title/description for keyword patterns (e.g. "urgent", "down", "access", "password") mapped to categories and priority levels, and assigns the best match. It's flagged in the UI as "AI Classified" to represent what a real NLP classifier would output.

15. **What ticket statuses/fields exist?**
    Fields: id, title/subject, category, description, priority, status (open/resolved), escalated flag, createdAt, resolvedAt, raisedBy/userId, resolution notes.

16. **How does escalation work?**
    Support agents can mark a ticket as escalated via `ticketService.escalateTicket()`, which flips the `escalated` flag; it then appears on the Support "Escalations" page for prioritized handling.

17. **How does ticket reassignment work?**
    `ticketService.reassignTicket()` updates the assigned agent field on a ticket so it can be moved between Support agents (used from Admin's ticket monitoring/support workflows).

18. **How does an Employee track their own tickets?**
    `Employee/AllTickets` (My Tickets) fetches all tickets and filters by the logged-in employee's user ID, showing only that person's raised tickets and current status.

19. **How does Support see all tickets vs. their own?**
    `Support/AllTickets` lists every open ticket across employees so any agent can pick one up and resolve it — it's not filtered per agent, reflecting a shared queue model.

## 4. Knowledge Base & AI Suggestions

20. **What is the Knowledge Base?**
    A set of help articles (title, category, content) that Admins create/edit/delete, and that Employees and Support can browse/search read-only, plus get automatically suggested per ticket.

21. **How does "AI-suggested articles" work on a ticket?**
    `knowledgeBaseService.getSuggestedArticles(ticket, limit)` scores every article against the ticket using two signals — category match and keyword overlap between the ticket's text and the article's text — then returns the top-scoring matches. It mirrors the same simple, explainable "keyword scoring" approach used for ticket classification, just applied to article relevance instead of priority.

22. **Where do employees see suggested articles?**
    On the Ticket Details page — when they open one of their tickets, a "🤖 AI-suggested help articles" section shows relevant KB content automatically.

23. **Where do Support agents see suggested articles?**
    On the Resolve Ticket page, right above the resolution form — so they can reference a suggested article before writing resolution notes.

24. **Why is it called "AI" if it's just keyword matching?**
    It's a lightweight, deterministic simulation of what an AI/ML classifier or recommender would do in a real system — same UX pattern (automatic suggestions), without needing an actual trained model or external AI API for this project's scope. It could be swapped for a real LLM-based classifier later without changing the UI.

25. **Can Employees or Support edit Knowledge Base articles?**
    No — only Admin can create/edit/delete articles (`Admin/KnowledgeBase.jsx`). Employee and Support only get a read-only, searchable browse view.

## 5. Admin Features

26. **What can an Admin do that other roles can't?**
    Manage all user accounts (create/edit/delete/toggle active status, any role), monitor every ticket across the system, view analytics/reports, manage the Knowledge Base, and change system settings.

27. **What is "User Management"?**
    A directory of every account in the system — regardless of role (Admin/Support/Employee) — since there's a single shared user list. Admin can create new users, edit details/roles, activate/deactivate, or delete accounts from one screen.

28. **Why do admin and support accounts also show up in User Management?**
    Because `getAllUsers()` returns the entire user list with no role filter — it's intentionally a full directory, not an employee-only list, since an Admin needs to manage every kind of account (e.g. onboarding a new Support agent).

29. **What does Ticket Monitoring show?**
    A system-wide view of every ticket (any employee, any status) so Admins can audit volume, see escalations, and check resolution progress without needing agent-level access.

30. **What does the Reports page show, and what did you change about it?**
    It shows total tickets, resolved count, resolution rate, tickets-by-category, and resolved-vs-open — originally rendered as plain CSS div "bars," now rewritten using real Recharts components: a bar chart for category breakdown and a donut/pie chart for resolved vs. open.

31. **Why did you choose Recharts?**
    It's a React-native charting library (already a project dependency), integrates cleanly with component state/props, and supports responsive containers, tooltips, and custom colors without extra configuration overhead.

32. **What does System Settings let an Admin configure?**
    Admin-level configuration such as profile details.

## 6. Security & Data Handling

33. **How are passwords handled?**
    Stored as part of the user object in `localStorage` for this demo/project scope — there is no backend, so there's no real hashing/encryption; this is explicitly a frontend simulation, not a production auth system.

34. **Is this production-ready security-wise?**
    No — since everything lives in browser `localStorage` with no server, there's no real authentication boundary; anyone with browser dev tools could read or edit the data. It's built to demonstrate application logic and UX, not to be deployed as-is with real user data.

35. **How would you make this production-ready?**
    Replace the localStorage-backed services with real API calls to a backend (Node/Express, Django, etc.) with a real database (Postgres/Mongo), hash passwords (bcrypt), use JWT/session-based auth with HTTP-only cookies, and add server-side role checks (not just client-side route guards).

36. **What's the SESSION_SECRET environment variable for?**
    It's provisioned in the environment for future backend session-signing use — not currently consumed by the frontend-only app, but ready if/when a real backend auth layer is added.

## 7. UI / UX Decisions

37. **Why three separate layouts (Employee/Support/Admin)?**
    Each role has a different navigation set and permitted pages, so giving each its own layout component keeps navigation logic simple and avoids conditionally hiding/showing links in one shared layout.

38. **How is the app styled?**
    A single `theme.css` defines a dark, card-based design system (colors, spacing, `.kb-card`, `.stat-card`, etc.) reused consistently across all role dashboards for visual consistency.

39. **How did you handle loading and empty states?**
    A shared `Loader` component shows while async service calls resolve; pages show "No data yet" / "No articles match your search" messaging instead of blank screens.

40. **How does search work on the Knowledge Base pages?**
    Client-side filtering (`useMemo`) against title, category, and content — no backend search, just array filtering against a lowercase query.

## 8. Development Process

41. **What was broken when you started, and what did you fix?**
    The Admin dashboard and Support module were non-functional/placeholder pages; I rebuilt User Management, Ticket Monitoring, Reports, and System Settings into fully working features backed by real service logic, and fixed a bug where editing another user's profile could overwrite the logged-in admin's own session data.

42. **What was the biggest technical challenge?**
    Designing a believable "AI" layer (classification + suggestions) using only deterministic keyword logic — enough to feel intelligent and consistent, without an actual ML model or external API, while keeping the scoring logic simple enough to explain and maintain.

43. **Did you use any external AI/ML APIs?**
    No — all "AI" behavior (priority classification, category detection, article suggestions) is implemented with local keyword-scoring functions, not an external AI service.

44. **How did you test your changes?**
    Manually seeded test data (users, tickets) into localStorage, ran the app locally, and walked through each role's flow end-to-end (login → create/resolve ticket → view KB suggestions → check Admin reports/charts) after every significant change, plus a production build check (`npm run build`) to catch compile errors.

45. **What would you do differently if you rebuilt this?**
    Start with a real backend + database from day one (even a minimal one) so auth and data integrity aren't tied to `localStorage`, and add automated tests for the classification/suggestion scoring logic.

## 9. Future Scope

46. **What features would you add next?**
    Real backend + database, email notifications on ticket updates, file attachments on tickets, a real NLP-based classifier (or LLM API) replacing the keyword scorer, audit logs, and pagination/infinite scroll for large ticket volumes.

47. **Could this scale to a real company?**
    Only after replacing localStorage with a real backend/database and adding proper authentication/authorization — the UI/UX and feature set are otherwise built to scale conceptually (role separation, service-layer abstraction already supports swapping the data layer).

48. **How would you add a real chatbot/AI assistant?**
    Keep the existing service-layer boundary (`knowledgeBaseService`, `ticketService`) and swap the internal keyword-scoring functions for calls to an LLM API (e.g. via a backend proxy) — the UI components that render suggestions wouldn't need to change.

49. **Is the project multi-tenant (multiple companies)?**
    No — it's single-tenant; all users/tickets share one flat list. Multi-tenancy would require adding an organization/company ID to every record and filtering all queries by it.

50. **Can you deploy this project? Is it live anywhere?**
    Yes — it can be published directly since it's a static, frontend-only app; there is a Publish/Deploy option available whenever you're ready to make it live at a shareable URL.

---
*Tip for the review: if she asks something not on this list, it's safe to say "we scoped it as a frontend-only demo focusing on UX and logic; that would need backend work" for anything involving real security, persistence beyond one browser, or real AI/ML.*
