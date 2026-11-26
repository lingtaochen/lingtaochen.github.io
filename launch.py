"""Refresh the website's Google Scholar publication catalog from this Mac."""

import argparse
import os
from pathlib import Path
import subprocess
import sys

from scripts.publication_data import DATA_FILE

ROOT = Path(__file__).resolve().parent
MACOS_CA_BUNDLE = Path("/etc/ssl/cert.pem")
PUBLISH_BRANCH = "main"


def git(*args, capture=False):
    result = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, check=True,
        stdout=subprocess.PIPE if capture else None,
    )
    return result.stdout.strip() if capture else None


def prepare_publish():
    if git("branch", "--show-current", capture=True) != PUBLISH_BRANCH:
        raise SystemExit("Switch to the main branch to publish, or run without --push to preview.")

    git("fetch", "origin", PUBLISH_BRANCH)
    upstream = git("rev-parse", "FETCH_HEAD", capture=True)
    git("merge", "--ff-only", upstream)
    unrelated = git(
        "log", "--full-history", "--format=%h", f"{upstream}..HEAD", "--",
        ".", f":(exclude){DATA_FILE}", capture=True,
    )
    if unrelated:
        raise SystemExit("Publish your other local commits separately before using --push.")
    return upstream


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--push", action="store_true", help="Commit and publish the catalog to GitHub Pages")
    args = parser.parse_args()

    upstream = prepare_publish() if args.push else None
    env = os.environ.copy()
    if sys.platform == "darwin" and MACOS_CA_BUNDLE.is_file():
        env.setdefault("SSL_CERT_FILE", str(MACOS_CA_BUNDLE))
    refresh = subprocess.run(
        [sys.executable, "-B", str(ROOT / "scripts" / "refresh_citations.py")],
        cwd=ROOT, env=env,
    )
    if refresh.returncode:
        return refresh.returncode
    if not args.push:
        print("Open or reload index.html and select Publications to preview the local catalog.")
        return 0

    if git("diff", "--name-only", "HEAD", "--", DATA_FILE, capture=True):
        git("commit", "--only", "-m", "Sync Google Scholar publications and citations", "--", DATA_FILE)
    if git("rev-parse", "HEAD", capture=True) == upstream:
        print("The publication catalog is already up to date on GitHub.")
        return 0

    git("push", "origin", f"HEAD:refs/heads/{PUBLISH_BRANCH}")
    print("Pushed the publication catalog. GitHub Pages will deploy it.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except subprocess.CalledProcessError as error:
        sys.exit(error.returncode)
