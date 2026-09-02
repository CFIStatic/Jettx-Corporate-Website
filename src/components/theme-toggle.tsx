"use client";

export function ThemeToggle() {
  function toggleTheme() {
    const next =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("jettx-theme", next);
    } catch {
      /* ignore private-mode quota */
    }
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle light and dark"
      onClick={toggleTheme}
    >
      <span className="theme-toggle-knob" />
    </button>
  );
}
