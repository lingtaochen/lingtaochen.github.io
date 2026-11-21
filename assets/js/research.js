const researchSection = document.getElementById("research");
const researchTemplate = document.getElementById("research-topic");
const researchContent = globalThis.researchData;
const researchPapers = new Map(
  (globalThis.publicationData?.papers ?? []).map((paper) => [paper.id, paper])
);

function renderResearchFigures(media, figures) {
  if (!figures.length) {
    media.hidden = true;
    return;
  }

  const preview = media.querySelector(".research-figure-preview");
  const image = preview.querySelector("img");
  const caption = media.querySelector(".research-figure-caption");
  const source = media.querySelector(".research-figure-source");
  const credit = media.querySelector(".research-figure-credit");
  const creditSource = credit.querySelector(".research-figure-credit-source");
  const license = credit.querySelector(".research-figure-license");
  const controls = media.querySelector(".research-figure-controls");
  const counter = media.querySelector(".research-figure-count");
  let index = 0;

  function updateFigure() {
    const figure = figures[index];
    image.src = figure.src;
    image.alt = figure.alt;
    caption.textContent = figure.caption ?? "";

    if (figure.paperId) {
      preview.href = figure.src;
      preview.title = "Open full-size figure in a new tab";
    } else {
      preview.removeAttribute("href");
      preview.removeAttribute("title");
    }

    const paper = researchPapers.get(figure.paperId);
    const url = paper?.scholar?.paperUrl;
    source.hidden = !url;
    if (url) {
      source.href = url;
      source.setAttribute("aria-label", `Source paper: ${paper.title}`);
    } else {
      source.removeAttribute("href");
      source.removeAttribute("aria-label");
    }
    const creditData = researchContent.figureCredits?.[figure.paperId];
    credit.hidden = !creditData;
    if (creditData) {
      creditSource.textContent = creditData.notice;
      creditSource.href = creditData.source;
    }
    license.hidden = !creditData?.license;
    if (creditData?.license) license.href = creditData.license;
    else license.removeAttribute("href");

    caption.parentElement.hidden = !figure.caption && !url && !creditData;
    counter.textContent = `${index + 1} of ${figures.length}`;
  }

  function changeFigure(step) {
    index = (index + step + figures.length) % figures.length;
    updateFigure();
  }

  if (figures.length > 1) {
    controls.hidden = false;
    controls.querySelector(".research-figure-previous").addEventListener("click", () => changeFigure(-1));
    controls.querySelector(".research-figure-next").addEventListener("click", () => changeFigure(1));
  }
  updateFigure();
}

function renderResearchTopic(topic) {
  const row = researchTemplate.content.firstElementChild.cloneNode(true);
  const heading = row.querySelector("h2");
  heading.id = `research-${topic.id}`;
  heading.textContent = topic.title;
  row.setAttribute("aria-labelledby", heading.id);
  row.querySelector(".research-summary").textContent = topic.summary;

  const figures = topic.figures ?? (topic.figure ? [topic.figure] : []);
  renderResearchFigures(row.querySelector(".research-media"), figures);

  const list = row.querySelector(".research-papers");
  for (const id of topic.paperIds) {
    const paper = researchPapers.get(id);
    if (!paper) continue;
    const item = document.createElement("li");
    const url = paper.scholar?.paperUrl;
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = paper.title;
      item.append(link);
    } else {
      item.textContent = paper.title;
    }
    item.append(` (${paper.year})`);
    list.append(item);
  }
  list.hidden = !list.childElementCount;
  return row;
}

researchSection.querySelector(".research-introduction").textContent = researchContent.introduction;
researchSection.querySelector(".research-topics").append(...researchContent.topics.map(renderResearchTopic));

function renderCurrentProjects(projects) {
  const section = researchSection.querySelector(".current-projects");
  const list = section.querySelector(".current-projects-list");
  const template = document.getElementById("current-project");

  for (const project of projects) {
    const item = template.content.firstElementChild.cloneNode(true);
    item.querySelector("h3").textContent = project.title;
    item.querySelector(".current-project-status").textContent = project.status;
    item.querySelector(".current-project-summary").textContent = project.summary;
    list.append(item);
  }

  section.hidden = !list.childElementCount;
}

renderCurrentProjects(researchContent.currentProjects ?? []);
