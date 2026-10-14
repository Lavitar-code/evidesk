# Evidesk — Module Boundaries MVP

## Scopo
Questo documento definisce i confini tra moduli del progetto.

Serve per:
- evitare accoppiamento eccessivo
- evitare logica sparsa
- chiarire responsabilità
- mantenere il codice pulito

---

# 1. Frontend responsibilities

Il frontend gestisce:
- rendering UI
- stato interfaccia
- input utente
- layout
- filtri
- navigazione
- feedback visivo
- modali
- editor note

Il frontend non deve gestire direttamente:
- scrittura file locale critica
- logica checksum
- operazioni DB critiche
- policy archiviazione
- gestione import PDF reale

---

# 2. Backend responsibilities

Il backend gestisce:
- operazioni DB
- accesso file system
- import PDF
- validazioni critiche
- gestione paths sicuri
- checksum
- backup/export
- indicizzazione ricerca
- logica dati centrale

---

# 3. Search boundaries

## Frontend
- invia query
- mostra risultati
- applica filtri UI

## Backend
- esegue ricerca
- costruisce risultati
- risolve entità
- gestisce indice

---

# 4. Files boundaries

## Frontend
- chiede import o apertura
- mostra stato

## Backend
- legge file
- valida file
- copia file
- costruisce path
- pulisce file orfani quando necessario

---

# 5. Database boundaries

## Frontend
- non costruisce SQL
- non decide vincoli veri

## Backend
- esegue query
- applica regole dati
- mantiene integrità

---

# 6. Feature boundaries

## Topics
Responsabilità:
- creare
- aggiornare
- archiviare
- mostrare

## Sources
Responsabilità:
- creare
- dettaglio
- collegare topic
- metadati

## Notes
Responsabilità:
- editing markdown
- autosave
- rendering futuro

## Tasks
Responsabilità:
- creare
- aggiornare stato
- collegare contesto

## Search
Responsabilità:
- query globale
- risultati cross-entity

## Inbox
Responsabilità:
- mostrare source senza topic

---

# 7. Regola di orchestrazione

Quando una operazione tocca più sottosistemi, la logica deve vivere in un service backend dedicato.

Esempio:
import PDF tocca:
- file system
- db
- topic links
- deduplica
- error handling

Quindi non deve essere sparsa.

---

# 8. Regola finale

Ogni modulo deve avere responsabilità chiare e poco ambigue.
Se una parte del codice non sai dove metterla, fermati e ridefinisci il confine prima di aggiungerla.