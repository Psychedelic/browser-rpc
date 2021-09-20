import { v4 as uuid } from 'uuid';

import { validateMessageSchema } from './helpers';
import { JSON_RPC_VERSION, JSON_RPC_ERROR_CODES } from './constants';
import {
  CallID,
  Handler,
  Message,
  Resolver,
  RpcConfig,
  ReqMessage,
  ResMessage,
  ResolverObject,
  CallBackHandler,
  CallConfigObject,
} from './types';

export default abstract class RPC {
  protected name: string;
  protected target: string;
  private timeout: number = 5000;
  protected handlers = new Map<string, Handler>();
  private calls = new Map<CallID, ResolverObject>();

  constructor(config: RpcConfig) {
    this.name = config.name;
    this.target = config.target;

    if (config.timeout) {
      this.timeout = config.timeout;
    }

    if (config.handlers) {
      for (const [name, handler] of Object.entries(config.handlers)) {
        this.handlers.set(name, handler);
      }
    }
  };

  exposeHandler(name: string, handler: Handler): void {
    this.handlers.set(name, handler);
  }

  removeHandler(name: string): boolean {
    return this.handlers.delete(name);
  }

  private async _call(handler: string, target: string, timeout: number, args: any[]) {
    const id = uuid();

    const message: ReqMessage = {
      target: target,
      data: {
        name: this.name,
        data: {
          id,
          jsonrpc: JSON_RPC_VERSION,
          method: handler,
          params: args,
        },
      },
    };

    return new Promise((resolve, reject) => {
      const resolver: Resolver = (err, res) => {
        if (err) {
          reject(new Error(err.message));
          return;
        }

        resolve(res);
      };

      let timer;

      if (timeout > 0) {
        timer = setTimeout(() => {
          if (this.calls.has(id)) {
            this.calls.delete(id);

            resolver({
              code: JSON_RPC_ERROR_CODES.TIMEOUT_ERROR,
              message: 'Request Timeout',
            });
          }
        }, timeout);
      };

      this.calls.set(id, { resolver, timer });
      this.sendMessage(message);
    });
  }

  async call(handler: string, args?: any[] | null, config?: CallConfigObject): Promise<any> {
    let timeout = this.timeout;

    if (config && typeof config.timeout === 'number') {
      timeout = config.timeout;
    }

    return this._call(
      handler,
      config?.target || this.target,
      timeout,
      args || [],
    );
  }

  protected onMessage(eventMessage: any): void {
    const { type, isValid } = validateMessageSchema(eventMessage);
    if (!isValid) return;

    const message = eventMessage as Message;

    if (message.target === this.name && this.target === message.data.name) {
      switch (type) {
        case 'req':
          this.onRequestMessage(<ReqMessage>message);
          break;

        case 'res':
          this.onResponseMessage(<ResMessage>message);
          break;
      }
    }
  }

  protected onRequestMessage(message: ReqMessage): void {
    const resMessage: ResMessage = {
      target: this.target,
      data: {
        name: this.name,
        data: {
          id: message.data.data.id,
          jsonrpc: JSON_RPC_VERSION,
        },
      },
    };

    try {
      const handler = this.handlers.get(message.data.data.method);

      if (!handler) {
        resMessage.data.data.error = {
          code: JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND,
          message: `Method ${message.data.data.method} does not exist`,
        };

        this.sendMessage(resMessage);
        return;
      }

      const callback: CallBackHandler = (err, res) => {
        if (err) {
          resMessage.data.data.error = err;
          this.sendMessage(resMessage);
          return;
        }

        resMessage.data.data.result = res;
        this.sendMessage(resMessage);
      };

      handler({
        callback,
        message,
      }, ...message.data.data.params);
    } catch (error) {
      if (resMessage.data.data.hasOwnProperty('error')) return;
      if (resMessage.data.data.hasOwnProperty('result')) return;

      resMessage.data.data.error = {
        code: JSON_RPC_ERROR_CODES.SERVER_ERROR,
        message: error.toString(),
      };

      this.sendMessage(resMessage);
    };
  }

  private onResponseMessage(message: ResMessage): void {
    const { id, error, result } = message.data.data;

    const call = this.calls.get(id);
    if (!call) return;

    if (call.timer) {
      clearTimeout(call.timer);
    }

    call.resolver(error, result);
    this.calls.delete(id);
  }

  stop(): void {
    this.calls.forEach((call) => {
      if (call.timer) {
        clearTimeout(call.timer);
      }

      call.resolver({
        message: 'RPC stopped',
        code: JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
      });
    });

    this.calls.clear();
  }

  protected abstract sendMessage(message: Message): void;
};

