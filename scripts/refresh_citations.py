"""Sync publications, citations and links from one public Scholar profile page."""

import argparse
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
import unicodedata
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from publication_data import DATA_FILE, format_catalog, parse_catalog

ROOT = Path(__file__).resolve().parents[1]
PROFILE_ID = "7DQMP0EAAAAJ"
PROFILE_URL = "https://scholar.google.com/citations?" + urlencode({
    "user": PROFILE_ID,
    "view_op": "list_works",
    "sortby": "pubdate",
})
CATALOG = ROOT / DATA_FILE
MAX_RESPONSE_BYTES = 2_000_000
SCHOLAR_UNAVAILABLE = 75


@dataclass(frozen=True)
class Publication:
    title: str
    year: int

    @property
    def title_key(self):
        title = unicodedata.normalize("NFKC", self.title).casefold()
        return tuple(re.findall(r"[^\W_]+", title))

    @property
    def match_key(self):
        return self.title_key, self.year


@dataclass(frozen=True)
class ScholarRecord:
    publication: Publication
    count: int
    cited_by_id: str | None
    authors: str
    venue: str


class NoRedirects(HTTPRedirectHandler):
    """Do not follow redirects to a challenge page or another Scholar URL."""

    def redirect_request(self, request, response, code, message, headers, new_url):
        return None


def scholar_query(href, path):
    """Extract query parameters only from an expected Scholar destination."""
    url = urlsplit(href)
    if url.path != path or (url.scheme, url.netloc) not in {
        ("https", "scholar.google.com"), ("", ""),
    }:
        return {}
    return parse_qs(url.query)


class ScholarProfile(HTMLParser):
    """Read publication rows in the order shown in the Scholar Year view."""

    def __init__(self):
        super().__init__()
        self.records = {}
        self.is_year_view = False
        self.row = None
        self.field = None
        self.parts = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        classes = attrs.get("class", "").split()
        href = attrs.get("href", "")
        if tag == "a" and "gsc_dd_sort-sel" in classes:
            query = scholar_query(href, "/citations")
            self.is_year_view = query.get("sortby") == ["pubdate"]
        if tag == "tr" and "gsc_a_tr" in classes:
            self.row = {}
            self.metadata_fields = iter(("authors", "venue"))
        if self.row is None:
            return

        if tag == "div" and "gs_gray" in classes:
            field = next(self.metadata_fields, None)
            if field:
                self.field = ("div", field)
                self.parts = []
        if tag == "span" and "gsc_a_hc" in classes:
            self.field = ("span", "year")
            self.parts = []
        if tag == "a" and "gsc_a_at" in classes:
            query = scholar_query(href, "/citations")
            article = query.get("citation_for_view", [""])[0]
            profile, _, paper = article.partition(":")
            if (
                query.get("view_op") == ["view_citation"]
                and query.get("user") == [PROFILE_ID]
                and profile == PROFILE_ID
                and re.fullmatch(r"[A-Za-z0-9_-]+", paper)
            ):
                self.row["id"] = paper
            self.field = ("a", "title")
            self.parts = []
        if tag == "a" and "gsc_a_ac" in classes:
            self.row["count_href"] = href
            self.field = ("a", "count")
            self.parts = []

    def handle_data(self, data):
        if self.field:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if self.field and self.field[0] == tag:
            self.row[self.field[1]] = "".join(self.parts).strip()
            self.field = None
        if tag == "tr" and self.row is not None:
            self.save_row()
            self.row = None

    def save_row(self):
        paper_id = self.row.get("id")
        title = self.row.get("title", "")
        year = self.row.get("year", "")
        count_text = self.row.get("count")
        count_href = self.row.get("count_href", "")
        if not paper_id or not title or not re.fullmatch(r"[0-9]{4}", year):
            return
        if count_text == "" and not count_href:
            count = 0  # An empty, unlinked count means the paper is uncited.
        elif count_text and re.fullmatch(r"(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)", count_text):
            count = int(count_text.replace(",", ""))
        else:
            return
        if paper_id in self.records:
            raise ValueError("Duplicate publication ID on Scholar profile")
        citing_id = scholar_query(count_href, "/scholar").get("cites", [""])[0]
        valid_id = bool(re.fullmatch(r"[0-9]+(?:,[0-9]+)*", citing_id))
        self.records[paper_id] = ScholarRecord(
            publication=Publication(title, int(year)),
            count=count,
            cited_by_id=citing_id if count > 0 and valid_id else None,
            authors=" ".join(self.row.get("authors", "").split()),
            venue=" ".join(self.row.get("venue", "").split()).removesuffix(f", {year}"),
        )


def match_papers(papers, records, previous_ids):
    """Prefer known IDs. Recover changed IDs only from unique title/year matches."""
    matches = {}
    assigned = set()
    for site_id in papers:
        record_id = previous_ids.get(site_id, site_id)
        if record_id not in records:
            record_id = site_id
        if record_id in records:
            if record_id in assigned:
                raise ValueError(f"Scholar record {record_id} matches multiple site papers")
            matches[site_id] = record_id
            assigned.add(record_id)

    candidates = defaultdict(list)
    for record_id, record in records.items():
        candidates[record.publication.match_key].append(record_id)
    title_counts = Counter(paper.match_key for paper in papers.values())
    for site_id, paper in papers.items():
        if site_id in matches:
            continue
        key = paper.match_key
        options = candidates[key]
        if not options:
            # A paper may be unpublished in Scholar or have moved off the first page.
            continue
        if len(options) != 1 or title_counts[key] != 1 or options[0] in assigned:
            raise ValueError(f"Could not find a unique Scholar record for {paper.title!r}")
        record_id = options[0]
        matches[site_id] = record_id
        assigned.add(record_id)

    return matches


def scholar_data(record_id, record, rank):
    paper_query = urlencode({
        "view_op": "view_citation",
        "hl": "en",
        "user": PROFILE_ID,
        "citation_for_view": f"{PROFILE_ID}:{record_id}",
    })
    cited_by_url = None
    if record.cited_by_id:
        cited_by_url = "https://scholar.google.com/scholar?" + urlencode({
            "oi": "bibs", "hl": "en", "cites": record.cited_by_id,
        })
    return {
        "recordId": record_id,
        "paperUrl": "https://scholar.google.com/citations?" + paper_query,
        "citationCount": record.count,
        "citedByUrl": cited_by_url,
        "year": record.publication.year,
        "yearRank": rank,
        "retained": False,
    }


def sync_papers(papers, records):
    """Preserve publication details while refreshing Scholar data and importing new papers."""
    entries = {}
    for paper in papers:
        paper_id = paper["id"]
        if paper_id in entries:
            raise ValueError(f"Duplicate publication ID in the catalog: {paper_id!r}")
        entries[paper_id] = Publication(paper["title"], paper["year"])
    previous_ids = {
        paper["id"]: paper["scholar"]["recordId"]
        for paper in papers
        if (paper.get("scholar") or {}).get("recordId")
    }
    matches = match_papers(entries, records, previous_ids)
    assigned = set(matches.values())
    seen_titles = {paper.title_key for paper in entries.values()}
    seen_titles.update(records[record_id].publication.title_key for record_id in assigned)
    new_papers = []
    for record_id, record in records.items():
        publication = record.publication
        if record_id in assigned or record_id in entries or publication.title_key in seen_titles:
            continue
        new_papers.append({
            "id": record_id,
            "title": publication.title,
            "authors": record.authors,
            "venue": record.venue,
            "details": "",
            "year": publication.year,
        })
        matches[record_id] = record_id
        seen_titles.add(publication.title_key)

    if not matches:
        raise ValueError("No publication data could be verified")
    ranks = {record_id: rank for rank, record_id in enumerate(records)}
    refreshed_papers = []
    for paper in [*papers, *new_papers]:
        record_id = matches.get(paper["id"])
        scholar = paper.get("scholar")
        if record_id:
            record = records[record_id]
            if record.count > 0 and not record.cited_by_id:
                raise ValueError(f"Missing or invalid Cited by link for {paper['title']!r}")
            scholar = scholar_data(record_id, record, ranks[record_id])
        elif scholar and scholar.get("citationCount") is not None:
            scholar = {**scholar, "retained": True}
        refreshed_papers.append({**paper, "scholar": scholar})

    return refreshed_papers, len(matches), len(new_papers)


def decode_profile(raw, charset=None):
    if not charset:
        meta = re.search(rb"charset\s*=\s*[\"']?([A-Za-z0-9_-]+)", raw[:4096], re.I)
        charset = meta[1].decode("ascii") if meta else "utf-8"
    return raw.decode(charset)


def fetch_profile():
    # The public profile path starts with /citations?user=, as allowed
    # by Scholar's robots.txt. Read the Year view with one request and no retries.
    request = Request(PROFILE_URL, headers={
        "User-Agent": "LingtaoChenPublicationSite/1.0 (+https://lingtaochen.github.io/)",
    })
    with build_opener(NoRedirects()).open(request, timeout=25) as response:
        if response.status != 200 or response.headers.get_content_type() != "text/html":
            raise ValueError("Scholar did not return a profile page")
        raw = response.read(MAX_RESPONSE_BYTES + 1)
        if len(raw) > MAX_RESPONSE_BYTES:
            raise ValueError("Scholar profile exceeded the expected size")
        profile = decode_profile(raw, response.headers.get_content_charset())
    return profile, datetime.now(timezone.utc)


def refresh(saved_profile):
    catalog = parse_catalog(CATALOG.read_text(encoding="utf-8"))
    updated = catalog.get("updatedAt")
    if saved_profile is None and updated:
        last_date = datetime.fromisoformat(updated).astimezone(timezone.utc).date()
        if last_date >= datetime.now(timezone.utc).date():
            print("The publication catalog already has a Scholar update for today (UTC).")
            return

    if saved_profile is None:
        html, fetched_at = fetch_profile()
    else:
        # Use the saved response's write time, not the time this parser runs.
        html = decode_profile(saved_profile.read_bytes())
        fetched_at = datetime.fromtimestamp(saved_profile.stat().st_mtime, timezone.utc)

    profile = ScholarProfile()
    profile.feed(html)
    profile.close()
    years = [record.publication.year for record in profile.records.values()]
    if not profile.is_year_view or not years or years != sorted(years, reverse=True):
        raise ValueError("Scholar did not return the Year view with publications")

    papers, count, added = sync_papers(catalog["papers"], profile.records)
    updated_at = fetched_at.isoformat(timespec="seconds").replace("+00:00", "Z")
    content = format_catalog({**catalog, "updatedAt": updated_at, "papers": papers})
    temporary = CATALOG.with_suffix(".tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(CATALOG)

    print(f"Synced {count} publications at {updated_at}. Added {added} new publication(s).")
    retained = sum(bool((paper.get("scholar") or {}).get("retained")) for paper in papers)
    if retained:
        print(f"Retained Scholar data for {retained} publication(s) missing from the first page.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--saved-profile", type=Path, help="Parse a saved Scholar Year view without making a request")
    args = parser.parse_args()
    try:
        refresh(args.saved_profile)
    except (LookupError, OSError, ValueError) as error:
        print(f"Citation refresh stopped. Previous publication data retained. {error}", file=sys.stderr)
        if isinstance(error, HTTPError) and error.code in {403, 429}:
            return SCHOLAR_UNAVAILABLE
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
