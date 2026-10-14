# Evidesk — Archive and Delete Policy MVP

## Scopo
Questo documento definisce come Evidesk tratta:
- archiviazione
- cancellazione
- rimozione link
- sicurezza dei dati

---

# 1. Principio generale

Per l’MVP Evidesk adotta una politica prudente:
- preferire archiviazione logica
- ridurre delete distruttivi
- evitare perdita accidentale di dati

---

# 2. Topic

## 2.1 Archiviazione topic
I topic possono essere archiviati.

Archiviare un topic significa:
- non mostrarlo nelle viste attive standard
- mantenerne i dati nel DB
- mantenere i collegamenti con le source

## 2.2 Delete topic
Per MVP il delete distruttivo del topic non è prioritario.
Meglio iniziare con:
- archive topic

---

# 3. Source

## 3.1 Archiviazione source
Le source dovrebbero essere archiviabili.

Archiviare una source significa:
- non mostrarla nelle viste standard
- mantenerla nel DB
- mantenerla ricercabile solo se i filtri includono archiviati

## 3.2 Delete source
Il delete distruttivo è delicato perché può coinvolgere:
- file PDF fisici
- quote
- excerpt
- tag links
- task collegati

Per MVP non deve essere la strada principale.

---

# 4. Quote ed Excerpt

## 4.1 Strategia MVP
Per semplicità:
- quote ed excerpt possono essere eliminati direttamente
oppure
- archiviati solo se implementato bene

## 4.2 Scelta consigliata MVP
Delete diretto semplice, se il codice resta pulito.

---

# 5. Tasks

## 5.1 Gestione task
I task hanno già stati funzionali:
- open
- in_progress
- done
- cancelled

Questo riduce il bisogno di una vera archiviazione task nel primo MVP.

## 5.2 Delete task
Può essere consentito con attenzione.
Non deve lasciare riferimenti rotti altrove.

---

# 6. Rimozione topic link

## 6.1 Regola
Rimuovere il link tra source e topic:
- non cancella la source
- non cancella il topic

## 6.2 Ultimo link rimosso
Se viene rimosso l’ultimo link:
- la source torna in Inbox

---

# 7. PDF fisici

## 7.1 Regola fondamentale
Il file PDF fisico nella libreria interna non deve essere cancellato automaticamente senza una regola molto chiara.

## 7.2 MVP prudente
Meglio evitare delete automatico del file fisico nei primi step.

## 7.3 Possibile politica futura
Cancellare file fisico solo se:
- source eliminata intenzionalmente
- asset non referenziato da altro
- utente ha confermato

---

# 8. Error handling

## 8.1 Regola generale
Ogni operazione distruttiva o semi-distruttiva deve avere:
- conferma chiara
- fallback sensato
- messaggio leggibile

## 8.2 Evitare
- cascades inattese
- perdita file silenziosa
- rimozioni difficili da capire

---

# 9. Decisione MVP confermata

Per Evidesk MVP:
- archive preferred
- delete minimal and explicit
- unlink instead of delete when possible
- PDF file deletion treated with caution

---

# 10. Riassunto finale

Evidesk MVP privilegia sicurezza e reversibilità.
La logica è:
- archivia quando puoi
- scollega quando basta
- cancella solo quando è davvero chiaro