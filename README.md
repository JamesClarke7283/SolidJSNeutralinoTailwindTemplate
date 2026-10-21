# Neutralino + Solid + Tailwind

A small desktop application template using **NeutralinoJS 6**, **SolidJS 2**, **Tailwind CSS 4**, **TypeScript**, **Vite**, and **Bun**. It includes a counter, a typed event API, a live event stream, and a browser preview.

SolidJS 2 is currently a **release candidate**. This template pins `solid-js` and `@solidjs/web` to `2.0.0-rc.16` and uses the matching Solid 2 Vite plugin. Upgrade these packages together; Solid 1 plugins and `solid-js/web` imports are not interchangeable with this setup.

## Get started

Install [Bun 1.4.3 or newer](https://bun.com/docs/installation), then run:

```sh
bun install
bun run desktop:setup
bun run desktop
```

`desktop:setup` downloads the pinned Neutralino binaries into `bin/`. Run it once after cloning. The desktop command starts Vite with hot reload and opens a native window. Close the window to stop the desktop development session.

Linux needs GTK 3 and WebKitGTK's **4.1 or 4.0 API**. The `4.1` API number is separate from the WebKit release version (for example, `2.54.1`). On Arch Linux, install:

```sh
sudo pacman -S --needed webkit2gtk-4.1
```

Arch's `webkitgtk-6.0` package uses GTK 4 and does not provide `libwebkit2gtk-4.1.so.0`, which the pinned Neutralino binary needs. It can remain installed alongside `webkit2gtk-4.1`. If Neutralino asks for `libwebkit2gtk-4.0-37` or `libwebkit2gtk-4.1-0`, those are Debian/Ubuntu package names; the Arch package is [`webkit2gtk-4.1`](https://archlinux.org/packages/extra/x86_64/webkit2gtk-4.1/).

Windows uses WebView2. See the [Neutralino prerequisites](https://neutralino.js.org/docs/getting-started/your-first-neutralinojs-app/) for other platform setup.

To work in a browser instead:

```sh
bun run dev
```

Open `http://127.0.0.1:5173`. Browser mode uses the same event API locally and does not attempt to connect to a native runtime. The footer shows the current connection status.

## Counter and events

- Increase or decrease by 1, 5, or 10, including negative values.
- Reset to zero, or emit the current value without changing it.
- Use **↑**, **↓**, and **R** when focus is outside an interactive control.
- Inspect the newest 50 events. **Clear** clears the event history and its total, without resetting the counter.
- State is in memory and starts at zero on reload.

Every action emits `counter:changed` with this payload:

```ts
interface CounterEvent {
  id: string;              // Unique event ID
  action: "increment" | "decrement" | "reset" | "emit";
  value: number;
  previousValue: number;
  delta: number;
  step: number;
  timestamp: string;       // ISO 8601
}
```

Subscribe inside a Solid component with automatic cleanup:

```ts
import { onCleanup } from "solid-js";
import { subscribeToCounter } from "./lib/events";

onCleanup(subscribeToCounter((event) => {
  console.log(event.action, event.value);
}));
```

The helper uses [Neutralino's event API](https://neutralino.js.org/docs/api/events/). In a connected desktop session, `events.broadcast` sends the event to all connected app and extension clients, including its sender. Browser preview uses `events.dispatch`. If broadcasting fails, the event is dispatched locally and an error is displayed. Each window keeps its own counter; events communicate changes without automatically synchronizing state.

Only `events.broadcast` is enabled in the native allowlist. Add permissions to `nativeAllowList` in `neutralino.config.json` when your application needs more native APIs.

## Build

```sh
bun run build             # Type-check and compile the frontend into web-dist/
bun run preview           # Preview the compiled frontend
bun run desktop:build     # Compile and package desktop apps into dist/solid-starter/
bun run desktop:release   # Also create a portable ZIP
```

Run `desktop:setup` before the first desktop build. Keep the generated `resources.neu` beside the platform executable when distributing a build. The build command packages the downloaded platform binaries; test each target platform before distributing it. These commands do not sign installers.

The development and build tools run under Bun. `bun.lock` is committed; use `bun install --frozen-lockfile` for a reproducible install.

## Check the template

```sh
bun run typecheck
bun run --bun playwright install chromium
bun run test:e2e
```

The browser tests cover positive and negative counts, event payloads, step sizes, reset, explicit emission, keyboard controls, event retention, and a narrow viewport. To use an existing Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable path.

## Make it yours

```text
src/
  App.tsx                Counter UI and state
  components/Icon.tsx    Small inline SVG icon set
  lib/events.ts          Typed counter event contract
  lib/runtime.ts         Native initialization and connection state
  main.tsx               Solid 2 entry point
  styles.css             Tailwind theme and component styles
neutralino.config.json   App identity, window, permissions, and CLI integration
vite.config.ts           Solid 2 and Tailwind plugins
tests/counter.spec.ts    Browser integration tests
```

Change the application ID, binary name, version, and window title in `neutralino.config.json`; rename the package in `package.json`. Edit the design tokens in `src/styles.css` and replace the counter in `src/App.tsx`.

Native globals are injected by Neutralino. The `@neutralinojs/lib` package is bundled by Vite, so there is no separate client script to maintain. The CLI's `patchFile` points to `index.html` to enable its development lifecycle; with global injection enabled, no authentication script needs to be written into that file.

References: [SolidJS 2](https://v2.solidjs.com/), [Neutralino configuration](https://neutralino.js.org/docs/configuration/neutralino.config.json/), [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite), [Bun with Vite](https://bun.com/docs/guides/ecosystem/vite).

## License

Apache-2.0. See [LICENSE](./LICENSE).
