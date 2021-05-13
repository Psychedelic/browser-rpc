export type CallID = string | number;

export type ErrorRes = {
  code: number,
  message: string,
  data?: any,
};

export interface RpcBaseData {
  id: CallID;
  jsonrpc: '2.0',
};

export interface RpcResData extends RpcBaseData {
  result?: any;
  error?: ErrorRes;
};

export interface RpcReqData extends RpcBaseData {
  method: string;
  params: any[];
};

export type ReqMessage = {
  target: string;
  data: {
    name: string;
    data: RpcReqData;
  };
};

export type ResMessage = {
  target: string;
  data: {
    name: string;
    data: RpcResData;
  };
};

export type Message = ReqMessage | ResMessage;

export type Resolver = (err?: ErrorRes, res?: any) => void;

export type ResolverObject = {
  resolver: Resolver;
  timer: undefined | NodeJS.Timeout;
};

export type CallBackHandler = (err: null | ErrorRes, res?: null | any) => void;

export type HandlerProps = {
  callback: CallBackHandler,
  message: ReqMessage,
};

export type Handler = (props: HandlerProps, ...args: any[]) => any;

export type CallConfigObject = {
  timeout?: number;
  target?: string;
};

export type ValidationMessageObject = {
  isValid: boolean,
  type: 'req' | 'res' | null;
};

export interface RpcConfig {
  name: string;
  target: string;
  timeout?: number;
  handlers?: {
    [name: string]: Handler;
  };
};
