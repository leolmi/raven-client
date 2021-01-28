# RAVEN Client

raven client interop

## install

````
npm i raven-client --save
````

<br><br>

# USE

## AngularJS / jQuery / native JS (ES5)
reference (index.html):
````
  <script src="./node_modules/raven-client/raven.js"></script>
````

use case (raven events subscribing):
````
  raven.subscribe(function(data) {
      // use action: data.action
      // ....
    });
````

use case (raven state):
````
  raven.state({
    name: 'My application name',
    version: 'x.xx.xxx'
  }).then(function(data) {
    // container data info...
  }, function(err) {
    // error handler...
  });
````

use case (raven message loaded):
````
  raven.send({
    type: 'loaded'
  });
````

<br>

## Angular 2+ (ES6)
reference:
````
import { raven } from 'raven-client/raven';
````

consider raven an external angular implementation, so you have to resync events in angular scope:
````
import { ..., NgZone} from '@angular/core';
import { raven, RavenAppInfo, RavenAppPosition, RavenMessage, RavenMessageType } from 'raven-client/raven';

@Component({
  ...
})
export class MyComponent {
  constructor(...,
              private _zone: NgZone) {
    ...
  }

  myMethod() {
    ...
    raven.subscribe(data => this._zone.run(() => {
      // use action: data.action
      // ....
    }));
  }
...
````

use case (raven state):
````
  raven.state({
    name: 'My application name',
    version: 'x.xx.xxx',
    options: {}
  }).then(data => {
    // container data info...
  }, err => {
    // error handler...
  });
````

<br><br>

# HOW TO

<br>

[istructions (ITA)](./HOWTO.md)

<br><br>

# API

## raven

namespace, global object

### properties

- `active`<br>
  {boolean}: is true if raven is active

- `constants`<br>
  {object}: contains some raven constants

- `getPosition`<br>
  {function}: manage location to obtains a `RavenAppPosition` object

### methods

- `state(data [, options]) => {promise}`<br>
  send client data and retrieve (by promise) container info<br>
  ````
  const clientData = {
    name: 'My application name',
    version: 'x.xx.xxx',
    options: {}
  };
  raven.state(clientData)
    .then(serverData => {
      serverData.token      // server authentication token
      serverData.user       // logged user name
    }, err => {
      // error handler...
    })
  ````

- `send(message)`<br>
  send a message to Raven 

- `subscribe(callback [, filter])`<br>
  subscribes callback to raven events filtering (optional) by specific function (filter)

- `unsubscribe(callback)`<br>
  unsubscribes callback


<br><br>

## RavenMessage

### properties

- `owner`<br>
  {string}: 

- `token`<br>
  {string}: 

- `user`<br>
  {string}: 

- `roles`<br>
  {string[]}: 

- `locale`<br>
  {string}: 

- `options`<br>
  {Partial<RavenUserOptions>}: 

- `theme`<br>
  {string}: 

- `id`<br>
  {string}: 

- `data`<br>
  {any}: 

- `action`<br>
  {string}: 

- `type`<br>
  {RavenMessageType}: 

- `error`<br>
  {any}:

- `context`<br>
  {any}: 

- `channel`<br>
  {string}: 

- `debug`<br>
  {boolean}: 


<br><br>

## RavenUserDateTimeOptions

### properties

- `firstDayOfWeek`<br>
  {number}: 

- `date`<br>
  {string}: 


<br><br>

## RavenUserNumbersOptions

### properties

- `decimalSeparator`<br>
  {string}: 

- `defaultCurrency`<br>
  {string}: 

- `thousandsSeparator`<br>
  {string}: 


<br><br>

## RavenUserOptions

### properties

- `locale`<br>
  {string}: 

- `rtlEnabled`<br>
  {boolean}: 

- `dateTimeOptions`<br>
  {RavenUserDateTimeOptions}: 

- `numbersOptions`<br>
  {RavenUserNumbersOptions}: 


<br><br>

## RavenMessageType

type: 'action' | 'state' | 'loaded' | 'position' | 'warning' | 'error' | 'info' | 'success';

<br><br>

## RavenAppLoadedMode

type: 'action' | 'browser' | 'message';

<br><br>

## RavenRequest

### properties

- `endpoint`<br>
  {string}: 

- `method`<br>
  {string}: 

- `useProxy`<br>
  {boolean}: 

- `bodyTemplate`<br>
  {string}: 

- `headers`<br>
  {string}: 

- `useCallerHeaders`<br>
  {boolean}: 

- `responseType`<br>
  {string}: 


<br><br>

## RavenAppOptions

### properties

- `loadedMode?`<br>
  {RavenAppLoadedMode}: 

- `aboutRequest?`<br>
  {RavenRequest|string}: 

- `aboutInfo?`<br>
  {any}: 


<br><br>

## RavenAppPosition

### properties

- `action?`<br>
  {string}: 

- `path?`<br>
  {string|string[]}: 

- `url?`<br>
  {string}: 

- `data?`<br>
  {any}: 


<br><br>

## RavenAppInfo

### properties

- `name?`<br>
  {string}: 

- `version?`<br>
  {string}: 

- `options?`<br>
  {RavenAppOptions}: 

- `[pn: string]`<br>
  {any}: 

