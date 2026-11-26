(() => {
  const storageKey = "site-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = "system";

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "day" || saved === "night") preference = saved;
  } catch {
    // Storage may be unavailable for a local preview or in private browsing.
  }

  function applyTheme() {
    const systemPreference = systemTheme.matches ? "night" : "day";
    document.documentElement.dataset.theme = preference === "system" ? systemPreference : preference;
  }

  // Set the palette before the stylesheet loads so saved choices do not flash.
  applyTheme();
  systemTheme.addEventListener("change", applyTheme);

  document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("site-theme");
    select.value = preference;
    select.addEventListener("change", () => {
      preference = select.value;
      applyTheme();

      try {
        window.localStorage.setItem(storageKey, preference);
      } catch {
        // The selected theme still applies to the open page.
      }
    });
    select.closest("label").hidden = false;
  });
})();
