# 🗂️ Evidesk

![Tauri](https://img.shields.io/badge/Tauri-2-FFC131?logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-SQLite-000000?logo=rust&logoColor=white)

Spazio di lavoro **desktop per la ricerca**, pensato per studenti e analisi documentali: raccoglie PDF, link, note, estratti e task sparsi e li trasforma in **dossier strutturati e ricercabili**, organizzati per argomento.

**Local-first:** tutti i dati restano sul tuo computer in un database SQLite locale, nessun account e nessun server.

## Funzionalità

- **Argomenti (Topics):** ogni ricerca è un dossier con colore e descrizione; tutto il resto si collega a un argomento
- **Fonti:** import di PDF e salvataggio di link, collegabili a più argomenti
- **Note ed estratti:** appunti e citazioni estratte dalle fonti, con editor dedicato
- **Task:** cose da fare legate a una ricerca
- **Ricerca** trasversale su fonti, note ed estratti
- **Archivio** invece della cancellazione, con conferma per le azioni distruttive
- **Backup** import/export dei dati in JSON
- **Command palette** e scorciatoie da tastiera

## Stack

| Ambito | Tecnologia |
|---|---|
| App desktop | Tauri 2 (finestra nativa, backend in Rust) |
| Interfaccia | React 19 + TypeScript + Vite |
| Stato | Zustand |
| Dati | SQLite locale (+ ricerca full-text) |

## Struttura

```
evidesk-app/        app Tauri (frontend React + backend Rust in src-tauri/)
  src/features/     moduli: sources, notes, excerpts, tasks, topics, search, archive
  src/components/   componenti UI riutilizzabili
  src-tauri/        comandi Rust, modelli, accesso al database
database/           schema SQL iniziale
Docs/               architettura: modello dati, flussi, regole, convenzioni
```

La cartella [`Docs/`](Docs) contiene la progettazione: modello dati, confini dei moduli, flussi principali e convenzioni di naming.

## Avvio

**Requisiti:** Node.js e [l'ambiente Rust per Tauri](https://tauri.app/start/prerequisites/).

```bash
cd evidesk-app
npm install
npm run tauri dev     # avvia l'app desktop in sviluppo
npm run tauri build   # genera l'eseguibile
```

## Autore

**Vittorio Gaudiello** — [@Lavitar-code](https://github.com/Lavitar-code)
