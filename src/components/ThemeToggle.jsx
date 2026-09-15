export function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      type="button"
      aria-label="Toggle color theme"
    >
      <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
      <span>{darkMode ? "Light" : "Dark"}</span>
    </button>
  );
}
