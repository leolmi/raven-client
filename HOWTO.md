### INTEGRAZIONE API RAVEN
la guida seguente si riferisce all'utilizzo delle API client di Raven per un'applicazione JS generica.

> Il codice d'esempio è scritto nella versione EcmaScript 6 per l'utilizzo della libreria `raven.js`

> Per un utilizzo con versione precedenti (EcmaScript 5) si faccia riferimento alla `raven.es5.js` 

<br>

### Propedeutica
installazione libreria:
````
 npm i raven-client --save
````
> la libreria prevede le definizioni per Typescript nel file **raven.d.ts**

Se necessario sarà da referenziare la libreria nel file index:
````
  <script src="node_modules/raven-client/raven.js"></script>
````

Una volta installata e referenziata, la libreria API di Raven sarà disponibile direttamente dalla window:
````
  window.raven
  // oppure più semplicemente:
  raven 
````
è possibile rilevare in ogni istante se l'applicazione sta girando nel contesto di Raven o meno:
````
  const isOnRaven = raven.active;
````


<br>

### Primo avvio e autenticazione
L'autenticazione in genere è onere di Raven.

In seguito Raven invierà il token ed i dati di contesto attraverso questa libreria ad ogni interazione.

Ipotizziamo di aggiungere al progetto una parte di codice che viene eseguito all'avvio:
````
  raven.state({
    name:'my application name', 
    version:'x.x.xxx',
    options: {
        loadedMode: 'action'
    }
  }).then((resp) => {

    console.log('RAVEN RESPONSE', resp);

  }, (err) => {

    console.error('RAVEN ERROR', err);

  });
````
il metodo **raven.state(...)** prevede, a fronte di un invio di informazioni a Raven, 
la ricezione di una risposta che contiene le informazioni richieste.

Nell'esempio precedente sono inviate a Raven:
 - il nome dell'applicazione
 - la versione
 - alcune opzioni
 
L'oggetto della *response* `RavenMessage` conterrà sempre le seguenti property: 
````
    // tipologia di messaggio
    resp.type
    // token
    resp.token
    // utente corrente
    resp.user
    // proprietario del messaggio ("raven")
    resp.owner
    // nome del tema
    resp.theme
    // identificativo della lingua
    resp.locale
    // opzioni utente (formati numerici, date, ecc..)
    resp.options
    // dati di contesto
    resp.context
    // azione richiesta (opzionale)
    resp.action
    // oggetto generico per lo scambio dati
    resp.data
    // modalità debug attiva (booleano)
    resp.debug
````

<br>

### Notifica di fine caricamento

Ogni volta che viene caricata un'applicazione in Raven questo si pone in uno stato di attesa fino a che 
non riceve un messaggio di avvenuto caricamento.

Per questo al termine delle operazioni di bootstrap è bene notificare a Raven:

````
  raven.send({ type: 'loaded' })
````

<br>

### Ricezione messaggi da Raven
L'invio di messaggi da Raven avviene ad esempio nelle azioni richieste dalle voci di menu.

Per ricevere messaggi da Raven è necessario sottoscriversi agli eventi di messaggistica:

````
  raven.subscribe((message) => {

    console.log('ACTION: %s', message.action, message.data);

  }, (message) => !!message.action)
````

il metodo subscribe prevede il passaggio di due callback:

````
  raven.subscribe( (message) => void [, (message) => boolean] );
````

la prima rappresenta la logica di consumo del messaggio dove implementare la propria logica;

la seconda (opzionale) è un filtro per i messaggi ricevuti.

L'oggetto *message* `RavenMessage` avrà la stessa struttura vista per il messaggio "state", poniamo qui l'attenzione
sui valori legati propriamente all'azione richiesta: 

````
    // tipo di azione
    message.type
    // azione richiesta (opzionale)
    message.action
    // oggetto generico per lo scambio dati
    message.data
````

<br>
 
#### Invio messaggi di azione a Raven

Per inviare messaggi / azioni a Raven è sufficiente utilizzare il metodo `send`:

````
    raven.send({
        type: 'tipo-azione',
        action: 'nome-azione',
        data: {}
    })
````

> Nel caso sia necessario passare dati a Raven l'oggetto data deve essere un **oggetto serializzabile**.

<br>

#### Notifica della **posizione**

Per posizione si intende uno stato recuperabile attraverso un hash testuale. Questo serve per riposizionare 
l'applicazione in quello stato o per visualizzare all'utente lo stato stesso come path ad esempio.

Nell'interazione con Raven in effetti possono succedere due cose:

1. Raven innesca la navigazione dell'applicazione riposizionandola;
2. La navigazione può avvenire internamente all'applicazione.

Nel secondo caso, se l'applicazione non notificasse l'aggiornamento della propria posizione, per Raven 
non sarebbe aggiornata e potremmo avere un'informazione non congruente nei dati esposti all'utente.

Per questo è necessario notificare la posizione attraverso la libreria.

Per farlo sono implementabili due modi:
- **ESPLICITO**: ossia inviando un messaggio diretto ogni volta che l'applicazione aggiorna la sua location
    ````
      raven.send({
        type: 'position',
        data: {
          action: 'action'
        }
      })
    ````
- **IMPLICITO**: gestendo un apposita funzione della libreria invocata ad ogni modifica dell'url:
    ````
        raven.getPosition = (loc) => ({
           action: getApplicationActionByLocation(loc)
        })
    ````
    dove loc è un oggetto [Location](https://developer.mozilla.org/en-US/docs/Web/API/Location) 

In tal modo viene notificato a Raven un posizionamento `RavenAppPosition` che può contenere diverse informazioni:
- `action`: l'action corrispondente allo stato, ossia quella action che, se inviata da Raven 
riporta l'applicazione nel medesimo stato;
- `path`: rappresenta la descrizione del path (`string`|`string[]`), se omesso è demandato a Raven;
- `url`: alternativo alla action, viene utilizzato da Raven per ripristinare la posizione dell'applicazione;
- `data`: dati accessori per contestualizzare ulteriormente il posizionamento dell'applicazione. Non 
essendo presenti in url possono essere gestiti solo nella sessione attiva.

