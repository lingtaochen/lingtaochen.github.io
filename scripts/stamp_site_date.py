"""Set the homepage's update date in the copy being published."""

import argparse
from datetime import date
from pathlib import Path
import re
import subprocess

from publication_data import DATA_FILE, parse_catalog, publication_content

ROOT = Path(__file__).resolve().parents[1]
SITE_FILES = ("index.html", "assets")


def git_output(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, encoding="utf-8").strip()


def latest_site_date():
    # Ordinary site files count as changes. For the catalog, compare only its
    # bibliographic fields so a daily Scholar refresh won't advance the date.
    log = ("log", "--first-parent", "--format=%H %cs")
    latest_other = git_output(*log, "-1", "--", *SITE_FILES, f":(exclude){DATA_FILE}")
    if not latest_other:
        raise SystemExit("Could not find a commit that changed the website files.")
    other_commit, _ = latest_other.split()
    current = publication_content(parse_catalog((ROOT / DATA_FILE).read_text(encoding="utf-8")))
    for change in git_output(*log, "--", *SITE_FILES).splitlines():
        commit, commit_date = change.split()
        if commit == other_commit:
            return commit_date
        previous = subprocess.run(
            ["git", "show", f"{commit}^:{DATA_FILE}"],
            cwd=ROOT,
            capture_output=True,
            encoding="utf-8",
        )
        # The file may not exist in the parent of its first commit.
        previous_content = publication_content(parse_catalog(previous.stdout)) if previous.returncode == 0 else []
        if current != previous_content:
            return commit_date
    raise SystemExit("Could not find a commit that changed the website content.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("homepage", type=Path, help="Homepage in the deployment copy")
    homepage = parser.parse_args().homepage

    updated = date.fromisoformat(latest_site_date())
    readable = f"{updated:%B} {updated.day}, {updated.year}"
    tag = f'<time id="site-updated" datetime="{updated.isoformat()}">{readable}</time>'
    html = homepage.read_text(encoding="utf-8")
    stamped, count = re.subn(r'<time id="site-updated" datetime="[^"]*">[^<]*</time>', tag, html)
    if count != 1:
        raise SystemExit("Expected exactly one homepage update date in the deployment copy.")
    homepage.write_text(stamped, encoding="utf-8")


if __name__ == "__main__":
    main()
