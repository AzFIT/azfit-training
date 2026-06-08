## Dark/Light Mode Theme Requirements (Strict Accessibility Update)

Please implement a fully accessible, semantic dark and light mode theme toggle using Tailwind CSS (`class` strategy) and clean JavaScript. The base design must match the light-mode UI wireframes seen in "Screenshot 2026-06-09 004815.png" through "Screenshot 2026-06-09 004901.png", but with optimized contrast.

### 1. Font Color & Contrast Rules:
*   **Light Mode State (Default):** All primary headers, titles, and body typography must explicitly be a high-contrast charcoal/black variant (`text-slate-900` or `text-black`). Faint gray text on white backgrounds must be eliminated for accessibility.
*   **Dark Mode State:** When the `html` tag has the class `.dark`, all backgrounds must transition to a rich charcoal profile (`dark:bg-slate-950` / `dark:bg-slate-900`), and all text fonts must automatically switch to crisp white or off-white (`dark:text-white` / `dark:text-slate-100`).

### 2. Element Transitions (Light vs. Dark Matrix):
Apply adaptive classes to all major components from the screenshots:
*   **Main Container Card Contexts:** Use `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800`.
*   **Form Input/Dropdown Fields:** Use `bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700`.
*   **Step Wizard Navigation Header:** Ensure the progress tracking lines and step circles transition elegantly (`text-slate-400 dark:text-slate-500` for inactive states).

### 3. Interactive Toggle Code Implementation:
Locate the navigation header's crescent moon icon (`text-slate-700` button container) and bind it to a clean JavaScript event listener. Generate the code exactly like this to ensure smooth operation:

```javascript
// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');

// Check for saved theme preference, otherwise use system preference
if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

themeToggleBtn.addEventListener('click', function() {
    // Toggle utility class on document element
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
});