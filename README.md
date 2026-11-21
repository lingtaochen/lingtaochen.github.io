# Lingtao Chen’s academic website

Open `index.html` in a browser from PyCharm to preview the site. It is plain HTML, CSS, and JavaScript with no dependencies or build step.

## Update the content

- **Homepage update date** — GitHub Pages uses the latest change to the website or to the publication details in the catalog. Scholar-only changes to counts, links, and sort order leave the date alone. A direct browser preview shows the fallback date in `index.html`.
- **Profile and résumé** — edit the `home` section in `index.html`. The résumé summarizes the October 20, 2026 CV.
- **Portrait** — replace `assets/images/selfie.jpeg` with your photo in JPEG format. A vertical 4:5 image (for example, 800 × 1000 pixels) fits without cropping. The image sits next to your name, which already introduces you to screen readers.
- **Research** — edit the topic summaries, current projects, captions, and image paths in `assets/js/research-data.js`. Each topic references papers by ID from the Publications catalog. The figure files and gallery order are documented below.
- **Publications** — all papers are in `assets/js/publications-data.js`. Edit the title, authors, venue, details, or year there. Keep each `id` unique and stable. The daily sync preserves these fields and updates the `scholar` section of each record. You can use `"scholar": null` for a paper that is not yet listed in Scholar.
- **Navigation** — to add a tab, add a link such as `<a href="#teaching">Teaching</a>` inside `site-nav`. Add a corresponding section with `id="teaching"`, `class="site-section"`, and an `aria-labelledby` pointing to its page heading. Give that heading `tabindex="-1"` so the navigation can focus it. The JavaScript picks up the tab automatically.
- **Styling** — edit `assets/css/site.css`. Its top-level variables hold the colors and content width.

## Research figures

Figures are PNG crops from the papers in `assets/images/research/`. Each paper has its own folder. Edit a topic’s `figures` array in `assets/js/research-data.js` to change the gallery order, alt text, or captions. The first entry is the one visitors see first. Each figure’s `paperId` links it to the source paper in the publication catalog. Visitors can open every figure at full size.

| Folder | Paper |
| --- | --- |
| `molecular-dynamics-affinity-2025/` | 2025 automated molecular dynamics study |
| `sequence-affinity-2024/` | 2024 CNN vs. Transformer study |
| `sox17-variants-2026/` | 2026 SOX17 study |
| `protein-structure-review-2024/` | 2024 protein structure prediction review |
| `sepsis-length-of-stay/` | 2022 sepsis hospital length-of-stay study |

## Citation updates and publishing

The website renders the table from `assets/js/publications-data.js`. The catalog holds the paper details, verified links, citation counts, and the most recent refresh time. The daily sync appends new papers from Scholar and updates their Scholar data in the same file. Imported entries use the author names displayed by Scholar, which may be abbreviated.

When ready to publish, set the repository's **Settings → Pages → Source** to **GitHub Actions** and push to `main`. The workflow in `.github/workflows/pages.yml` deploys pushes to `main` and checks Google Scholar once daily at 12:17 UTC. A scheduled run publishes new papers directly alongside citation updates. Manually running or rerunning the workflow deploys the saved data without querying Scholar.

The sync makes one signed-out request to the public profile’s Year view, without pagination or retries. It appends new papers that appear on that first page, skips duplicate IDs or normalized titles, and retains existing entries when they move off the first page. The Publications page indicates when older entries use previously verified data. If Scholar changes a record ID, the sync can adopt a replacement when the title and year uniquely match. An ambiguous replacement or invalid citation link stops the refresh before it saves new data. Review [Google Scholar's crawler rules](https://scholar.google.com/robots.txt) if access changes.

For offline debugging, run `python3 scripts/refresh_citations.py --saved-profile path/to/scholar.html` with a saved profile response from the Year view. The script uses its file modification time as the snapshot time.
