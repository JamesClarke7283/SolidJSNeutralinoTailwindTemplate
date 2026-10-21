import { events } from "@neutralinojs/lib";

export const COUNTER_EVENT = "counter:changed";

export type CounterAction = "increment" | "decrement" | "reset" | "emit";

export interface CounterEvent {
  id: string;
  action: CounterAction;
  value: number;
  previousValue: number;
  delta: number;
  step: number;
  timestamp: string;
}

export function subscribeToCounter(handler: (event: CounterEvent) => void) {
  const listener = (event: CustomEvent<CounterEvent>) => handler(event.detail);
  // Neutralino's local event API works in the browser without a native connection.
  void events.on(COUNTER_EVENT, listener);
  return () => void events.off(COUNTER_EVENT, listener);
}

export async function emitCounterEvent(event: CounterEvent, broadcast: boolean) {
  if (broadcast) {
    // Broadcast delivers to this window too, so don't dispatch a second copy.
    await events.broadcast(COUNTER_EVENT, event);
  } else {
    await events.dispatch(COUNTER_EVENT, event);
  }
}
