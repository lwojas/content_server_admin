# Content Admin

`content-admin` is a small standalone React application for manually managing JSON documents stored by the existing Content Server.

It provides a focused administration workspace for browsing projects, choosing a document collection, editing complete JSON documents, and saving them through the Content Server HTTP API.

The application is generic by design. It does not understand ECS components, maps, entities, templates, or any other game-specific schema. Documents remain opaque JSON text from the admin application's point of view.

## Key Features

- Select a project returned by the Content Server.
- Browse `templates`, `entities`, and `maps`.
- List and load documents for the selected project and type.
- Edit complete documents as text in CodeMirror 6.
- JSON syntax highlighting, line numbers, indentation, bracket matching, and standard editor interactions.
- Validate JSON before saving.
- Keep invalid edits in the editor without sending a `PUT` request.
- Track unsaved changes and warn before leaving the page.
- Reload the currently loaded document and discard local edits.
- Upload a local `.json` file into the editor.
- Use the uploaded filename as the proposed document name.
- Save complete JSON documents through the existing `PUT` endpoint.
- Display loading, success, upload, validation, save, and error states.
- Support light and dark themes.
- Follow the system color preference initially and persist manual theme overrides in `localStorage`.
- Configure the Content Server URL without changing application code.

## Technology

- React
- JavaScript only
- Vite
- CodeMirror 6
- CSS custom properties for application design tokens and themes

No TypeScript or large UI framework is used.

## Project Structure

```text
content-admin/
├── .env.example
├── index.html
├── package.json
├── public/
└── src/
    ├── api/
    │   └── contentApi.js
    ├── components/
    │   ├── DocumentList.jsx
    │   ├── DocumentTypeNav.jsx
    │   ├── EditorActions.jsx
    │   ├── JsonEditor.jsx
    │   ├── ProjectSelector.jsx
    │   └── ThemeToggle.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    └── main.jsx
```

### API client

`src/api/contentApi.js` is the only module responsible for HTTP communication. React components call this module instead of using `fetch` directly.

The client handles configurable server URL construction, JSON request and response handling, URL encoding, and conversion of non-success HTTP responses into useful UI errors.

### Application state

`App.jsx` owns the current project, document type, document name, raw editor text, clean text, loading state, save state, notices, and theme state.

The editor state is intentionally text-based:

```text
server document
      |
      v
JSON.stringify(document, null, 2)
      |
      v
CodeMirror text editor
      |
      v
JSON.parse(text)
      |
      v
PUT complete document
```

The app never inspects or modifies fields inside a document.

## Content Server API

The admin app communicates only with these existing endpoints:

| Method | Endpoint                             | Purpose                     |
| ------ | ------------------------------------ | --------------------------- |
| `GET`  | `/api/projects`                      | List projects               |
| `GET`  | `/api/projects/:project/:type`       | List documents              |
| `GET`  | `/api/projects/:project/:type/:name` | Load a complete document    |
| `PUT`  | `/api/projects/:project/:type/:name` | Replace a complete document |

The app does not add or require backend endpoints.

Expected list response shapes:

```json
{
  "projects": ["raycaster"]
}
```

```json
{
  "project": "raycaster",
  "type": "maps",
  "documents": ["arena", "testMap"]
}
```

Loaded documents are returned directly as JSON. Save requests send the parsed JSON document directly as the request body.

## Configuration

Copy the example environment file when configuring a local server:

```bash
cp .env.example .env
```

Set the Vite environment variable:

```env
VITE_CONTENT_SERVER_URL=http://localhost:4000
```

For a Content Server running on another machine:

```env
VITE_CONTENT_SERVER_URL=http://lynn2:4000
```

The value may also be empty when the app is served from the same origin as a reverse proxy that forwards `/api` requests.

Vite environment values are read when the development server starts or when the production bundle is built. Restart Vite after changing `.env`.

The server URL can also be edited in the application header at runtime. This setting is held in application state for the current session; the theme preference is the setting persisted in `localStorage`.

## Local Development

Requirements:

- Node.js compatible with the installed Vite version.
- npm.
- A running Content Server when loading or saving real documents.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app is normally available at `http://localhost:5173`.

To expose the development server on the local network:

```bash
npm run dev -- --host 0.0.0.0
```

Run the production build, preview it locally, or lint the source:

```bash
npm run build
npm run preview
npm run lint
```

## Editing Workflow

1. Start the Content Server.
2. Start the Vite development server.
3. Select the Content Server URL if it is not already configured.
4. Select a project.
5. Select `templates`, `entities`, or `maps`.
6. Select an existing document or enter a new document name.
7. Edit the complete JSON document in CodeMirror.
8. Save only after the document is valid JSON.

The editor keeps the user's text intact when JSON is invalid. The save button remains disabled until the JSON is valid and a project and document name are available.

Uploading a JSON file reads it in the browser. The file is validated locally and displayed in CodeMirror; it is not uploaded as a binary file. Saving the upload uses the same JSON `PUT` request as any other document.

## Themes

The application supports light and dark themes using CSS custom properties.

- First visit follows `prefers-color-scheme`.
- The visible theme toggle switches between light and dark modes.
- A manual choice is stored under `content-admin-theme` in `localStorage`.
- The CodeMirror editor theme changes with the application theme.

## Scope Boundaries

This project intentionally does not include:

- Delete functionality.
- Authentication or authorization.
- Version history.
- Conflict resolution or offline synchronization.
- Schema-aware form editing.
- ECS or game-specific knowledge.
- Backend changes or additional API endpoints.

The Content Server remains responsible for persistence. The admin app remains responsible for editing complete JSON documents.
