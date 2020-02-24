### INTEGRAZIONE API RAVEN
la guida seguente si riferisce all'utilizzo delle API client di raven per un'applicazione AngularJS.

<br>

### Propedeutica
installazione libreria:
````
 npm i raven-client --save
````
> la libreria prevede le definizioni per Typescript nel file **raven.d.ts**

Sarà quindi necessario referenziare la libreria nel file index.html:
````
  <script src="node_modules/raven-client/raven.js"></script>
````

Una volta installata e referenziata, la libreria API di Raven sarà disponibile direttamente dalla window:
````
    window.raven
    // oppure più semplicemente:
    raven 
````
è possibile rilevare in ogni istante se l'applicazione sta girando nel contesto di raven o meno:
````
    const isOnRaven = raven.active;
````


<br>

### Primo avvio e autenticazione
L'autenticazione deve essere demandata a raven.

In altre parole il token da spendere su ogni richiesta interna sarà trasmesso dalla libreria di Raven.

Ipotizziamo di aggiungere al progetto AngularJS un modulo run che viene eseguito all'avvio:
````
  angular.module('MyApp',....)
    .run([function() {
      
      raven.state({
        name:'my application name', 
        version:'x.x.Xxx'
      }).then((resp) => {

        console.log('RAVEN RESPONSE', resp);

      }, (err) => {

        console.error('RAVEN ERROR', err);

      });

    }])
````
il metodo **raven.state(...)** prevede, a fronte di un invio di informazioni a Raven, 
la ricezione di una risposta che contiene le informazioni richieste.

Nell'esempio precedente sono inviate a Raven:
 - il nome dell'applicazione
 - la versione
 
L'oggetto della *response* conterrà sempre le seguenti property: 
````
    // token
    resp.token
    // utente corrente
    resp.user
    // proprietario del messaggio ("raven")
    resp.owner
````

<br>
 
### Ricezione messaggi da Raven
L'invio di messaggi da Raven avviene ad esempio nelle azioni richieste dalle voci di menu.

Per ricevere messaggi da Raven è necessario sottoscriversi ai suoi eventi di messaggistica:

````
  raven.subscribe((message) => {

    console.log('ACTION: %s', message.action, message.data);

  }, (message) => !!message.action);
````
il metodo subscribe prevede il passaggio di due callback:
````
  raven.subscribe( (message) => void [, (message) => boolean] );
````
la prima rappresenta la logica di consumo del messaggio dove implementare la propria logica;

la seconda (opzionale) è un filtro per i messaggi ricevuti (nell'esempio sono considerati solo i messaggi con *action* valorizzata).

L'oggetto *message* conterrà sempre le seguenti property: 
````
    // token
    resp.token
    // utente corrente
    resp.user
    // proprietario del messaggio ("raven")
    resp.owner
    // azione richiesta (opzionale)
    resp.action
    // oggetto generico per lo scambio dati
    resp.data
    // tipologia di messaggio
    resp.type
````

<br>
 
#### Invio messaggi di azione a Raven

Per inviare messaggi / azioni a Raven è sufficiente utilizzare il metodo già visto in precedenza **raven.state(...)**:

````
    raven.state({
        action: 'nome-azione',
        data: {}
    });
````
> Nel caso sia necessario passare dati a raven l'oggetto data deve essere un oggetto serializzabile.

