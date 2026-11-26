"""Read and write the catalog shared by GitHub Actions and the website."""

import json

DATA_FILE = "assets/js/publications-data.js"
HEADER = (
    "// Publication catalog. Edit bibliographic fields here; the Scholar sync updates the scholar section.\n"
    "globalThis.publicationData = "
)
CONTENT_FIELDS = ("title", "authors", "venue", "details", "year", "githubUrl")


def parse_catalog(text):
    if not text.startswith(HEADER) or not text.endswith(";\n"):
        raise ValueError(f"Unexpected format in {DATA_FILE}")
    return json.loads(text[len(HEADER):-2])


def format_catalog(catalog):
    return HEADER + json.dumps(catalog, indent=2, ensure_ascii=False) + ";\n"


def publication_content(catalog):
    return [
        [paper.get(field, "") for field in CONTENT_FIELDS]
        for paper in catalog["papers"]
    ]
