"""Render the audio narration of each note with Kokoro (voice af_heart).

  pnpm narrate                       render every published note that changed
  pnpm narrate where-the-map-ends    only notes whose slug contains the text
  pnpm narrate --dry-run             print the spoken text block by block
  pnpm narrate --force               render even if nothing changed
  pnpm narrate --example             render the inventory's example clip
  pnpm narrate:check                 fail if a note's audio is missing or outdated

Writes `public/audio/<slug>.mp3` and records a fingerprint of each note's
spoken text and settings in `public/audio/narrations.json`, so unchanged notes
are skipped and CI can tell when a narration is missing or outdated (`--check`
only needs PyYAML, no voice model). Words the voice gets wrong
go into `pronunciations.json` (whole words, spoken text only), either as a
respelling or as phonemes: `"Marigold": "[Marigold](/mˈæɹɪɡˌoʊld/)"`.

Needs ffmpeg and espeak-ng (`brew install ffmpeg espeak-ng`) and uv.
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
NOTES = ROOT / "content" / "notes"
OUT = ROOT / "public" / "audio"
LEXICON = Path(__file__).with_name("pronunciations.json")
MANIFEST = OUT / "narrations.json"
EXAMPLE = OUT / "examples" / "inventory.mp3"

VOICE = "af_heart"
SPEED = 1.0
SR = 24000
# Silence after each block in seconds, a heading gets the longer pause before it
PAUSE = {"title": 1.2, "heading": 0.9, "paragraph": 0.55, "item": 0.3}
# About 30 seconds, for trying the player on the inventory page
EXAMPLE_TEXT = [
    ("title", "The quick brown fox."),
    (
        "paragraph",
        "The quick brown fox jumps over the lazy dog. This is a short sample "
        "narration, so the player can be tried without opening a note. It uses "
        "the same voice and the same settings as every note on this site.",
    ),
    (
        "paragraph",
        "Press pause, drag the progress bar, or change the speed to see how the "
        "controls behave. And one more time, for good measure: the quick brown "
        "fox jumps over the lazy dog.",
    ),
]
ABBREVIATIONS = {
    r"\be\.g\.": "for example",
    r"\bi\.e\.": "that is",
    r"\betc\.": "et cetera",
    r"\bvs\.": "versus",
}


# Text
# ---------------
def slug_of(note_dir: Path) -> str:
    return re.sub(r"^\d{4}-\d{2}-\d{2}-", "", note_dir.name)


def read_note(note_dir: Path):
    raw = (note_dir / "index.mdx").read_text()
    _, fm, body = raw.split("---", 2)
    return yaml.safe_load(fm), body


def strip_mdx(body: str) -> str:
    body = re.sub(r"```.*?```", "", body, flags=re.S)
    # import/export statements, possibly spanning several lines
    body = re.sub(r"^(import|export)\b.*?(;|\n\n|\Z)", "", body, flags=re.S | re.M)
    # Self-closing components (figures) are left out of the narration
    body = re.sub(r"<[A-Z][\w.]*\b[^>]*?/>", "", body, flags=re.S)
    # Wrapper components (callouts): drop the tags, keep the children
    body = re.sub(r"</?[A-Z][\w.]*\b[^>]*>", "", body, flags=re.S)
    return body


def clean_inline(text: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)  # images
    text = re.sub(r"\[\^[^\]]+\]", "", text)  # footnote refs
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)  # links keep their label
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"[*_`]{1,3}([^*_`]+)[*_`]{1,3}", r"\1", text)
    text = re.sub(r"\s*[—–]\s*", ", ", text)
    for pattern, spoken in ABBREVIATIONS.items():
        text = re.sub(pattern, spoken, text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip()
    # End every block with punctuation, so the voice drops its pitch
    if text and text[-1] not in ".!?:;\"'”’)":
        text += "."
    return text


def blocks(fm: dict, body: str):
    yield "title", clean_inline(fm["title"])
    for chunk in re.split(r"\n\s*\n", strip_mdx(body)):
        chunk = chunk.strip()
        if not chunk or chunk.startswith("|"):
            continue
        if m := re.match(r"#{1,6}\s+(.*)", chunk):
            yield "heading", clean_inline(m.group(1))
            continue
        items = re.split(r"^\s*(?:[-*+]|\d+\.)\s+", chunk, flags=re.M)
        if len(items) > 1 and not items[0].strip():
            for item in items[1:]:
                yield "item", clean_inline(item)
            continue
        yield "paragraph", clean_inline(re.sub(r"^>\s?", "", chunk, flags=re.M))


def apply_lexicon(text: str, lexicon: dict) -> str:
    for word, spoken in lexicon.items():
        text = re.sub(rf"(?<!\w){re.escape(word)}(?!\w)", spoken, text)
    return text


def fingerprint(spoken) -> str:
    settings = {"voice": VOICE, "speed": SPEED, "pause": PAUSE, "blocks": spoken}
    return hashlib.sha256(json.dumps(settings, sort_keys=True).encode()).hexdigest()[:16]


# Audio
# ---------------
def load_pipeline():
    # The espeak-ng bundled with espeakng-loader looks for its data at the
    # path it was built at, so point it to Homebrew's install instead
    import espeakng_loader

    prefix = subprocess.run(
        ["brew", "--prefix", "espeak-ng"], capture_output=True, text=True, check=True
    ).stdout.strip()
    espeakng_loader.get_library_path = lambda: f"{prefix}/lib/libespeak-ng.dylib"
    espeakng_loader.get_data_path = lambda: f"{prefix}/share/espeak-ng-data"

    from kokoro import KPipeline

    return KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")


def synthesize(pipeline, spoken):
    import numpy as np

    out = []
    for kind, text in spoken:
        if kind == "heading" and out:
            out.append(np.zeros(int(SR * (PAUSE["heading"] - PAUSE["paragraph"]))))
        for result in pipeline(text, voice=VOICE, speed=SPEED):
            out.append(result.audio.numpy())
        out.append(np.zeros(int(SR * PAUSE[kind])))
    return np.concatenate(out)


def encode(audio, mp3: Path, title: str):
    import soundfile as sf

    wav = mp3.with_suffix(".wav")
    sf.write(wav, audio, SR)
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
                # Podcast loudness, mono 96 kbps is plenty for speech
                "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ar", "44100", "-ac", "1", "-b:a", "96k",
                "-metadata", f"title={title}",
                "-metadata", "artist=Sebastian Sebald",
                str(mp3),
            ],
            check=True,
        )
    finally:
        wav.unlink(missing_ok=True)


def read_manifest() -> dict:
    return json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}


def write_manifest(manifest: dict):
    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=2) + "\n")


def report(note: Path, message: str):
    # GitHub Actions shows `::error` lines as annotations on the pull request
    if os.environ.get("GITHUB_ACTIONS"):
        print(f"::error file={(note / 'index.mdx').relative_to(ROOT)}::{message}")
    else:
        print(f"error  {message}", file=sys.stderr)


# Main
# ---------------
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("filter", nargs="*", help="only notes whose slug contains one of these")
    ap.add_argument("--dry-run", action="store_true", help="print the spoken text, render nothing")
    ap.add_argument("--force", action="store_true", help="render even if nothing changed")
    ap.add_argument("--example", action="store_true", help="render the inventory's example clip")
    ap.add_argument("--check", action="store_true", help="fail if a note's audio is missing or outdated")
    args = ap.parse_args()

    if args.example:
        EXAMPLE.parent.mkdir(parents=True, exist_ok=True)
        encode(synthesize(load_pipeline(), EXAMPLE_TEXT), EXAMPLE, "The quick brown fox")
        print(f"wrote  {EXAMPLE.relative_to(ROOT)}")
        return

    lexicon = json.loads(LEXICON.read_text()) if LEXICON.exists() else {}
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = read_manifest()
    failed = False
    pipeline = None

    for note in sorted(p for p in NOTES.iterdir() if (p / "index.mdx").exists()):
        slug = slug_of(note)
        if args.filter and not any(f in slug for f in args.filter):
            continue
        fm, body = read_note(note)
        if fm.get("draft"):
            print(f"skip   {slug} (draft)")
            continue

        spoken = [(k, apply_lexicon(t, lexicon)) for k, t in blocks(fm, body) if t]
        if args.dry_run:
            print(f"\n=== {slug}\n")
            for kind, text in spoken:
                print(f"[{kind}] {text}\n")
            continue

        mp3 = OUT / f"{slug}.mp3"
        fp = fingerprint(spoken)
        current = mp3.exists() and manifest.get(slug) == fp

        if args.check:
            if not mp3.exists():
                report(note, f"{slug} has no narration, run `pnpm narrate {slug}`")
                failed = True
            elif not current:
                report(note, f"{slug} changed since its narration, run `pnpm narrate {slug}`")
                failed = True
            else:
                print(f"ok     {slug}")
            continue

        if current and not args.force:
            print(f"keep   {slug} (unchanged)")
            continue

        print(f"render {slug} ({sum(len(t.split()) for _, t in spoken)} words)", flush=True)
        pipeline = pipeline or load_pipeline()
        encode(synthesize(pipeline, spoken), mp3, fm["title"])
        manifest[slug] = fp
        write_manifest(manifest)

    slugs = {slug_of(p) for p in NOTES.iterdir()}
    for orphan in sorted(p for p in OUT.glob("*.mp3") if p.stem not in slugs):
        print(f"orphan {orphan.relative_to(ROOT)} has no note, delete it if it was renamed", file=sys.stderr)

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
