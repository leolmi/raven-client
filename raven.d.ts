// RAVEN CLIENT TYPESCRIPT DEFINITIONS
// v1.x.x

/**
 * send/retrieve state informations
 */
export function state(data?:any, o?:any): Promise<any>;
/**
 * subscribe to container events
 */
export function subscribe(fn:(data:any) => any, filter?:(data:any)=>boolean);
/**
 * unsubscribe from container events
 */
export function unsubscribe(fn:(data:any) => any);
/**
 * contaner interop state
 */
export const active: boolean;
/**
 * raven constants
 */
export const constants: any;
/**
 * send message
 */
export function send(msg?:any): void;
