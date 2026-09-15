export function EditorActions({
  onSave,
  onReload,
  onUpload,
  saveDisabled,
  loading,
  saving,
  dirty,
}) {
  return (
    <div className="editor-actions">
      <button
        className="button secondary"
        onClick={onReload}
        disabled={!dirty || loading || saving}
        type="button"
      >
        <span aria-hidden="true">↻</span> Reload
      </button>
      <label className="button secondary upload-button">
        <span aria-hidden="true">↑</span> Upload JSON
        <input
          accept=".json,application/json"
          onChange={onUpload}
          type="file"
        />
      </label>
      <button
        className="button primary"
        onClick={onSave}
        disabled={saveDisabled || saving}
        type="button"
      >
        {saving ? "Saving..." : "Save document"}
      </button>
    </div>
  );
}
