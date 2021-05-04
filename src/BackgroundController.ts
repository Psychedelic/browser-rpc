// @ts-ignore
import extension from 'extensionizer';
import { validateMessageSchema } from './helpers';
import { JSON_RPC_ERROR_CODES } from './constants';

import {
  CallID,
  ErrorRes,
  ReqMessage,
  ResMessage,
} from './types';

type EnhancedResMessage = ResMessage & {
  targetPorts?: number | number[],
};

type Message = ReqMessage | EnhancedResMessage;

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

type BackgroundControllerConfig = {
  name: string,
  trustedSources: string |  string[],
  controllers?: {
    [name: string]: ControllerHandler,
  },
}

export default class BackgroundController {
  private name: string;
  private trustedSources: string[] = [];
  private ports = new Map<number, chrome.runtime.Port>();
  private controllers = new Map<string, ControllerHandler>();

  constructor(config: BackgroundControllerConfig) {
    const {
      controllers,
      trustedSources,
    } = config;

    this.name = config.name;

    if (typeof trustedSources === 'string') {
      this.trustedSources = [trustedSources];
    } else if (Array.isArray(trustedSources)) {
      this.trustedSources = trustedSources;
    }

    if (controllers) {
      for (const [name, controller] of Object.entries(controllers)) {
        this.controllers.set(name, controller);
      }
    }

    this.onTabRemoved = this.onTabRemoved.bind(this);
    this.onPortMessage = this.onPortMessage.bind(this);
    this.onConnectListener = this.onConnectListener.bind(this);
  }

  exposeController(name: string, controller: ControllerHandler): void {
    this.controllers.set(name, controller);
  }

  removeController(name: string): boolean {
    return this.controllers.delete(name);
  }

  private callController(message: ReqMessage, port: chrome.runtime.Port): void {
    const method = message.data.data.method;
    const controller = this.controllers.get(method);

    if (!controller) {
      console.error(`controller "${method}" does not exist`);

      const errMessage: ResMessage = {
        target: port.name,
        data: {
          name: this.name,
          data: {
            id: message.data.data.id,
            jsonrpc: '2.0',
            error: {
              code: JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND,
              message: `Method ${message.data.data.method} does not exist`,
            },
          },
        },
      };

      port.postMessage(errMessage);
      return;
    }

    controller({
      message,
      callback: this.sendPortResponse.bind(this, port, message.data.data.id),
      ports: this.ports,
      sender: {
        id:  port.sender?.tab?.id || 0,
        name: port.name,
        port,
      },
    }, ...message.data.data.params);
  }

  private sendPortResponse(
    port: chrome.runtime.Port,
    callId: CallID,
    err: ErrorRes | null,
    res: any,
    targetPorts?: {
      portId: number,
      callId: CallID,
    }[],
  ): void {
    if (!targetPorts) {
      const resMessage = this.buildResMessage(port.name, this.name, callId, err, res);
      port.postMessage(resMessage);
      return;
    }

    targetPorts.forEach((targetPort) => {
      const _port = this.ports.get(targetPort.portId);

      if (_port) {
        const resMessage = this.buildResMessage(_port.name, this.name, targetPort.callId, err, res);
        _port.postMessage(resMessage);
      }
    });
  }

  private buildResMessage(target: string, name: string, id: CallID, err: ErrorRes | null, res: any): ResMessage {
    const resMessage: ResMessage = {
      target,
      data: {
        name,
        data: {
          id,
          jsonrpc: '2.0',
          ...(err ? { error: err } : { result: res }),
        },
      },
    };

    return resMessage;
  }

  private sendResponse(message: EnhancedResMessage): void {
    const {
      targetPorts,
      ...rpcResponse
    } = message;

    let portsIds: number[] = [];

    if (typeof targetPorts === 'string') {
      portsIds = [targetPorts];
    } else if (Array.isArray(targetPorts)) {
      portsIds = targetPorts;
    }

    portsIds.forEach((portId) => {
      const port = this.ports.get(portId);

      if (port) {
        port.postMessage(rpcResponse);
      }
    });
  }


  private onPortMessage(message: Message, port: chrome.runtime.Port): void {
    const { type, isValid } = validateMessageSchema(message);

    if (!isValid) {
      console.error('port message not valid', message);
      return;
    }

    switch (type) {
      case 'req':
        this.callController(<ReqMessage>message, port);
        break;

      case 'res':
        this.sendResponse(<EnhancedResMessage>message);
        break;
    }
  }

  private onConnectListener(port: chrome.runtime.Port) {
    if (!this.trustedSources.includes(port.name)) {
      console.error(`Port ${port.name} not allowed`);
      return;
    };

    this.updatePorts();
    const tabId = port.sender?.tab?.id;

    if (tabId === undefined || tabId === null) {
      console.error('Port does not contain a valid tabId');
      return;
    };

    this.ports.set(tabId, port);

    port.onMessage.addListener(this.onPortMessage);
  }

  private onTabRemoved(tabId: number): void {
    const port = this.ports.get(tabId);

    if (port) {
      port.disconnect();
      this.ports.delete(tabId);
    }
  }

  private updatePorts(): void {
    extension.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      const tabsIds = tabs.map((tab) => tab.id);
      const portsIds: number[] = [];

      this.ports.forEach((_, id) => portsIds.push(id));

      portsIds.forEach((id) => {
        if (!tabsIds.includes(id)) {
          const port = this.ports.get(id);

          port?.disconnect();
          this.ports.delete(id);
        }
      });
    });
  }

  start(): void {
    extension.runtime.onConnect.addListener(this.onConnectListener);
    extension.tabs.onRemoved.addListener(this.onTabRemoved);
  }

  stop(): void {
    this.ports.forEach((port) => {
      port.disconnect();
    });

    this.ports.clear();
    extension.runtime.onConnect.removeListener(this.onConnectListener);
    extension.tabs.onRemoved.removeListener(this.onTabRemoved);
  }
}
