# Evidesk — Roadmap

## Vision
Build a local-first desktop research workspace for students, researchers, and OSINT-oriented workflows.

The product should help users collect, organize, connect, search, and act on:
- PDFs
- links
- markdown notes
- quotes
- excerpts
- sources
- research tasks

---

# Phase 0 — Product Definition and Architecture

## Goals
- define the product clearly
- define MVP boundaries
- define core user flows
- define data model
- define search strategy
- define archive/delete policy
- define project structure and naming conventions

## Deliverables
- PRODUCT.md
- core flows
- MVP screens
- data model
- data rules
- search and indexing rules
- archive/delete policy
- project structure
- naming conventions
- module boundaries

## Status
In progress / nearly complete

---

# Phase 1 — Technical Bootstrap

## Goals
- install and verify development environment
- initialize Tauri 2 + React + TypeScript + Vite
- configure project structure
- clean starter files
- define app shell
- configure styling foundation
- prepare frontend/backend boundaries

## Deliverables
- working desktop app launches locally
- root layout ready
- sidebar layout skeleton
- base routes/pages
- initial frontend folder usage
- initial backend Rust structure connected to Tauri

---

# Phase 2 — Database Foundation

## Goals
- set up SQLite database
- define initial schema
- create migrations
- connect Rust backend to SQLite
- define model structs and DTOs
- prepare initial seed/debug flow

## Deliverables
- SQLite file creation
- initial tables:
  - topics
  - sources
  - source_topics
  - pdf_assets
  - notes
  - quotes
  - excerpts
  - tasks
  - tags
  - topic_tags
  - source_tags
  - quote_tags
  - excerpt_tags
  - task_tags
- migration strategy documented

---

# Phase 3 — Core CRUD

## Goals
- create and edit topics
- create and edit sources
- create markdown notes
- create tasks
- connect sources to topics
- support Inbox logic

## Deliverables
- topic CRUD
- source CRUD
- note creation/editing
- task creation/editing
- Inbox view powered by source-without-topic logic

---

# Phase 4 — PDF Import System

## Goals
- select PDF from disk
- validate file
- copy into internal library
- compute checksum
- detect duplicates
- create source + pdf asset records
- connect imported PDF to selected topics

## Deliverables
- PDF import flow
- internal library storage
- duplicate detection by SHA-256
- source detail for PDF items

---

# Phase 5 — Search Foundation

## Goals
- implement SQLite FTS-based search
- create unified search index
- search across all key entities
- provide usable result format for UI

## Deliverables
- global search command
- search result model
- result grouping by entity type
- exclude archived content by default
- optional Inbox filter

---

# Phase 6 — Quotes, Excerpts, and Evidence Workflow

## Goals
- create quotes from sources
- create excerpts from sources
- attach commentary
- tag evidence
- show evidence inside source detail and search

## Deliverables
- quote creation
- excerpt creation
- evidence sections in source detail
- evidence searchable in global search

---

# Phase 7 — Tasks and Research Workflow

## Goals
- create contextual research tasks
- link tasks to topic/source/quote/excerpt
- update task status
- filter tasks by state and priority

## Deliverables
- task workflow
- task list page
- contextual task creation from related entities
- no orphan tasks allowed

---

# Phase 8 — Backup / Export

## Goals
- export local workspace backup safely
- include DB and internal library
- create export manifest
- handle common export failures clearly

## Deliverables
- export backup flow
- backup folder or package structure
- export success/error UX states

---

# Phase 9 — UX Polish

## Goals
- improve empty states
- improve loading states
- improve error states
- improve keyboard navigation
- improve visual consistency
- improve motion and responsiveness

## Deliverables
- polished sidebar
- polished detail panels
- empty states for Inbox, Topics, Search, Tasks
- autosave states for notes
- smoother transitions

---

# Phase 10 — Optional AI Integration

## Goals
- support user-provided API key
- keep AI optional
- use AI only as workflow enhancement
- avoid making chat the center of the product

## Possible AI actions
- summarize source
- summarize note
- suggest tags
- generate tasks from evidence
- draft topic summary

## Deliverables
- settings entry for API key
- AI provider abstraction
- first safe AI actions
- AI clearly optional

---

# Phase 11 — Future V2 Directions

## Candidate features
- PDF text extraction improvements
- better PDF preview and annotation
- note backlinks
- smart collections
- saved searches
- stronger duplicate handling
- citation export formats
- import from folders
- updater
- local model support
- richer bibliographic metadata

---

# Project rule

The project must remain:
- local-first
- useful without AI
- structured around sources and topics
- fast
- clean
- portfolio-grade