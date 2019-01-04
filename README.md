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
  send client data and retrieve (by promise) container info

- `subscribe(callback [, filter])`<br>
  subscribes callback to raven events filtering (optional) by specific function (filter)

- `unsubscribe(callback)`<br>
  unsubscribes callback


<br>

### Angular 2+
reference:
````
import * as raven from 'raven-client';
````

for angular 2+ consider raven an external angular implementation, so you have to resync events in angular scope:
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