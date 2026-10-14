# Evidesk — Data Model MVP

## Scopo
Questo documento definisce il modello dati ufficiale dell’MVP di Evidesk.

Serve per:
- progettare il database SQLite
- progettare i comandi backend
- progettare i form frontend
- progettare la ricerca
- evitare ambiguità architetturali

---

# 1. Principi del modello dati

## 1.1 Fonte come entità centrale
In Evidesk l’entità centrale non è il PDF e non è la nota.
L’entità centrale è `source`.

Una source può rappresentare:
- un PDF
- un link
- una nota
- una fonte manuale
- in futuro un attachment

Tutto il resto si collega a `source` quando ha senso:
- pdf asset
- note content
- quote
- excerpt
- task collegati
- tag
- topic links

## 1.2 Topic multipli
Una source può appartenere a:
- zero topic
- uno topic
- più topic

Zero topic significa che la source è in Inbox.

## 1.3 Inbox
Se una source non è collegata a nessun topic, è considerata appartenente alla Inbox.

La Inbox:
- non è una tabella separata
- non è un vero topic salvato nel DB
- è una vista logica del sistema

## 1.4 Note come source
Le note sono una tipologia di source.

Quindi:
- una nota crea sempre un record in `sources`
- il contenuto markdown vero vive nella tabella `notes`

## 1.5 Quote ed Excerpt
Quote ed Excerpt non sono source autonome.
Sono evidenze collegate a una source esistente.

## 1.6 Task
I task possono essere collegati a:
- topic
- source
- quote
- excerpt

## 1.7 Tag
I tag sono entità riusabili e possono essere associati a più tipi di oggetto.

Per l’MVP verranno usate tabelle ponte separate.

---

# 2. Entità principali

## 2.1 topics

## Descrizione
Contiene i topic di ricerca, cioè i dossier o argomenti principali.

## Campi
- `id`
- `title`
- `slug`
- `description`
- `color`
- `icon`
- `created_at`
- `updated_at`
- `archived_at`

## Regole
- `title` è obbligatorio
- `slug` è derivato dal titolo o generato
- `archived_at` null = topic attivo
- topic archiviato non viene cancellato

## Note
Un topic è un contenitore logico, non possiede fisicamente i file.

---

## 2.2 sources

## Descrizione
Contiene tutte le fonti principali del sistema.

## Tipi previsti per MVP
- `pdf`
- `url`
- `note`
- `manual`

## Campi
- `id`
- `kind`
- `title`
- `description`
- `author`
- `publisher`
- `published_at`
- `source_url`
- `canonical_url`
- `created_at`
- `updated_at`
- `archived_at`

## Regole
- `kind` obbligatorio
- `title` facoltativo in alcuni casi, ma fortemente consigliato
- `source_url` usato solo per fonti web o simili
- `canonical_url` usato per normalizzazione link
- `archived_at` per soft archive

## Note
Una source esiste anche se non è collegata a topic.

---

## 2.3 source_topics

## Descrizione
Tabella ponte tra sources e topics.

## Campi
- `source_id`
- `topic_id`
- `linked_at`

## Regole
- coppia (`source_id`, `topic_id`) unica
- se una source non ha righe in questa tabella, è in Inbox

## Note
Questa tabella rende possibile:
- riuso fonti
- ricerca cross-topic
- workflow più realistico

---

## 2.4 pdf_assets

## Descrizione
Contiene i metadata del file fisico PDF associato a una source di tipo `pdf`.

## Campi
- `id`
- `source_id`
- `original_filename`
- `stored_filename`
- `stored_rel_path`
- `checksum_sha256`
- `mime_type`
- `file_size_bytes`
- `page_count`
- `text_extract_status`
- `imported_at`

## Regole
- `source_id` unico
- una source di tipo `pdf` ha al massimo un pdf asset
- `stored_rel_path` è relativo alla libreria interna
- `checksum_sha256` usato per duplicate detection
- `text_extract_status` indica stato di estrazione testo

## Valori possibili text_extract_status
- `not_started`
- `success`
- `failed`
- `not_supported`

## Note
Il file PDF reale è gestito nel filesystem locale, non nel database.

---

## 2.5 notes

## Descrizione
Contiene il contenuto markdown delle source di tipo `note`.

## Campi
- `id`
- `source_id`
- `markdown_content`
- `word_count`
- `created_at`
- `updated_at`

## Regole
- `source_id` unico
- esiste solo se la source collegata ha `kind = note`

## Note
La tabella `notes` separa i metadata della fonte dal contenuto vero della nota.

---

## 2.6 quotes

## Descrizione
Contiene citazioni brevi e puntuali collegate a una source.

## Campi
- `id`
- `source_id`
- `text`
- `page_number`
- `locator`
- `commentary`
- `created_at`
- `updated_at`

## Regole
- `text` obbligatorio
- `page_number` facoltativo
- `locator` può contenere riferimenti più liberi
- `commentary` è la nota utente sulla citazione

## Note
Le quote devono essere brevi, precise, atomiche.

---

## 2.7 excerpts

## Descrizione
Contiene estratti più estesi e lavorabili collegati a una source.

## Campi
- `id`
- `source_id`
- `title`
- `text`
- `page_start`
- `page_end`
- `commentary`
- `created_at`
- `updated_at`

## Regole
- `text` obbligatorio
- `title` facoltativo
- `page_start` e `page_end` facoltativi

## Note
Gli excerpt sono più lunghi e più operativi delle quote.

---

## 2.8 tasks

## Descrizione
Contiene task di ricerca, analisi o follow-up.

## Campi
- `id`
- `title`
- `description`
- `status`
- `priority`
- `due_at`
- `topic_id`
- `related_source_id`
- `related_quote_id`
- `related_excerpt_id`
- `created_at`
- `updated_at`
- `completed_at`

## Regole
- `title` obbligatorio
- `status` obbligatorio
- `priority` obbligatorio
- `topic_id` facoltativo
- almeno uno tra:
  - topic_id
  - related_source_id
  - related_quote_id
  - related_excerpt_id
  può essere presente, ma per MVP non imponiamo ancora un vincolo rigido SQL
- `completed_at` valorizzato quando task è completato

## Valori status
- `open`
- `in_progress`
- `done`
- `cancelled`

## Valori priority
- `low`
- `medium`
- `high`

## Note
I task devono essere veloci da creare.

---

## 2.9 tags

## Descrizione
Contiene i tag riusabili del sistema.

## Campi
- `id`
- `name`
- `normalized_name`
- `color`
- `created_at`

## Regole
- `name` obbligatorio
- `normalized_name` obbligatorio e unico
- `normalized_name` serve a evitare duplicati logici:
  - AI
  - ai
  - Ai

## Note
La normalizzazione iniziale può essere:
- trim
- lowercase
- spazi multipli ridotti

---

## 2.10 topic_tags

## Campi
- `topic_id`
- `tag_id`
- `linked_at`

## Regole
- coppia unica (`topic_id`, `tag_id`)

---

## 2.11 source_tags

## Campi
- `source_id`
- `tag_id`
- `linked_at`

## Regole
- coppia unica (`source_id`, `tag_id`)

---

## 2.12 quote_tags

## Campi
- `quote_id`
- `tag_id`
- `linked_at`

## Regole
- coppia unica (`quote_id`, `tag_id`)

---

## 2.13 excerpt_tags

## Campi
- `excerpt_id`
- `tag_id`
- `linked_at`

## Regole
- coppia unica (`excerpt_id`, `tag_id`)

---

## 2.14 task_tags

## Campi
- `task_id`
- `tag_id`
- `linked_at`

## Regole
- coppia unica (`task_id`, `tag_id`)

---

# 3. Relazioni

## topics
- ha molti `source_topics`
- ha molte `sources` tramite `source_topics`
- ha molti `tasks`
- ha molti `topic_tags`

## sources
- ha molti `source_topics`
- ha molti `topics` tramite `source_topics`
- può avere uno `pdf_asset`
- può avere una `note`
- ha molte `quotes`
- ha molti `excerpts`
- ha molti `source_tags`

## pdf_assets
- appartiene a una `source`

## notes
- appartiene a una `source`

## quotes
- appartengono a una `source`
- hanno molti `quote_tags`

## excerpts
- appartengono a una `source`
- hanno molti `excerpt_tags`

## tasks
- possono appartenere a un `topic`
- possono riferirsi a una `source`
- possono riferirsi a una `quote`
- possono riferirsi a un `excerpt`
- hanno molti `task_tags`

## tags
- possono collegarsi a topic
- possono collegarsi a sources
- possono collegarsi a quotes
- possono collegarsi a excerpts
- possono collegarsi a tasks

---

# 4. Vincoli logici principali

## 4.1 Source kind validi
Per MVP:
- `pdf`
- `url`
- `note`
- `manual`

## 4.2 Una source pdf deve avere un pdf asset
Vincolo logico applicativo:
- se `sources.kind = pdf`, deve esistere un record in `pdf_assets`

## 4.3 Una source note deve avere una note row
Vincolo logico applicativo:
- se `sources.kind = note`, deve esistere un record in `notes`

## 4.4 Soft archive
Per MVP non facciamo delete destructive come default.
Preferiamo campi `archived_at` dove serve.

## 4.5 Inbox
Una source senza topic è in Inbox.
La Inbox non ha record proprio nel DB.

## 4.6 Duplicate PDF
Il checksum SHA-256 permette di rilevare duplicati di file.

## 4.7 Duplicate tag
`normalized_name` unico.

---

# 5. Decisioni MVP fissate

## Confermate
- Fonti come entità centrale
- PDF copiati nella libreria interna
- Più topic per source
- Inbox logica
- Note markdown
- Quote ed excerpt separati
- Task collegabili a più entità
- Tag riusabili
- Soft archive preferito a delete hard
- Ricerca globale come funzione core

---

# 6. Cose volutamente rimandate

## Non ancora in MVP
- allegati generici completi
- versioning note
- backlinks tra note
- grafo relazioni visuale
- OCR avanzato
- sync cloud
- utenti multipli
- permessi
- commenti collaborativi
- cronologia cambiamenti completa
- bibliografia avanzata stile Zotero
- vector embeddings come base primaria
- provider AI multipli già pronti

---

# 7. Domande future aperte

## Da decidere più avanti
- una source manual può avere campi bibliografici più ricchi?
- una quote può essere promossa a note?
- una excerpt può generare automaticamente un task?
- task senza nessun collegamento devono essere permessi sempre?
- servono collection smart in v2?
- servono saved filters?

---

# 8. Riassunto finale

Il modello dati MVP di Evidesk è costruito intorno a:
- sources come entità centrale
- topics come contenitori logici
- inbox come vista logica
- note markdown come source specializzate
- evidenze atomiche tramite quote/excerpts
- task come azioni collegate alla ricerca
- tag come sistema trasversale di organizzazione