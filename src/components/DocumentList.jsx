export function DocumentList({ documents, selectedName, onSelect, loading }) {
  return (
    <section className="document-browser" aria-labelledby="documents-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Library</span>
          <h2 id="documents-heading">Documents</h2>
        </div>
        <span className="count-badge">{documents.length}</span>
      </div>
      {loading ? <p className="muted">Loading documents...</p> : null}
      {!loading && documents.length === 0 ? (
        <p className="empty-state">No documents in this collection.</p>
      ) : null}
      <div className="document-list">
        {documents.map((document) => (
          <button
            className={
              selectedName === document
                ? "document-item active"
                : "document-item"
            }
            key={document}
            onClick={() => onSelect(document)}
            type="button"
          >
            <span className="file-mark">{`{}`}</span>
            <span className="document-name">{document}</span>
            <span className="document-extension">.json</span>
          </button>
        ))}
      </div>
    </section>
  );
}
