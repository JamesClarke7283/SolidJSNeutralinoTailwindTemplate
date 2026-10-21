import { events, init } from "@neutralinojs/lib";

export type RuntimeStatus = "browser" | "connecting" | "desktop" | "offline";

let status: RuntimeStatus = typeof window.NL_PORT === "number" ? "connecting" : "browser";
let initialized = false;

export function getRuntimeStatus() {
  return status;
}

export function connectRuntime(onStatus: (status: RuntimeStatus) => void) {
  if (status === "browser") return () => {};

  const onReady = () => {
    status = "desktop";
    onStatus(status);
  };
  const onOffline = () => {
    status = "offline";
    onStatus(status);
  };

  void events.on("ready", onReady);
  void events.on("serverOffline", onOffline);
  if (!initialized) {
    initialized = true;
    try {
      init();
    } catch {
      onOffline();
    }
  }
  onStatus(status);

  return () => {
    void events.off("ready", onReady);
    void events.off("serverOffline", onOffline);
  };
}
