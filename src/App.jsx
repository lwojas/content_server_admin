import { useCallback, useEffect, useMemo, useState } from "react";
import { createContentApi, defaultBaseUrl } from "./api/contentApi";
import { DocumentList } from "./components/DocumentList";
import { DocumentTypeNav } from "./components/DocumentTypeNav";
import { EditorActions } from "./components/EditorActions";
import { JsonEditor } from "./components/JsonEditor";
import { ProjectSelector } from "./components/ProjectSelector";
import { ThemeToggle } from "./components/ThemeToggle";
import "./App.css";

const emptyDocument = "{\n  \n}";

function getInitialTheme() {
  const storedTheme = localStorage.getItem("content-admin-theme");
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [serverUrl, setServerUrl] = useState(defaultBaseUrl);
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState("");
  const [type, setType] = useState("templates");
  const [documents, setDocuments] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [loadedName, setLoadedName] = useState("");
  const [text, setText] = useState(emptyDocument);
  const [cleanText, setCleanText] = useState(emptyDocument);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const api = useMemo(() => createContentApi(serverUrl), [serverUrl]);
  const dirty = text !== cleanText || documentName !== loadedName;
  const jsonError = useMemo(() => {
    try {
      JSON.parse(text);
      return "";
    } catch (error) {
      return error instanceof Error ? error.message : "Invalid JSON";
    }
  }, [text]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("content-admin-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getProjects()
      .then((result) => {
        if (!active) return;
        const nextProjects = result.projects || [];
        setProjects(nextProjects);
        setProject((current) => current || nextProjects[0] || "");
        setNotice(null);
      })
      .catch(
        (error) =>
          active && setNotice({ type: "error", message: error.message }),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [api]);

  const loadDocuments = useCallback(async () => {
    if (!project) return;
    setLoadingDocuments(true);
    try {
      const result = await api.getDocuments(project, type);
      setDocuments(result.documents || []);
      setNotice(null);
    } catch (error) {
      setDocuments([]);
      setNotice({ type: "error", message: error.message });
    } finally {
      setLoadingDocuments(false);
    }
  }, [api, project, type]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  async function selectDocument(name) {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setLoading(true);
    try {
      const document = await api.getDocument(project, type, name);
      const nextText = JSON.stringify(document, null, 2);
      setDocumentName(name);
      setLoadedName(name);
      setText(nextText);
      setCleanText(nextText);
      setNotice({ type: "success", message: `Loaded ${name}.json` });
    } catch (error) {
      setNotice({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  function changeType(nextType) {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setType(nextType);
    setDocuments([]);
    setDocumentName("");
    setLoadedName("");
    setText(emptyDocument);
    setCleanText(emptyDocument);
  }

  function handleProjectChange(nextProject) {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setProject(nextProject);
    setDocuments([]);
    setDocumentName("");
    setLoadedName("");
    setText(emptyDocument);
    setCleanText(emptyDocument);
  }

  function reloadDocument() {
    if (loadedName) {
      selectDocument(loadedName);
    } else {
      setText(cleanText);
      setDocumentName(loadedName);
    }
  }

  async function handleSave() {
    if (!project || !documentName.trim() || jsonError) return;
    let parsedDocument;
    try {
      parsedDocument = JSON.parse(text);
    } catch {
      return;
    }
    setSaving(true);
    try {
      await api.saveDocument(
        project,
        type,
        documentName.trim(),
        parsedDocument,
      );
      setDocumentName(documentName.trim());
      setLoadedName(documentName.trim());
      setCleanText(text);
      await loadDocuments();
      setNotice({
        type: "success",
        message: `Saved ${documentName.trim()}.json`,
      });
    } catch (error) {
      setNotice({ type: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextText = String(reader.result || "");
      try {
        JSON.parse(nextText);
        const nextName = file.name.replace(/\.json$/i, "");
        setDocumentName(nextName);
        setText(nextText);
        setNotice({
          type: "success",
          message: `${file.name} loaded into the editor`,
        });
      } catch (error) {
        setNotice({
          type: "error",
          message: `${file.name} is not valid JSON: ${error.message}`,
        });
      }
    };
    reader.onerror = () =>
      setNotice({ type: "error", message: `Could not read ${file.name}` });
    reader.readAsText(file);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">{`{}`}</div>
          <div>
            <p className="brand-name">Content Admin</p>
            <p className="brand-subtitle">JSON document workspace</p>
          </div>
        </div>
        <div className="header-controls">
          <label className="server-control">
            <span className="eyebrow">Content server</span>
            <input
              value={serverUrl}
              onChange={(event) => setServerUrl(event.target.value)}
              placeholder="Relative or absolute URL"
            />
          </label>
          <ThemeToggle
            darkMode={theme === "dark"}
            onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <ProjectSelector
            projects={projects}
            value={project}
            onChange={handleProjectChange}
            disabled={loading}
          />
          <div className="sidebar-divider" />
          <DocumentTypeNav value={type} onChange={changeType} />
          <DocumentList
            documents={documents}
            selectedName={loadedName}
            onSelect={selectDocument}
            loading={loadingDocuments}
          />
          <p className="sidebar-footnote">
            Connected through the content server API
          </p>
        </aside>

        <section className="editor-panel">
          <div className="editor-toolbar">
            <div className="document-title">
              <span className="eyebrow">
                {project || "No project"} / {type}
              </span>
              <div className="name-row">
                <input
                  aria-label="Document name"
                  className="document-name-input"
                  onChange={(event) =>
                    setDocumentName(event.target.value.replace(/\.json$/i, ""))
                  }
                  placeholder="document-name"
                  value={documentName}
                />
                <span className="extension-label">.json</span>
                {dirty ? (
                  <span className="dirty-indicator">Unsaved changes</span>
                ) : null}
              </div>
            </div>
            <EditorActions
              dirty={dirty}
              loading={loading}
              onReload={reloadDocument}
              onSave={handleSave}
              onUpload={handleUpload}
              saveDisabled={
                !project || !documentName.trim() || Boolean(jsonError)
              }
              saving={saving}
            />
          </div>

          {notice ? (
            <div className={`notice ${notice.type}`} role="status">
              {notice.message}
            </div>
          ) : null}
          {jsonError ? (
            <div className="validation-message" role="alert">
              <strong>Invalid JSON</strong>
              <span>{jsonError}</span>
            </div>
          ) : null}
          <div className="editor-frame">
            <JsonEditor
              darkMode={theme === "dark"}
              onChange={setText}
              value={text}
            />
          </div>
          <footer className="editor-footer">
            <span>
              {dirty
                ? "Changes are local until saved."
                : "Document is up to date."}
            </span>
            <span className={jsonError ? "status-error" : "status-valid"}>
              {jsonError ? "JSON invalid" : "JSON valid"}
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
