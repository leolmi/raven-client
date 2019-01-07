# RAVEN Client

raven client interop

## install

````
npm i raven-client --save
````

# API

## properties

- `active`<br>
  {boolean}: is true if raven is active

- `constants`<br>
  {object}: contains some raven constants

## methods

- `state(data [, options]) => {promise}`<br>
  send client data and retrieve (by promise) container info<br>
  ````
  const clientData = {
    name: 'My application name',
    version: 'x.xx.xxx'
  };
  raven.state(clientData)
    .then(serverData => {
      serverData.token      // server authentication token
      serverData.user       // logged user name
    }, err => {
      // error handler...
    })
  ````

- `subscribe(callback [, filter])`<br>
  subscribes callback to raven events filtering (optional) by specific function (filter)

- `unsubscribe(callback)`<br>
  unsubscribes callback


<br>

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
<br>

## Angular 2+ (ES6)
reference:
````
import * as raven from 'raven-client';
````

consider raven an external angular implementation, so you have to resync events in angular scope:
````
import { ..., NgZone} from '@angular/core';
import * as raven from 'raven-client';

@Component({
  ...
})
export class MyComponent {
  constructor(...,
              private zone: NgZone) {
    ...
  }

  myMethod() {
    ...
    raven.subscribe(data => this.zone.run(() => {
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
    version: 'x.xx.xxx'
  }).then(data => {
    // container data info...
  }, err => {
    // error handler...
  });
````

