const documentTypes = [
  { id: "templates", label: "Templates", hint: "Reusable definitions" },
  { id: "entities", label: "Entities", hint: "Authored records" },
  { id: "maps", label: "Maps", hint: "World documents" },
];

export function DocumentTypeNav({ value, onChange }) {
  return (
    <nav className="type-nav" aria-label="Document types">
      {documentTypes.map((type) => (
        <button
          className={value === type.id ? "type-link active" : "type-link"}
          key={type.id}
          onClick={() => onChange(type.id)}
          type="button"
        >
          <span>{type.label}</span>
          <small>{type.hint}</small>
        </button>
      ))}
    </nav>
  );
}
