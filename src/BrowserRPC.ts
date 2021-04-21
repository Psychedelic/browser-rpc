import RPC from './RPC';
import { Message, RpcConfig } from './types';

class BrowserRPC extends RPC {
  private readonly win: Window;

  constructor(win: Window, config: RpcConfig) {
    super(config);
    this.win = win;
    this.receiveMessage = this.receiveMessage.bind(this);
  }

  protected sendMessage(message: Message): void {
    this.win.postMessage(message, '*');
  }

  private receiveMessage(event: MessageEvent): void {
    super.onMessage(event.data);
  }

  start(): void {
    this.win.addEventListener('message', this.receiveMessage);
  }

  stop(): void {
    super.stop();
    this.win.removeEventListener('message', this.receiveMessage);
  }
};

export default BrowserRPC;
