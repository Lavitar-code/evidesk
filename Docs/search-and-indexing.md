# Evidesk — Search and Indexing MVP

## Scopo
Questo documento definisce la strategia di ricerca e indicizzazione dell’MVP di Evidesk.

---

# 1. Obiettivo

La ricerca di Evidesk deve permettere di trovare velocemente:
- topic
- source
- note
- quote
- excerpt
- task

La ricerca è globale e cross-entity.

---

# 2. Approccio MVP

Per l’MVP viene adottata una ricerca full-text locale basata su SQLite FTS.

L’indice di ricerca deve essere unico e trasversale.
Non serve avere motori separati per ogni entità nel primo MVP.

---

# 3. Entità indicizzate

## topics
Campi da indicizzare:
- title
- description

## sources
Campi da indicizzare:
- title
- description
- author
- publisher
- source_url

## notes
Campi da indicizzare:
- markdown_content

## quotes
Campi da indicizzare:
- text
- commentary

## excerpts
Campi da indicizzare:
- title
- text
- commentary

## tasks
Campi da indicizzare:
- title
- description

---

# 4. Struttura logica dell’indice

L’indice di ricerca deve supportare almeno questi campi logici:

- entity_type
- entity_id
- title
- body
- metadata
- created_at
- updated_at
- archived_at

## Spiegazione
### entity_type
Tipo entità:
- topic
- source
- note
- quote
- excerpt
- task

### entity_id
ID dell’entità nel DB principale

### title
Titolo o etichetta principale

### body
Contenuto testuale principale ricercabile

### metadata
testo ausiliario indicizzabile
Esempio:
- author
- publisher
- url
- commentary

---

# 5. Strategia pratica MVP

La soluzione più semplice e robusta per MVP è:
- tabelle normali per i dati
- tabella FTS separata per ricerca unificata
- sincronizzazione indice applicativa o via trigger

## Regola
Non usare la tabella FTS come fonte primaria dei dati.
La fonte primaria resta il modello relazionale normale.

---

# 6. Aggiornamento indice

L’indice deve essere aggiornato quando:
- si crea una entità indicizzata
- si modifica una entità indicizzata
- si archivia una entità indicizzata
- si elimina una entità indicizzata

## Eventi principali
- create_topic
- update_topic
- create_source
- update_source
- create_note
- update_note
- create_quote
- update_quote
- create_excerpt
- update_excerpt
- create_task
- update_task

---

# 7. Risultati di ricerca

Ogni risultato deve includere almeno:

- entity_type
- entity_id
- display_title
- display_snippet
- related_topics
- archived flag

## Obiettivo UX
L’utente deve capire subito:
- che cosa ha trovato
- di che tipo è
- dove appartiene
- perché è rilevante

---

# 8. Ordinamento risultati

Per MVP:
- priorità alla rilevanza full-text
- secondariamente si può considerare aggiornamento recente

Non complicare troppo ranking al primo giro.

---

# 9. Filtri ricerca MVP

Filtri utili:
- by entity type
- by topic
- archived inclusi/esclusi
- inbox only

## Note
Il filtro Inbox è utile perché l’utente potrebbe voler ripulire materiale non organizzato.

---

# 10. Ricerca e archiviati

Per default:
- escludere entità archiviate

Con filtro esplicito:
- includerle

---

# 11. Ricerca e topic multipli

Se una source appartiene a più topic:
- il risultato dovrebbe mostrare topic principali collegati
- non duplicare il risultato una volta per ogni topic

---

# 12. Ricerca note

Le note devono essere molto ben ricercabili.
Il contenuto markdown è parte centrale dell’esperienza.

Per MVP:
- indicizzare il markdown raw va bene
- il rendering pulito è secondario

---

# 13. Ricerca quote ed excerpt

Quote ed excerpt devono essere recuperabili facilmente, perché sono tra gli oggetti più utili del prodotto.

Snippet e contesto saranno importanti per UX.

---

# 14. Ricerca tasks

I task devono comparire in ricerca perché possono rappresentare prossime azioni di studio/analisi.

---

# 15. Search shortcuts

Da prevedere in UX:
- search bar globale sempre accessibile
- shortcut futura tipo Ctrl+K

---

# 16. Errori da evitare

- indice non aggiornato
- risultati duplicati
- archiviati mostrati senza volerlo
- source in Inbox non trovabili
- risultati incomprensibili senza contesto

---

# 17. Decisioni MVP confermate

- ricerca unica trasversale
- indice separato dai dati principali
- aggiornamento indice continuo
- note, quote ed excerpt pienamente ricercabili
- archiviati esclusi di default
- Inbox filtrabile

---

# 18. Riassunto finale

La ricerca di Evidesk MVP è:
- locale
- veloce
- full-text
- cross-entity
- centrata su recupero pratico delle informazioni