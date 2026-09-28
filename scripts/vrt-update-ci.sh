#!/usr/bin/env sh
# Regenerate the screenshot baselines in CI instead of local Docker. Starts
# the "Update Visual Baselines" workflow for the current branch, pulls the
# commit it pushes and approves the pull request checks for that commit
# (GitHub holds runs triggered by GITHUB_TOKEN pushes for approval).
set -eu

BRANCH=$(git branch --show-current)

if [ "$BRANCH" = "main" ]; then
  echo "Baselines change through pull requests, switch to a branch first." >&2
  exit 1
fi

git fetch --quiet origin "$BRANCH"
if [ "$(git rev-parse HEAD)" != "$(git rev-parse "origin/$BRANCH")" ]; then
  echo "Push '$BRANCH' first, CI updates the baselines of the pushed commit." >&2
  exit 1
fi

BEFORE=$(git rev-parse HEAD)

URL=$(gh workflow run visual-update.yml --ref "$BRANCH" 2>&1 |
  grep -o 'https://[^ ]*/actions/runs/[0-9]*')
echo "Updating baselines: $URL"
gh run watch "${URL##*/}" --exit-status --interval 10 >/dev/null

git pull --ff-only --quiet
SHA=$(git rev-parse HEAD)

if [ "$SHA" = "$BEFORE" ]; then
  echo "Baselines are up to date."
  exit 0
fi

git log --oneline -1

# The held runs show up a few seconds after the push
RUNS=""
for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
  RUNS=$(gh run list --commit "$SHA" --status action_required \
    --json databaseId --jq '.[].databaseId')
  [ -n "$RUNS" ] && break
  sleep 5
done

if [ -z "$RUNS" ]; then
  echo "No checks waiting for approval, nothing left to do."
  exit 0
fi

# Give the remaining workflows a moment to register as well
sleep 5
for ID in $(gh run list --commit "$SHA" --status action_required \
  --json databaseId --jq '.[].databaseId'); do
  gh api --silent -X POST "repos/{owner}/{repo}/actions/runs/$ID/approve"
  echo "Approved run $ID"
done
