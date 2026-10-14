# Evidesk — Core User Flows

## Scopo
Questo documento definisce i flussi principali dell’MVP di Evidesk.
Serve per guidare UX, database, logica applicativa e sviluppo.

---

# Flow 1 — Creazione di un Topic

## Obiettivo
Permettere all’utente di creare un nuovo topic di ricerca.

## Trigger
L’utente clicca su:
- pulsante "New Topic"
oppure
- shortcut futura dedicata

## Input utente
- title (obbligatorio)
- description (facoltativa)
- color (facoltativo)
- icon (facoltativa)

## Comportamento UI
1. L’utente apre la modale "Create Topic".
2. Inserisce almeno il titolo.
3. Conferma la creazione.
4. Il topic appare subito nella sidebar.
5. L’utente viene portato nella pagina del topic appena creato.

## Azioni backend
1. Validare il titolo:
   - non vuoto
   - trim degli spazi
   - lunghezza minima e massima
2. Creare record `topic`
3. Salvare `created_at` e `updated_at`
4. Restituire il topic creato al frontend

## Dati creati
- 1 record in `topics`

## Stato finale atteso
- topic visibile in sidebar
- topic aperto in vista principale
- pronto per ricevere fonti, note e task

## Errori possibili
- titolo vuoto
- titolo troppo lungo
- errore DB
- duplicato logico del titolo (non bloccante, da decidere)

## Note UX
- il titolo è obbligatorio
- la descrizione può essere aggiunta anche dopo
- serve uno stato empty chiaro dopo la creazione:
  - add PDF
  - add link
  - create note

---

# Flow 2 — Importazione di un PDF

## Obiettivo
Permettere all’utente di importare un PDF nella libreria interna dell’app e collegarlo a uno o più topic.

## Trigger
L’utente:
- clicca "Add Source"
- sceglie "PDF"
oppure
- trascina un PDF dentro l’app

## Input utente
- file PDF locale
- title opzionale
- topic associati
- tag opzionali
- description opzionale

## Comportamento UI
1. L’utente seleziona o trascina il file PDF.
2. La UI mostra una preview dell’import:
   - nome file
   - dimensione
   - topic selezionati
3. L’utente conferma.
4. La UI mostra stato di importazione.
5. A import riuscito, il PDF compare tra le fonti.

## Azioni backend
1. Validare il file:
   - esistenza
   - estensione
   - mime type se possibile
2. Calcolare checksum SHA-256
3. Controllare duplicati per checksum
4. Generare nome interno sicuro
5. Copiare il file nella libreria interna
6. Creare record `source` di tipo `pdf`
7. Creare record `pdf_assets`
8. Creare collegamenti in `source_topics`
9. Creare eventuali tag collegati
10. Restituire il source completo al frontend

## Dati creati
- 1 record in `sources`
- 1 record in `pdf_assets`
- N record in `source_topics`
- eventuali record tag/link tag

## Stato finale atteso
- il PDF è presente nella libreria interna
- il source è visibile nella lista
- il dettaglio source mostra metadata base

## Errori possibili
- file non trovato
- file non leggibile
- file non PDF
- duplicato rilevato
- errore copia file
- errore DB
- path non valido

## Decisioni importanti
- i PDF vengono copiati nella libreria interna
- il nome finale del file non coincide col nome utente originale
- la libreria interna è la fonte di verità

## Note UX
- se il file è duplicato, la UI dovrà proporre in futuro:
  - riusa asset esistente
  - importa comunque come nuovo source
- per MVP puoi iniziare con:
  - messaggio di duplicato
  - annulla import

---

# Flow 3 — Salvataggio di un Link

## Obiettivo
Permettere all’utente di salvare una fonte web come source collegata a uno o più topic.

## Trigger
L’utente clicca:
- "Add Source"
- "New Link"

## Input utente
- URL (obbligatorio)
- title opzionale
- description opzionale
- topic associati
- tag opzionali

## Comportamento UI
1. L’utente apre la modale "Add Link".
2. Inserisce URL.
3. Seleziona uno o più topic.
4. Conferma.
5. Il link compare nella lista fonti.

## Azioni backend
1. Validare URL
2. Normalizzare URL base
3. Creare `source` di tipo `url`
4. Collegare il source ai topic
5. Collegare eventuali tag

## Dati creati
- 1 record in `sources`
- N record in `source_topics`
- eventuali record tag/link tag

## Stato finale atteso
- link ricercabile
- link visibile nel topic
- metadata modificabili dopo

## Errori possibili
- URL vuoto
- URL invalido
- errore DB
- duplicato logico

## Note UX
- il titolo può essere vuoto inizialmente
- in futuro si potrà estrarre automaticamente il titolo pagina
- per MVP il salvataggio manuale basta

---

# Flow 4 — Creazione di una Nota Markdown

## Obiettivo
Permettere all’utente di scrivere note strutturate collegate a topic e ricerca.

## Trigger
L’utente clicca:
- "New Note"
oppure
- shortcut futura

## Input utente
- titolo facoltativo
- contenuto markdown
- topic associati
- tag opzionali

## Comportamento UI
1. L’utente apre una nuova nota.
2. Scrive contenuto markdown.
3. L’app salva automaticamente.
4. La nota compare tra i contenuti del topic e nei risultati di ricerca.

## Azioni backend
1. Creare `source` di tipo `note`
2. Creare record `notes`
3. Collegare ai topic
4. Aggiornare indice di ricerca

## Dati creati
- 1 record in `sources`
- 1 record in `notes`
- N record in `source_topics`

## Stato finale atteso
- nota salvata localmente
- nota ricercabile
- nota modificabile e riapribile

## Errori possibili
- salvataggio fallito
- contenuto troppo grande
- problema DB
- indice ricerca non aggiornato

## Decisioni importanti
- le note sono markdown
- la nota è anche una source
- una nota può appartenere a più topic

## Note UX
- autosave obbligatorio
- indicatore di stato:
  - saving
  - saved
  - error
- niente editor complesso all’inizio
- editor pulito, veloce, stabile

---

# Flow 5 — Creazione di Quote / Excerpt

## Obiettivo
Permettere all’utente di salvare evidenze testuali rilevanti da una fonte.

## Trigger
L’utente è nella pagina di una source e clicca:
- "Add Quote"
oppure
- "Add Excerpt"

## Input utente
### Quote
- testo
- page number facoltativo
- commento facoltativo
- tag opzionali

### Excerpt
- titolo facoltativo
- testo
- page_start facoltativo
- page_end facoltativo
- commento facoltativo
- tag opzionali

## Comportamento UI
1. L’utente apre il form.
2. Inserisce il contenuto.
3. Salva.
4. L’evidenza compare nella sezione della source e nei risultati di ricerca.

## Azioni backend
1. Validare testo
2. Creare `quote` oppure `excerpt`
3. Collegare tag eventuali
4. Aggiornare indice ricerca

## Dati creati
- 1 record in `quotes` o `excerpts`
- eventuali tag/link tag

## Stato finale atteso
- evidenza salvata
- collegata alla source
- ricercabile
- visibile nel topic tramite la source associata

## Errori possibili
- testo vuoto
- page number invalido
- errore DB
- errore indicizzazione

## Note UX
- quote = breve e precisa
- excerpt = più esteso e lavorabile
- in futuro si potrà creare direttamente da selezione PDF

---

# Flow 6 — Creazione di un Task di Ricerca

## Obiettivo
Permettere all’utente di creare task collegati a topic, fonti o evidenze.

## Trigger
L’utente clicca:
- "New Task"
oppure
- "Create Task from Source"
oppure
- "Create Task from Quote/Excerpt"

## Input utente
- titolo
- descrizione facoltativa
- status
- priority
- due date facoltativa
- topic collegato
- source/quote/excerpt collegati opzionali

## Comportamento UI
1. L’utente apre il form task.
2. Inserisce il minimo necessario.
3. Salva.
4. Il task compare nella vista task del topic e in eventuali viste globali.

## Azioni backend
1. Validare titolo
2. Creare task
3. Collegare entità correlate
4. Aggiornare ricerca

## Dati creati
- 1 record in `tasks`

## Stato finale atteso
- task visibile
- task filtrabile
- task aggiornabile di stato

## Errori possibili
- titolo vuoto
- topic mancante dove richiesto
- errore DB

## Note UX
- status iniziale consigliato: `open`
- priority iniziale consigliata: `medium`
- task molto rapido da creare

---

# Flow 7 — Ricerca Globale

## Obiettivo
Permettere all’utente di cercare rapidamente dentro tutto il workspace.

## Trigger
L’utente usa:
- search bar globale
- shortcut futura tipo Ctrl+K o Ctrl+P

## Input utente
- query testuale
- filtri opzionali

## Contenuti cercati
- topics
- sources
- notes
- quotes
- excerpts
- tasks

## Comportamento UI
1. L’utente scrive una query.
2. I risultati compaiono quasi subito.
3. Ogni risultato mostra:
   - tipo entità
   - titolo o snippet
   - topic correlati
4. L’utente apre il risultato.

## Azioni backend
1. Cercare nella tabella FTS
2. Risolvere entity_type/entity_id
3. Restituire risultati ordinati
4. Applicare eventuali filtri

## Dati letti
- indice FTS
- tabelle entità

## Stato finale atteso
- risultati rapidi
- risultati chiari
- navigazione immediata

## Errori possibili
- indice non aggiornato
- query nulla
- risultati incoerenti

## Decisioni importanti
- la ricerca è una feature core
- non è secondaria
- deve essere progettata presto

---

# Flow 8 — Collegamento di una Source a più Topic

## Obiettivo
Permettere il riuso delle fonti tra più dossier/topic.

## Trigger
L’utente modifica una source e aggiunge o rimuove topic collegati.

## Input utente
- lista topic selezionati

## Comportamento UI
1. L’utente apre dettaglio source.
2. Modifica i topic associati.
3. Salva o aggiorna automaticamente.
4. La source appare nei topic aggiunti e scompare da quelli rimossi.

## Azioni backend
1. Leggere topic correnti
2. Calcolare differenza
3. Inserire nuovi link in `source_topics`
4. Rimuovere link eliminati
5. Aggiornare `updated_at`

## Dati modificati
- tabella `source_topics`

## Stato finale atteso
- relazioni topic-source coerenti
- nessuna duplicazione inutile dei source

## Errori possibili
- topic inesistente
- link duplicato
- errore DB

## Note UX
- questo è uno dei punti che rende Evidesk forte
- le fonti non sono bloccate in un solo topic

---

# Flow 9 — Export / Backup

## Obiettivo
Permettere all’utente di esportare un backup locale del proprio workspace.

## Trigger
L’utente clicca:
- "Export Backup"

## Input utente
- cartella destinazione

## Comportamento UI
1. L’utente sceglie una cartella.
2. L’app prepara l’export.
3. La UI mostra progresso o stato.
4. A fine export, la UI mostra conferma.

## Azioni backend
1. Verificare accesso cartella destinazione
2. Copiare DB
3. Copiare cartella library
4. Creare manifest export
5. Restituire esito

## Dati esportati
- database
- PDF
- eventuali attachment
- manifest JSON

## Stato finale atteso
- backup completo e leggibile
- struttura esport stabile

## Errori possibili
- cartella non accessibile
- spazio insufficiente
- file lock
- errore copia

## Note UX
- export semplice prima del restore
- restore completo verrà dopo

---

# Flow 10 — Empty States

## Obiettivo
Guidare l’utente quando non ci sono ancora contenuti.

## Casi principali
- nessun topic
- topic vuoto
- nessun risultato di ricerca
- nessun task
- nessuna source

## Regole UX
- ogni empty state deve proporre una singola azione chiara
- niente schermate morte
- esempio topic vuoto:
  - import PDF
  - add link
  - create note

---

# Decisioni MVP confermate

- App locale-first
- Fonti collegabili a più topic
- PDF copiati nella libreria interna
- Note in markdown
- Ricerca globale come feature core
- AI opzionale e non centrale
- Fonti come entità centrale del modello