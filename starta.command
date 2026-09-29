#!/usr/bin/env bash
# macOS: double-click this file in Finder to start StoryBook AI.
# All the actual logic lives in starta.sh so both launchers stay in sync.
cd "$(dirname "$0")" || exit 1
bash starta.sh
