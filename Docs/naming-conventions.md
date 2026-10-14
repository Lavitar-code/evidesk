# Evidesk — Naming Conventions MVP

## Scopo
Questo documento definisce le convenzioni di naming del progetto Evidesk.

Serve per:
- mantenere coerenza
- evitare nomi confusi
- rendere il codice leggibile
- facilitare la crescita del progetto

---

# 1. Regole generali

## 1.1 Nomi chiari prima di nomi furbi
Preferire nomi espliciti.
Esempi buoni:
- createTopic
- importPdf
- getInboxSources

Esempi cattivi:
- doThing
- handleStuff
- processData2

## 1.2 Un concetto = un nome coerente
Se usi il termine `source`, non alternare casualmente con:
- item
- record
- resource
se intendi la stessa cosa nel dominio principale.

## 1.3 Evitare abbreviazioni inutili
Esempi da evitare:
- srcs
- tsk
- nt
- miscCfg

---

# 2. Convenzioni frontend TypeScript

## 2.1 Componenti React
PascalCase.

Esempi:
- Sidebar
- TopicList
- SourceCard
- NoteEditor
- SearchResultsPanel

## 2.2 File componenti
PascalCase.tsx per componenti principali.

Esempi:
- Sidebar.tsx
- TopicList.tsx
- SourceDetailPanel.tsx

## 2.3 Hook
Formato:
- useSomething

Esempi:
- useTopics
- useInboxSources
- useSearchResults

## 2.4 Variabili e funzioni
camelCase.

Esempi:
- createTopic
- importPdf
- selectedSourceId
- relatedTopics

## 2.5 Costanti
UPPER_SNAKE_CASE solo per costanti vere e stabili.

Esempi:
- MAX_TOPIC_TITLE_LENGTH
- DEFAULT_TASK_PRIORITY

## 2.6 Tipi TypeScript
PascalCase.

Esempi:
- Topic
- Source
- NoteRecord
- SearchResult
- TaskStatus

---

# 3. Convenzioni backend Rust

## 3.1 File Rust
snake_case.

Esempi:
- topic_service.rs
- import_pdf.rs
- search_index.rs

## 3.2 Moduli
snake_case.

## 3.3 Struct
PascalCase.

Esempi:
- Topic
- Source
- PdfAsset
- CreateTopicInput

## 3.4 Funzioni
snake_case.

Esempi:
- create_topic
- import_pdf
- get_inbox_sources

## 3.5 Enum
PascalCase per enum e varianti.
Esempi:
- SourceKind::Pdf
- TaskStatus::InProgress

---

# 4. Convenzioni database

## 4.1 Tabelle
snake_case, plurale dove ha senso.

Esempi:
- topics
- sources
- source_topics
- pdf_assets
- task_tags

## 4.2 Colonne
snake_case.

Esempi:
- created_at
- updated_at
- source_url
- checksum_sha256

## 4.3 Foreign key
Formato:
- entity_id

Esempi:
- topic_id
- source_id
- related_excerpt_id

## 4.4 Tabelle ponte
Formato:
- nome1_nome2

Esempi:
- source_topics
- topic_tags
- source_tags

---

# 5. Convenzioni dominio Evidesk

## 5.1 Terminologia ufficiale
Usare questi termini in modo coerente:
- topic
- source
- quote
- excerpt
- task
- tag
- inbox

## 5.2 Terminologia da evitare se crea confusione
- document quando intendi source
- case quando intendi topic, salvo naming UX futuro specifico
- note item quando intendi una source di kind note

## 5.3 PDF
Usare:
- pdf asset
per il file fisico/metadata file

Usare:
- source
per l’entità logica complessiva

---

# 6. Slug e identificatori

## 6.1 Slug topic
Lo slug deve essere:
- leggibile
- stabile quanto possibile
- derivato dal titolo o generato

## 6.2 ID primari
Gli ID tecnici non devono essere riutilizzati come nomi UI.

---

# 7. Regola finale

Ogni nome deve aiutare a capire:
- cosa rappresenta
- dove vive
- cosa fa
- a quale livello appartiene