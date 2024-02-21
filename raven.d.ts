// RAVEN CLIENT TYPESCRIPT DEFINITIONS
// v1.x.x

export declare interface RavenUserDateTimeOptions {
  firstDayOfWeek: number;
  date: string;
}

export declare interface RavenUserNumbersOptions {
  decimalSeparator: string;
  defaultCurrency: string;
  thousandsSeparator: string;
}

export declare interface RavenUserOptions {
  locale: string;
  rtlEnabled: boolean;
  dateTimeOptions: RavenUserDateTimeOptions;
  numbersOptions: RavenUserNumbersOptions;
}

export type RavenMessageType = 'action' | 'state' | 'loaded' | 'position' | 'warning' | 'error' | 'info' | 'success';

export declare interface RavenMessage {
  owner?: string ;
  token?: string;
  user?: string;
  roles?: string[];
  locale?: string;
  options?: Partial<RavenUserOptions>;
  theme?: string;
  id?: string;
  data?: any;
  action?: string;
  type: RavenMessageType;
  error?: any;
  context?: any;
  channel?: string;
  debug?: boolean;
}

export type RavenAppLoadedMode = 'action' | 'browser' | 'message';

export declare interface RavenRequest {
  endpoint: string;
  method: string;
  useProxy: boolean;
  bodyTemplate: string;
  headers: string;
  useCallerHeaders: boolean;
  responseType: string;
}

export declare interface RavenAppOptions {
  loadedMode?: RavenAppLoadedMode;
  aboutRequest?: RavenRequest|string;
  aboutInfo?: any;
}

export declare interface RavenAppInfo {
  name?: string;
  version?: string;
  options?: RavenAppOptions;
  [pn: string]: any;
}

export declare interface RavenAppPosition {
  action?: string;
  path?: string|string[];
  url?: string;
  data?: any;
}


export declare namespace  raven {
  /**
   * container interop state
   */
  const active: boolean;
  /**
   * raven constants
   */
  const constants: any;
  /**
   * parent origin
   */
  let parentOrigin: string;
  /**
   * getPosition
   */
  let getPosition: (loc: Location) => RavenAppPosition;
  /**
   * send/retrieve state information
   */
  function state(data?: RavenAppInfo, o?:any): Promise<RavenMessage>;
  /**
   * send message
   */
  function send(msg?: RavenMessage): void;
  /**
   * subscribe to container events
   */
  function subscribe(fn:(message: RavenMessage) => any, filter?:(message: RavenMessage)=>boolean);
  /**
   * unsubscribe from container events
   */
  function unsubscribe(fn:(message: RavenMessage) => any): void;
}

