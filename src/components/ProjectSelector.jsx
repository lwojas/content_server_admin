export function ProjectSelector({ projects, value, onChange, disabled }) {
  return (
    <label className="project-picker">
      <span className="eyebrow">Project</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {projects.length === 0 ? (
          <option value="">No projects found</option>
        ) : null}
        {projects.map((project) => (
          <option value={project} key={project}>
            {project}
          </option>
        ))}
      </select>
    </label>
  );
}
