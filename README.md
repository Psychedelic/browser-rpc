# BrowserRPC

This library allows you exchange messages beetween BrowserRPC instances using window.postMessage API. You can call remote procedures as promises.

## Installing

Using npm:
```bash
$ npm install @fleekhq/browser-rpc
```

Using yarn
```bash
$ yarn add @fleekhq/browser-rpc
```


## Usage

RPC requires that you setup a client (who calls remote procedures and wait for responses) and a server (who process the calls and send back the responses).


Let's say that your client is going to be placed in your webpage and need to call a remote procedure method called `sum` that receives 2 arguments (2 number values to sum).

```js
import { BrowserRPC } from '@fleekhq/browser-rpc';

// Create a new rpc instance
// the name is the identidfier of this rpc instance. Name is injected as part of the call message to identify who is trying to call the method requested.
// the target is the name of the rpc server instance that should handle the request
const client = new BrowserRPC(window, {
  name: 'browser-client',
  target: 'rpc-server',
  timeout: 10000,
});

// Before calling any remote method, you have to start the rpc instance. This way, the rpc instance listen for the incoming responses
client.start();

// Now you can call the remote procedures using the "call" method. Take in mind that "call" method returns a promise that resolves to the response sent back by the rpc server or reejects with an error.
client
  .call('sum', [1, 2])
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });


// Finally, if you don't need to execute more calls, you can stop the rpc client. This method removes the listeners, which means that any incoming response is not going to be catched by the client. If later you need to call another method, you have to "start" the client again.
client.stop();
```

We've already setup the client, now we have to setup the server. The server listen for methods calls, process the calls and send the responses back to the client. Take in mind that the server only process the calls coming from the `target` specified in the initial config object.
```js
import { BrowserRPC } from '@fleekhq/browser-rpc';

// Create a new rpc instance
// name property is injected as part of the responses messages to identify who processed the response
// target property specifies who can call methods on this new instance and receive the responses. If a different target try to call methods on this instance, the calls are ignored.
const server = new BrowserRPC(window, {
  name: 'rpc-server',
  target: 'browser-client',
});


/* In order to process the calls coming from the client, you have to expose "handlers".
Handlers are just functions that receive as first argument a callback and the rest of arguments are defined by you.
your handler function has to call the callback once the response is procesed or when an error ocurred. the callback receives as first argumeent an ErrorRes object (please refer to the ErrorRes Type section) type and as second the response (any).
To expose a new handler you have to call the "exposeHandler" method on your rpc instance and pass a string name (this is the identifier for your handler) and your handler function. You can add as many handlers as you want.
*/
server.exposeHandler('sum', ({ callback, message }, val1, val2) => {
  console.log(message); // Full message
  const result = val1 + val2;

  callback(null, result);
});


// Finally, in order to start receiving incoming calls, you have to start your rpc instance.
// Same as the client, you can stop the server whenever you want.
server.start();
```


## API

For types info please refer to the `types.ts` file: `src/types.ts`

### New BrowserRPC instance:

```js
new BrowserRPC(window, config)
```

- `window`: the window object used by the instance to post messages and add the event listeners.
- `config`: [object] config required by the instance
  - `name`: [string] name of the instance. This name is injected in every message emitted by the instance to identify the caller.
  - `target`: [string] the name of the rpc instance that has to handle the call requests
  - `timeout?`: [number] timeout for call methods. 0 means no timeout. by default this value is 5000 ms
  - `handlers?` {[name: string]: Handler} object with handlers functions. object key is taken as the name identifier for the every handler function defined in the object


### BrowserRPC.start(): void
Add the event listeners required by the instance

### BrowserRPC.stop(): void
Remove the event listeners and rejects all the pending calls.

### BrowserRPC.exposeHandler(name: string, handler: Handler): void
Add a new handler to the instance

### BrowserRPC.removeHandler(name: string): boolean
Remove a handler by its name

### BrowserRPC.call(handler: string, args: any[], config?: CallConfigObject): Promise<any>
Call a new remote procedure method. Returns a promise resolving to the response or rejecting with an error.


## ErrorRes Type

Your handlers functions receive as first argument a callback function that has to be called with the response (second argument) or with an ErrorRes object as first argument if there is any error.

ErrorRes Type:
```typescript
export type ErrorRes = {
  code: number,
  message: string,
  data?: any,
};
```

This error type represents a JSON RPC error object. Please refer to the JSON RPC documentation to get information about error codes, message and data:

https://www.jsonrpc.org/specification#error_object


# ProxyRPC

This class is meant to be used on browser extensions content script. It allow proxy all the calls that arn't handled by the instance to the background script controller (see BackgroundController class). Same way, all the responses received from the BackgroundScript controller are redirected to the requester. (This class implements window.postMessage for the communication between webpages and content script, and browser.runtime.port for the cummunication between the content script and the background script).


```js
import { ProxyRPC } from '@fleekhq/browser-rpc';

// Create a new ProxyRPC instance
// name property is injected as part of the responses messages to identify who processed the response
// name property is also usid as the PORT name for the communication with the background script
// target property specifies who can call methods on this new instance and receive the responses. If a different target try to call methods on this instance, the calls are ignored.
const server = new ProxyRPC(window, {
  name: 'rpc-server',
  target: 'browser-client',
});


server.exposeHandler('sum', ({ callback, message }, val1, val2) => {
  console.log(message); // Full message
  const result = val1 + val2;

  callback(null, result);
});

server.start();
```

now if you try to call the method `sum` from your client, you'll receive the response from the ProxyRPC instance, but if you try to call a method not defined into the Proxy, the call is going to be redirected to the background script using `Port` communication in order to be processed. If the method also doesn't exists in the background script controller, the call is rejected with an error.


# BackgroundController

This class implements Port communication between the content script and other resources with access to the Port API. Similar to the BorwserRPC and ProxyRPC, you can expose handlers to process the requests.


```js
import { BackgroundController } from '@fleekhq/browser-rpc';

const backgroundController = new BackgroundController({
  name: 'bg-script',
  trustedSources: [
    'rpc-server',
    'another-port-source',
  ],
});

backgroundController.exposeController('hello', (opts, name) => {
  const { message, sender, callback } = opts;

  console.log(message); // Full message
  console.log(sender); // Sender information: port id, port name, port


  callback(null, `hello ${name}!!!`);
});

backgroundController.exposeController('remoteCall', (opts, myNumber, callId, portId) => {
  const { callback } = opts;

  callback(null, myNumber);
  callback(null, myNumber, [{ portId, callId }]);
});

backgroundController.start();
```


### BackgroundController.exposeHandler(name: string, handler: ControllerHandler): void

Add a new handler to the instance

#### handler: (opts, ...args) => void
- opts (object):
  - sender: Sender information object
    - id: port id assigned by the instance
    - name: port name
    - port: port
  - ports: Map with all the ports handled by the instance:  Map<id: number, port>;
  - message: The full message
  - callback: callback used to send a response back to the sender port or to another port
    - err: ErrorRes type if you want to send an error or null if is not required
    - res: any, the respose that you want to send back to the sender
    - targetPorts: optional, this is an array of objects with a portId and a callId (message call id). If you want to send a response to a different port, you have to pass this information, otherwise the callback is going to respond directly to the sender
      - portId: number, the target port id
      - callId: number | string, the call id

```typescript
  type HandlerProps = {
    sender: {
      id: number,
      name: string,
      port: chrome.runtime.Port,
    },
    ports: Map<number, chrome.runtime.Port>,
    message: Message,
    callback: (
      err: ErrorRes | null,
      res: any,
      targetPorts?: {
        portId: number,
        callId: CallID,
      }[],
    ) => void,
  };

  type ControllerHandler = (
    props: HandlerProps,
    ...args: any[]
  ) => void;
```


# PortRPC

Similar to BrowserRPC, this one is used to send requests to the BackgroundController using Port communication

```js
import { PortRPC } from '@fleekhq/browser-rpc';

const client = new PortRPC({
  name: 'browser-port-rpc',
  target: 'bg-script',
  timeout: 10000,
});

client.start();

client
  .call('sum', [1, 2])
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
```

# Full Example

Here is a full implementation of BrowserRPC, ProxyRPC, PortRPC and BackgroundController

webpage
```js
  import { BrowserRPC } from '@fleekhq/browser-rpc';

  const client = new BrowserRPC(window, {
    name: 'browser-client',
    target: 'rpc-server',
    timeout: 10000,
  });

  client.start();

  // This call is handled directly by ProxyRPC since the handler is definded
  client
    .call('sum', [1, 2])
    .then((result) => {
      console.log(result); // result: 3. response processed by ProxyRPC handler
    });


  // In this case the method isn't defined on ProxyRPC so the call is redirected to the Background controller
  client
    .call('hello', ['Jhon'])
    .then((result) => {
      console.log(result); // result: "hello John!!!". response processed by BackgroundController handler
    });
```

content script
```js
  import { ProxyRPC } from '@fleekhq/browser-rpc';
  const server = new ProxyRPC(window, {
    name: 'rpc-server',
    target: 'browser-client',
  });

  server.exposeHandler('sum', ({ callback, message }, val1, val2) => {
    console.log(message); // Full message
    const result = val1 + val2;

    callback(null, result);
  });

  server.start();
```


background script
```js
  import { BackgroundController } from '@fleekhq/browser-rpc';

  const backgroundController = new BackgroundController({
    name: 'bg-script',
    trustedSources: [
      'rpc-server',
      'another-port-source',
    ],
  });

  backgroundController.exposeController('hello', (opts, name) => {
    const { message, sender, callback } = opts;

    console.log(message); // Full message
    console.log(sender); // Sender information: port id, port name, port


    callback(null, `hello ${name}!!!`);
  });

  backgroundController.exposeController('remoteCall', (opts, myNumber, callId, portId) => {
    const { callback } = opts;

    callback(null, myNumber);

    // here you can use another callID and portID to send a response to a different port if you want
    callback(null, myNumber, [{ portId, callId }]); 
  });

  backgroundController.start();
```
