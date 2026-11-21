// Each main navigation link names its section by ID. Without JavaScript,
// all sections remain readable on one page and the same links work as anchors.
const navigationLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const sections = new Map(
  navigationLinks.map((link) => {
    const id = link.hash.slice(1);
    return [id, document.getElementById(id)];
  })
);

function showSection(id, moveFocus = false) {
  const activeSection = sections.get(id);
  if (!activeSection) return;

  for (const [sectionId, section] of sections) {
    if (section) section.hidden = sectionId !== id;
  }

  for (const link of navigationLinks) {
    if (link.hash === `#${id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  const heading = document.getElementById(activeSection.getAttribute("aria-labelledby"));
  const name = sections.get("home").querySelector("h1").textContent;
  document.title = id === "home" ? name : `${heading.textContent} | ${name}`;

  if (moveFocus) {
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

const initialSection = window.location.hash.slice(1);
showSection(sections.has(initialSection) ? initialSection : "home");
window.addEventListener("hashchange", () => {
  showSection(window.location.hash.slice(1) || "home", true);
});
