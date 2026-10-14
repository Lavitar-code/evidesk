# Evidesk — Entity Checklist

## Entità principali MVP
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

---

## topics
Scopo:
- contenere dossier/argomenti di ricerca

Campi principali:
- id
- title
- slug
- description
- color
- icon
- created_at
- updated_at
- archived_at

---

## sources
Scopo:
- rappresentare ogni fonte principale del sistema

Tipi MVP:
- pdf
- url
- note
- manual

Campi principali:
- id
- kind
- title
- description
- author
- publisher
- published_at
- source_url
- canonical_url
- created_at
- updated_at
- archived_at

---

## source_topics
Scopo:
- collegare fonti e topic

Campi principali:
- source_id
- topic_id
- linked_at

---

## pdf_assets
Scopo:
- descrivere il file PDF fisico legato a una source pdf

Campi principali:
- id
- source_id
- original_filename
- stored_filename
- stored_rel_path
- checksum_sha256
- mime_type
- file_size_bytes
- page_count
- text_extract_status
- imported_at

---

## notes
Scopo:
- salvare il contenuto markdown delle source tipo note

Campi principali:
- id
- source_id
- markdown_content
- word_count
- created_at
- updated_at

---

## quotes
Scopo:
- salvare citazioni brevi

Campi principali:
- id
- source_id
- text
- page_number
- locator
- commentary
- created_at
- updated_at

---

## excerpts
Scopo:
- salvare estratti più estesi

Campi principali:
- id
- source_id
- title
- text
- page_start
- page_end
- commentary
- created_at
- updated_at

---

## tasks
Scopo:
- gestire attività collegate alla ricerca

Campi principali:
- id
- title
- description
- status
- priority
- due_at
- topic_id
- related_source_id
- related_quote_id
- related_excerpt_id
- created_at
- updated_at
- completed_at

---

## tags
Scopo:
- organizzazione trasversale

Campi principali:
- id
- name
- normalized_name
- color
- created_at

---

## topic_tags
Scopo:
- collegare topic e tag

Campi principali:
- topic_id
- tag_id
- linked_at

---

## source_tags
Scopo:
- collegare source e tag

Campi principali:
- source_id
- tag_id
- linked_at

---

## quote_tags
Scopo:
- collegare quote e tag

Campi principali:
- quote_id
- tag_id
- linked_at

---

## excerpt_tags
Scopo:
- collegare excerpt e tag

Campi principali:
- excerpt_id
- tag_id
- linked_at

---

## task_tags
Scopo:
- collegare task e tag

Campi principali:
- task_id
- tag_id
- linked_at