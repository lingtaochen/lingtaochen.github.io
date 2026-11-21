const publicationTable = document.querySelector(".publication-table");
const sortableHeaders = publicationTable.querySelectorAll("th[data-sort]");
const publicationSort = document.getElementById("publication-sort");
const citationUpdated = document.getElementById("citation-updated");
const catalog = globalThis.publicationData ?? { papers: [] };
const publicationTemplate = document.getElementById("publication-row");

const numberFormat = new Intl.NumberFormat("en-US");
const timestampFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
  timeZoneName: "short",
});

function createScholarLink(url, text) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = text;
  return link;
}

function renderAuthors(element, authorText) {
  const matches = [...authorText.matchAll(/\b(?:Lingtao|L\.?) Chen\b/gi)];
  element.hidden = !authorText;
  if (matches.length !== 1) {
    element.textContent = authorText;
    return;
  }

  const [match] = matches;
  const author = document.createElement("strong");
  author.className = "publication-author-self";
  author.textContent = match[0];
  element.append(
    authorText.slice(0, match.index),
    author,
    authorText.slice(match.index + match[0].length),
  );
}

const publications = catalog.papers.map((paper) => {
  const row = publicationTemplate.content.firstElementChild.cloneNode(true);
  row.dataset.scholarId = paper.id;
  const scholar = paper.scholar;
  const title = row.querySelector(".publication-title");
  title.textContent = paper.title;
  if (scholar?.paperUrl) {
    title.replaceChildren(createScholarLink(scholar.paperUrl, paper.title));
  }

  renderAuthors(row.querySelector(".publication-authors"), paper.authors ?? "");
  const venue = row.querySelector(".publication-venue");
  venue.querySelector("cite").textContent = paper.venue ?? "";
  venue.append(paper.details ?? "");
  venue.hidden = !(paper.venue || paper.details);

  const count = scholar?.citationCount;
  const hasCount = Number.isInteger(count) && count >= 0;
  const citationCell = row.querySelector(".publication-citations");
  if (hasCount) {
    const countText = numberFormat.format(count);
    citationCell.textContent = countText;
    citationCell.removeAttribute("aria-label");
    if (count > 0 && scholar.citedByUrl) {
      const link = createScholarLink(scholar.citedByUrl, countText);
      link.setAttribute("aria-label", `${countText} ${count === 1 ? "citation" : "citations"} for ${paper.title}`);
      citationCell.replaceChildren(link);
    }
  }

  const year = scholar?.year ?? paper.year;
  row.querySelector(".publication-release-year").textContent = year;
  return {
    row,
    year,
    yearRank: scholar?.retained ? Number.MAX_SAFE_INTEGER : (scholar?.yearRank ?? Number.MAX_SAFE_INTEGER),
    count: hasCount ? count : -1,
  };
});

if (catalog.updatedAt && Number.isFinite(Date.parse(catalog.updatedAt))) {
  citationUpdated.dateTime = catalog.updatedAt;
  citationUpdated.textContent = timestampFormat.format(new Date(catalog.updatedAt));
  document.getElementById("citation-retained").hidden = !catalog.papers.some((paper) => paper.scholar?.retained);
}

function createYearGroup(year) {
  const group = document.createElement("tbody");
  const heading = document.createElement("th");
  heading.className = "publication-year-heading";
  heading.scope = "rowgroup";
  heading.colSpan = publicationTable.tHead.rows[0].cells.length;
  heading.textContent = year;
  group.insertRow().append(heading);
  return group;
}

function renderByYear() {
  const sorted = [...publications].sort((first, second) =>
    second.year - first.year || first.yearRank - second.yearRank
  );
  const groups = document.createDocumentFragment();
  let currentYear;
  let group;

  for (const { row, year } of sorted) {
    if (year !== currentYear) {
      currentYear = year;
      group = createYearGroup(year);
      groups.append(group);
    }
    group.append(row);
  }

  publicationTable.append(groups);
}

function sortPublications() {
  const sort = publicationSort.value;
  for (const header of sortableHeaders) {
    if (header.dataset.sort === sort) header.setAttribute("aria-sort", "descending");
    else header.removeAttribute("aria-sort");
  }
  for (const body of [...publicationTable.tBodies]) body.remove();

  if (sort === "year") {
    renderByYear();
    return;
  }

  const sorted = [...publications].sort((first, second) =>
    second.count - first.count || second.year - first.year
  );
  publicationTable.createTBody().append(...sorted.map(({ row }) => row));
}

publicationSort.value = "citations";
sortPublications();
publicationSort.addEventListener("change", sortPublications);
publicationSort.closest("label").hidden = false;
