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
}

export declare interface RavenAppInfo {
  name?: string;
  version?: string;
  [pn: string]: any;
}


export declare namespace  raven {
  /**
   * contaner interop state
   */
  const active: boolean;
  /**
   * raven constants
   */
  const constants: any;
  /**
   * send/retrieve state informations
   */
  function state(data?: RavenAppInfo, o?:any): Promise<RavenMessage>;
  /**
   * subscribe to container events
   */
  function subscribe(fn:(message: RavenMessage) => any, filter?:(message: RavenMessage)=>boolean);
  /**
   * unsubscribe from container events
   */
  function unsubscribe(fn:(message: RavenMessage) => any): void;
  /**
   * send message
   */
  function send(msg?: RavenMessage): void;
}

