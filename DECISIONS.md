# Evidesk — Decisions Log

## Purpose
This file records the main product and technical decisions for Evidesk.

It exists to:
- avoid re-deciding the same things
- keep the project coherent
- document why key choices were made
- guide future implementation

---

# Confirmed decisions

## Product name
- Evidesk

## Product type
- local-first desktop research workspace

## Primary audience
- students
- researchers
- OSINT-oriented workflows

## Product positioning
- not a generic AI chat app
- not just a PDF viewer
- not a simple bookmark manager
- not a clone of Notion or Obsidian
- a structured workspace for research material, evidence, and tasks

---

# Core product decisions

## Core unit of the system
- `source` is the central domain entity

## Topic model
- topics are logical containers
- sources can belong to zero, one, or many topics

## Inbox
- Inbox is enabled
- Inbox is a logical view
- Inbox is not a DB table
- a source is in Inbox when it has no topic links

## Notes
- notes are markdown
- notes are also sources of kind `note`
- note content lives in a dedicated `notes` table

## PDF handling
- PDFs are copied into the internal library
- the original user file path is not the source of truth
- duplicate detection is based on SHA-256 checksum

## Search
- search is a core feature
- search must be global
- search must cover multiple entity types
- search should use SQLite FTS for MVP

## Tags
- tags are reusable global entities
- tags use normalized names to avoid duplicates

## Tasks
- tasks must always be linked to something
- no orphan tasks allowed
- a task must be linked to at least one of:
  - topic
  - source
  - quote
  - excerpt

## Archive policy
- archive is preferred over destructive delete
- delete should be minimal and explicit
- PDF file deletion must be handled cautiously

## AI
- AI is optional
- AI should use user-provided API key
- the product must remain useful without AI
- AI is an enhancement, not the center of the UX

---

# UX decisions

## Navigation model
- sidebar sections (Option A)

## Main sidebar sections
- Inbox
- Topics
- All Sources
- Notes
- Tasks
- Search

## Design direction
- Notion/Obsidian-inspired
- clean
- reactive
- fast
- smooth but restrained motion

## Motion principles
- short transitions
- fluid but not distracting
- productivity-first animation

---

# Technical decisions

## Desktop framework
- Tauri 2

## Frontend
- React
- TypeScript
- Vite

## UI
- Tailwind CSS
- shadcn/ui

## State management
- Zustand

## Backend language
- Rust

## Local database
- SQLite

## Search engine for MVP
- SQLite FTS

## Architecture
- frontend handles UI and interaction
- backend handles DB, files, validation, import, search, backup

---

# Repository structure decisions

## Root folders
- Docs/
- database/
- scripts/
- assets/
- src/
- src-tauri/

## Frontend structure
- app/
- components/
- features/
- hooks/
- lib/
- pages/
- stores/
- styles/
- types/

## Backend structure
- src-tauri/src/commands/
- src-tauri/src/db/
- src-tauri/src/files/
- src-tauri/src/models/
- src-tauri/src/search/
- src-tauri/src/services/
- src-tauri/src/state/

---

# Data behavior decisions

## Source kinds for MVP
- pdf
- url
- note
- manual

## Quote model
- quote is short and atomic
- quote belongs to a source

## Excerpt model
- excerpt is longer and more workable
- excerpt belongs to a source

## Multi-topic linking
- enabled from MVP

## Archived visibility
- archived content excluded by default from standard views and search
- archived content may be shown through explicit filters later

---

# Development principles

## Build order
- product definition first
- architecture second
- bootstrap third
- database foundation before heavy UI
- search early, not as an afterthought

## Project quality goals
- strong portfolio value
- real usefulness
- maintainable code
- clear architecture
- scalable foundation
- local-first reliability

---

# Rule for future changes

Any major change to:
- architecture
- data model
- product scope
- search strategy
- file handling
- AI role

should be recorded here before or during implementation.