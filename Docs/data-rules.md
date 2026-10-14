# Evidesk — Data Rules MVP

## Scopo
Questo documento definisce le regole operative dell’MVP per:
- ricerca
- tagging
- gestione duplicati
- archiviazione
- inbox
- task linking
- comportamento generale dei dati

Serve per evitare incoerenze tra:
- database
- backend
- frontend
- UX

---

# 1. Regole generali del sistema

## 1.1 Source come unità primaria di contenuto
La maggior parte dei contenuti persistenti del sistema ruota attorno a `source`.

Una source può essere:
- pdf
- url
- note
- manual

Quote ed excerpt non sono source autonome.
Sono entità derivate e collegate a una source.

## 1.2 Topic come contenitore logico
I topic non contengono fisicamente file o testo.
Rappresentano un contenitore logico di organizzazione.

## 1.3 Inbox come stato logico
La Inbox non è una tabella.
Una source appartiene alla Inbox quando non ha nessun collegamento nella tabella `source_topics`.

## 1.4 Task sempre collegati
Un task deve essere collegato ad almeno una entità reale.

Un task deve avere almeno uno tra:
- `topic_id`
- `related_source_id`
- `related_quote_id`
- `related_excerpt_id`

Questa è una regola di prodotto e anche una regola logica applicativa.

## 1.5 Soft archive preferito
Per l’MVP si preferisce l’archiviazione logica alla cancellazione distruttiva.

---

# 2. Regole di validazione entità

## 2.1 Topic
### Regole
- `title` obbligatorio
- `title` deve essere trimmato
- `title` non può essere vuoto dopo trim
- `title` deve avere una lunghezza massima ragionevole
- `slug` deve essere generato in modo stabile
- topic archiviato non deve apparire nelle viste attive standard

### Regole UX
- titoli duplicati possono essere consentiti, ma non sono ideali
- in futuro si può aggiungere warning non bloccante

---

## 2.2 Source
### Regole
- `kind` obbligatorio
- `kind` ammessi in MVP:
  - pdf
  - url
  - note
  - manual
- `title` non sempre obbligatorio, ma consigliato
- `created_at` obbligatorio
- `updated_at` obbligatorio

### Regole specifiche per kind
#### pdf
- deve avere record corrispondente in `pdf_assets`

#### url
- deve avere `source_url` valido

#### note
- deve avere record corrispondente in `notes`

#### manual
- può esistere anche senza file o url

---

## 2.3 Quote
### Regole
- `text` obbligatorio
- deve essere collegata a una `source`
- `page_number` facoltativo
- `locator` facoltativo
- `commentary` facoltativo

### Regole UX
- deve essere breve e atomica
- non dovrebbe diventare una nota lunga

---

## 2.4 Excerpt
### Regole
- `text` obbligatorio
- deve essere collegato a una `source`
- `title` facoltativo
- `page_start` facoltativo
- `page_end` facoltativo

### Regole UX
- è più lungo e più lavorabile di una quote
- rappresenta un estratto ragionato o evidenza estesa

---

## 2.5 Task
### Regole
- `title` obbligatorio
- `status` obbligatorio
- `priority` obbligatorio
- deve essere collegato ad almeno una entità
- `completed_at` va valorizzato quando `status = done`

### Valori ammessi status
- open
- in_progress
- done
- cancelled

### Valori ammessi priority
- low
- medium
- high

### Regole UX
- task rapidi da creare
- task contestuali alla ricerca
- mai task “orfani”

---

## 2.6 Tag
### Regole
- `name` obbligatorio
- `normalized_name` obbligatorio
- `normalized_name` unico
- tag vuoto non consentito

### Normalizzazione minima MVP
- trim
- lowercase
- riduzione spazi multipli
- rimozione spazi ai bordi

### Esempi
- " AI " -> "ai"
- "Machine   Learning" -> "machine learning"

---

# 3. Regole Inbox

## 3.1 Definizione
Una source è in Inbox se non ha righe in `source_topics`.

## 3.2 Cosa può stare in Inbox
Possono stare in Inbox:
- source tipo pdf
- source tipo url
- source tipo note
- source tipo manual

## 3.3 Cosa non può stare “in Inbox” come concetto primario
- quote
- excerpt

Quote ed excerpt esistono solo tramite source, quindi sono indirettamente dentro il contesto della source.

## 3.4 UX Inbox
La Inbox deve servire a:
- catturare velocemente materiale
- rimandare l’organizzazione
- evitare blocchi all’utente

## 3.5 Regola importante
Spostare una source fuori dalla Inbox significa aggiungere almeno un topic link.
Rimuovere tutti i topic link di una source significa riportarla in Inbox.

---

# 4. Regole Topic Linking

## 4.1 Multi-topic consentito
Una source può appartenere a zero, uno o più topic.

## 4.2 Unicità link
La coppia (`source_id`, `topic_id`) deve essere unica.

## 4.3 Rimozione link
Rimuovere un link topic-source non deve cancellare la source.
Deve solo scollegarla dal topic.

## 4.4 Ultimo link rimosso
Se viene rimosso l’ultimo topic link di una source:
- la source non viene cancellata
- la source torna in Inbox

## 4.5 Topic archiviati
Un topic archiviato:
- non dovrebbe apparire nelle selezioni standard
- mantiene comunque i collegamenti esistenti
- può essere reso visibile in viste archiviate

---

# 5. Regole PDF import e duplicati

## 5.1 Libreria interna come fonte di verità
I PDF selezionati dall’utente vengono copiati nella libreria interna.
Il file originale non è la fonte di verità del sistema.

## 5.2 Nome file interno
Il nome finale del file nella libreria:
- non deve dipendere direttamente dal nome utente originale
- deve essere sicuro e stabile
- deve preservare l’estensione `.pdf`

## 5.3 Duplicate detection
Il rilevamento duplicati MVP avviene tramite `checksum_sha256`.

## 5.4 Comportamento duplicato MVP
Se il checksum esiste già:
- per MVP il sistema può bloccare il nuovo import
- il frontend mostra messaggio di duplicato

## 5.5 Evoluzione futura
In v2 si potrà proporre:
- riusa asset esistente
- importa comunque come nuova source

## 5.6 Errori PDF da prevedere
- file non trovato
- file non leggibile
- file non PDF
- mime type incoerente
- copia fallita
- spazio insufficiente
- errore DB dopo copia file
- checksum fallito

## 5.7 Regola transazionale logica
Import ideale:
1. validazione file
2. checksum
3. copy file
4. create source
5. create pdf_asset
6. create source_topics
7. commit logico complessivo

Se il DB fallisce dopo la copia file, il backend deve tentare cleanup del file copiato.

---

# 6. Regole URL e duplicate logici

## 6.1 URL source
Le source di tipo `url` devono avere un `source_url` valido.

## 6.2 Canonical URL
Per MVP la canonicalizzazione può essere semplice.
Scopo:
- ridurre duplicati banali
- migliorare qualità dati

## 6.3 Normalizzazione minima URL
Quando possibile:
- trim
- lowercase del solo host
- rimozione trailing slash non significativo
- preservare path
- non rompere query importanti

## 6.4 Duplicati URL
Per MVP:
- duplicati URL non necessariamente bloccanti
- si può aggiungere warning più avanti

---

# 7. Regole Note Markdown

## 7.1 Note come source
Ogni nota è:
- una source di kind `note`
- un record in `notes`

## 7.2 Autosave
Le note devono essere autosalvate.

## 7.3 Stato save
La UI deve poter mostrare:
- saving
- saved
- error

## 7.4 Note vuote
Per MVP una nota vuota può essere consentita temporaneamente, ma idealmente:
- titolo o contenuto dovrebbero esistere
- la nota completamente vuota può essere pulita più avanti da UX logic

## 7.5 Ricerca
Il contenuto markdown della nota deve essere ricercabile.

---

# 8. Regole Quote ed Excerpt

## 8.1 Quote
Una quote:
- è breve
- è puntuale
- deve avere testo
- deve appartenere a una source

## 8.2 Excerpt
Un excerpt:
- è più esteso
- è più operativo
- deve avere testo
- deve appartenere a una source

## 8.3 Differenza di ruolo
### Quote
serve a catturare una citazione o evidenza precisa

### Excerpt
serve a catturare un blocco di testo lavorabile o rilevante

## 8.4 Archiviazione logica
Per MVP quote ed excerpt possono in futuro essere archiviabili o eliminabili.
Per ora la scelta pratica può essere delete semplice oppure soft-delete solo se implementato bene.
Questa decisione operativa sarà definita nello schema SQL.

---

# 9. Regole Task Linking

## 9.1 Collegamenti minimi
Ogni task deve avere almeno un collegamento.

## 9.2 Collegamenti consentiti
Un task può collegarsi a:
- topic
- source
- quote
- excerpt

## 9.3 Task multi-collegati
Per MVP un task può avere più riferimenti contemporaneamente.
Esempio:
- topic_id valorizzato
- related_source_id valorizzato

## 9.4 Coerenza logica
Se `related_quote_id` è valorizzato, quella quote deve esistere.
Se `related_excerpt_id` è valorizzato, quell’excerpt deve esistere.

## 9.5 Stato completamento
Quando un task viene segnato `done`:
- `completed_at` deve essere valorizzato

Quando un task torna non completato:
- `completed_at` deve poter tornare null

---

# 10. Regole Tagging

## 10.1 Tag riusabili
I tag sono condivisi e riusabili.
Non si creano copie separate dello stesso tag per tipo entità.

## 10.2 Unicità logica
Il sistema deve impedire duplicati logici basati su `normalized_name`.

## 10.3 Linking tag
Per MVP i tag possono collegarsi a:
- topic
- source
- quote
- excerpt
- task

## 10.4 Colore tag
Il colore è opzionale ma utile per UX.

## 10.5 Rimozione tag
Rimuovere il link a un tag da una entità non deve cancellare il tag globale.
Il tag globale viene eliminato solo con operazione dedicata futura.

---

# 11. Regole Search

## 11.1 Search come funzione core
La ricerca è una funzione primaria del prodotto.
Non è una feature accessoria.

## 11.2 Entità cercabili MVP
Devono essere cercabili:
- topics
- sources
- notes
- quotes
- excerpts
- tasks

## 11.3 Obiettivo della ricerca
Permettere di trovare velocemente:
- argomenti
- fonti
- note
- evidenze
- attività

## 11.4 Tipi di contenuto indicizzato
### topics
- title
- description

### sources
- title
- description
- author
- publisher
- source_url se utile

### notes
- markdown_content

### quotes
- text
- commentary

### excerpts
- title
- text
- commentary

### tasks
- title
- description

## 11.5 Struttura risultati
Ogni risultato deve riportare almeno:
- entity_type
- entity_id
- titolo o label principale
- snippet quando utile
- topic correlati se disponibili

## 11.6 Ricerca Inbox
Le source in Inbox devono comunque essere ricercabili.

## 11.7 Aggiornamento indice
L’indice di ricerca deve essere aggiornato quando cambia una entità indicizzata.

## 11.8 Risultati archiviati
Per default la ricerca standard dovrebbe escludere contenuti archiviati, salvo filtro esplicito.

---

# 12. Regole Archivio e cancellazione

## 12.1 Strategia generale MVP
Preferenza per:
- soft archive
invece di
- hard delete

## 12.2 Topic
I topic devono essere archiviabili.

## 12.3 Source
Le source dovrebbero essere archiviabili.

## 12.4 Task
I task possono essere completati o cancellati.
L’archiviazione può essere valutata, ma non è obbligatoria subito.

## 12.5 Delete per quote/excerpt
Per MVP si può usare delete diretto per quote/excerpt se vuoi tenere semplice il sistema.

## 12.6 Regola di sicurezza
Mai eliminare automaticamente file fisici o record correlati senza regola chiara e intenzionale.

---

# 13. Regole timestamp

## 13.1 Timestamps minimi
Le entità principali devono avere:
- created_at
- updated_at

## 13.2 Update
Ogni modifica significativa deve aggiornare `updated_at`.

## 13.3 Task completion
Quando task diventa done:
- aggiornare `completed_at`

---

# 14. Regole error handling dati

## 14.1 Regola generale
Ogni operazione dati importante deve prevedere:
- validazione input
- fallimento leggibile
- rollback logico quando possibile

## 14.2 Operazioni critiche
Particolare attenzione a:
- import PDF
- modifica topic links
- creazione note
- aggiornamento ricerca
- backup/export

## 14.3 UI errors
La UI deve mostrare errori:
- comprensibili
- specifici
- non tecnicamente caotici

---

# 15. Decisioni MVP confermate

- Inbox logica, non tabella
- Task sempre collegati
- Multi-topic per source
- PDF copiati in libreria interna
- Duplicate PDF via checksum
- Search globale core
- Tag unici via normalized_name
- Soft archive preferito
- Note markdown autosalvate

---

# 16. Riassunto finale

Il comportamento dati di Evidesk MVP segue questi principi:
- cattura rapida
- organizzazione progressiva
- collegamenti coerenti
- ricerca veloce
- archiviazione prudente
- niente contenuti orfani
- file locali sotto controllo