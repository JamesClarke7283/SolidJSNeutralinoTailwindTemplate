import { createEffect, createSignal, For, Show } from "solid-js";
import { Icon } from "./components/Icon";
import { COUNTER_EVENT, emitCounterEvent, subscribeToCounter, type CounterAction, type CounterEvent } from "./lib/events";
import { connectRuntime, getRuntimeStatus } from "./lib/runtime";

const actionLabels: Record<CounterAction, string> = {
  increment: "Incremented",
  decrement: "Decremented",
  reset: "Reset counter",
  emit: "Event emitted",
};

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
});

export default function App() {
  const [count, setCount] = createSignal(0);
  const [step, setStep] = createSignal(1);
  const [history, setHistory] = createSignal<CounterEvent[]>([]);
  const [totalEvents, setTotalEvents] = createSignal(0);
  const [runtime, setRuntime] = createSignal(getRuntimeStatus());
  const [error, setError] = createSignal("");

  async function updateCounter(action: CounterAction) {
    const previousValue = count();
    const value = action === "reset" ? 0
      : action === "increment" ? previousValue + step()
      : action === "decrement" ? previousValue - step()
      : previousValue;

    if (!Number.isSafeInteger(value)) {
      setError("You've reached the safe integer limit. Reset the counter to keep going.");
      return;
    }

    setCount(value);
    setError("");
    const event: CounterEvent = {
      id: crypto.randomUUID(), action, value, previousValue,
      delta: value - previousValue, step: step(), timestamp: new Date().toISOString(),
    };

    try {
      await emitCounterEvent(event, runtime() === "desktop");
    } catch {
      await emitCounterEvent(event, false);
      setError("Native broadcast failed. Your event was delivered locally.");
    }
  }

  createEffect(() => true, () => {
    const unsubscribe = subscribeToCounter((event) => {
      setHistory((items) => [event, ...items].slice(0, 50));
      setTotalEvents((total) => total + 1);
    });
    const disconnect = connectRuntime(setRuntime);

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
        || target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, button, a"))) return;

      const action = event.key === "ArrowUp" ? "increment"
        : event.key === "ArrowDown" ? "decrement"
        : event.key.toLowerCase() === "r" ? "reset" : undefined;
      if (action) {
        event.preventDefault();
        void updateCounter(action);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      unsubscribe();
      disconnect();
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <div class="app-shell min-h-screen">
      <header class="border-b border-line bg-white/75">
        <div class="mx-auto flex max-w-[1184px] items-center justify-between px-6 py-5 sm:px-10">
          <a href="#" class="brand flex items-center gap-3" aria-label="Starter home">
            <span class="brand-mark" aria-hidden="true"><span /><span /></span>
            <span class="text-[17px] font-semibold tracking-[-0.5px]">neutralino<span class="font-normal text-muted"> / </span>solid</span>
          </a>
          <a class="doc-link inline-flex items-center gap-2 text-[13px] font-medium text-muted hover:text-ink" href="https://neutralino.js.org/docs/" target="_blank" rel="noreferrer">Documentation <Icon name="arrow" size={15} /></a>
        </div>
      </header>

      <main class="mx-auto max-w-[1184px] px-6 pb-8 pt-10 sm:px-10 sm:pt-12">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div class="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[2px] text-muted"><span class="h-1.5 w-1.5 rounded-full bg-accent" /> Your next idea starts here</div>
            <h1 class="text-[36px] leading-tight font-semibold tracking-[-1.5px] sm:text-[42px]">A little counter.<br class="sm:hidden" /> A solid start.</h1>
            <p class="mt-3 text-[14px] leading-6 text-muted">Native feel. Reactive by nature. Ready to make your own.</p>
          </div>
          <span class="mb-1 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-muted"><Icon name="box" size={13} /> Starter template <span class="ml-1 border-l border-line pl-2 font-mono">v1.0</span></span>
        </div>

        <div class="workspace-grid grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <section class="counter-panel overflow-hidden rounded-2xl border border-[#dbdaf6]" aria-labelledby="counter-title">
            <div class="flex items-center justify-between px-6 pt-6 sm:px-7">
              <div class="flex items-center gap-2.5"><span class="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/15 bg-white/60 font-mono text-sm text-accent">#</span><h2 id="counter-title" class="text-[13px] font-medium text-[#5d5b82]">The counter</h2></div>
              <span class="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[1.4px] text-[#77739b]"><span class="h-1 w-1 rounded-full bg-accent" /> Reactive state</span>
            </div>

            <div class="counter-center flex flex-col items-center px-6 pb-8 pt-10 sm:px-7">
              <p class="text-[10px] font-medium uppercase tracking-[2px] text-[#8c87af]">Current value</p>
              <output aria-label="Counter value" aria-live="polite" class={`counter-value my-1 block max-w-full overflow-x-auto text-center font-medium text-[#343056] ${Math.abs(count()) > 99999 ? "counter-value-long" : ""}`}>{count()}</output>
              <div class="mt-3 flex w-full max-w-[316px] items-center gap-3">
                <button type="button" class="counter-button counter-button-minus" onClick={() => void updateCounter("decrement")} aria-label="Decrease counter"><Icon name="minus" size={21} /><span>Decrease</span></button>
                <button type="button" class="counter-button counter-button-plus" onClick={() => void updateCounter("increment")} aria-label="Increase counter"><Icon name="plus" size={21} /><span>Increase</span></button>
              </div>
              <div class="mt-6 flex items-center gap-3 text-[11px] text-[#807b9d]">
                <span>Step size</span>
                <div class="inline-flex gap-1 rounded-lg border border-[#dcd9f0] bg-[#e6e3f5]/65 p-1" role="group" aria-label="Step size">
                  <For each={[1, 5, 10]}>{(value) => <button type="button" class={`step-button ${step() === value ? "selected" : ""}`} aria-pressed={step() === value ? "true" : "false"} onClick={() => setStep(value)}>{value}</button>}</For>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-[#dedcf1] bg-white/30 px-6 py-4 sm:px-7">
              <button type="button" class="secondary-button" onClick={() => void updateCounter("reset")}><Icon name="reset" size={14} /> Reset counter</button>
              <button type="button" class="secondary-button text-accent!" onClick={() => void updateCounter("emit")}><Icon name="activity" size={14} /> Emit event <span aria-hidden="true">↗</span></button>
            </div>
          </section>

          <section class="event-panel flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-line bg-white" aria-labelledby="event-title">
            <div class="flex items-center justify-between border-b border-line px-5 py-5 sm:px-6">
              <h2 id="event-title" class="flex items-center gap-2.5 text-[13px] font-semibold"><Icon name="activity" size={17} class="text-muted" /> Event stream <span class="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[10px] font-normal text-muted" aria-label="Total events">{totalEvents()}</span></h2>
              <button type="button" class="text-[11px] text-muted transition-colors hover:text-ink disabled:opacity-40" disabled={!history().length} onClick={() => { setHistory([]); setTotalEvents(0); }}>Clear</button>
            </div>
            <div class="event-log flex-1 overflow-y-auto px-5 sm:px-6" role="log" aria-label="Counter events" aria-live="polite">
              <Show when={history().length > 0} fallback={
                <div class="flex h-full min-h-[260px] flex-col items-center justify-center pb-5 text-center">
                  <div class="empty-orbit mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[#dedfe8]"><div class="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-[#aaaabb]"><Icon name="terminal" size={20} /></div></div>
                  <p class="text-[13px] font-medium text-[#666875]">Quiet, for now.</p>
                  <p class="mt-2 max-w-[220px] text-[12px] leading-5 text-[#989aa5]">Give the counter a nudge.<br />Every change has a story.</p>
                </div>
              }>
                <For each={history()}>{(event) => (
                  <div class="event-row border-b border-line py-4 last:border-0">
                    <div class="flex items-center justify-between gap-3">
                      <span class="flex items-center gap-2 text-[12px] font-medium"><span class={`event-dot ${event.action === "decrement" ? "event-dot-down" : event.action === "reset" ? "event-dot-reset" : ""}`} />{actionLabels[event.action]}</span>
                      <time datetime={event.timestamp} class="font-mono text-[10px] text-[#9b9ca8]">{timeFormatter.format(new Date(event.timestamp))}</time>
                    </div>
                    <div class="mt-2 flex items-center justify-between gap-2 pl-3.5"><code class="text-[10px] text-[#9292a5]">{COUNTER_EVENT}</code><span class="font-mono text-xs text-muted">{event.previousValue} <span class="mx-1 text-[#bbbac7]">→</span> <b class="font-medium text-ink">{event.value}</b></span></div>
                  </div>
                )}</For>
              </Show>
            </div>
            <div class="flex items-center gap-2 border-t border-line bg-[#fcfcfd] px-5 py-3.5 text-[10px] text-[#9797a5] sm:px-6"><span class="h-1.5 w-1.5 rounded-full bg-[#88b3a0]" /> Listening to <code class="text-[#737385]">{COUNTER_EVENT}</code><span class="ml-auto">Last 50</span></div>
          </section>
        </div>

        <Show when={error()}><p role="alert" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">{error()}</p></Show>

        <div class="my-5 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] text-[#a0a0ae]">
          <span class="flex items-center gap-1.5"><Icon name="check" size={12} /> Each action emits an event. Yes, even reset.</span>
          <span class="flex items-center gap-1.5">Try your keyboard <kbd>↑</kbd><kbd>↓</kbd><span class="ml-1">or</span><kbd>R</kbd><span>to reset</span></span>
        </div>

        <section class="mt-9" aria-labelledby="stack-title">
          <div class="mb-3 flex items-center justify-between"><h2 id="stack-title" class="text-[10px] font-medium uppercase tracking-[1.7px] text-[#9697a4]">Small stack. Big possibilities.</h2><span class="text-[10px] text-[#acaeba]">Built to be built on</span></div>
          <div class="grid gap-3 sm:grid-cols-3">
            <a class="stack-card group" href="https://neutralino.js.org/docs/" target="_blank" rel="noreferrer"><span class="stack-icon bg-[#f2f3f5] text-[#666778]"><Icon name="box" size={21} /></span><span class="min-w-0 flex-1"><span class="block text-[12px] font-semibold">NeutralinoJS <span class="version-tag">6.10</span></span><span class="mt-1 block text-[10px] text-muted">Lightweight native runtime</span></span><Icon name="arrow" size={14} class="text-[#bbbcc7] transition-colors group-hover:text-accent" /></a>
            <a class="stack-card group" href="https://v2.solidjs.com/" target="_blank" rel="noreferrer"><span class="stack-icon bg-[#eef4fc] text-[#4b80ba]"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path opacity=".45" d="m2 8 14-5 6 5-14 5z" /><path opacity=".7" d="m2 12 14-5 6 5-14 5z" /><path d="m2 16 14-5 6 5-14 5z" /></svg></span><span class="min-w-0 flex-1"><span class="block text-[12px] font-semibold">SolidJS <span class="version-tag">2.0 RC</span></span><span class="mt-1 block text-[10px] text-muted">Fine-grained reactivity</span></span><Icon name="arrow" size={14} class="text-[#bbbcc7] transition-colors group-hover:text-accent" /></a>
            <a class="stack-card group" href="https://tailwindcss.com/docs/" target="_blank" rel="noreferrer"><span class="stack-icon bg-[#ecf8fb] text-[#47a9be]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 5c-4 0-6 2-6 6 1.5-2 3-2.75 4.5-2.25.86.29 1.47 1.12 2.14 2.03C13.74 12.25 15 14 18 14c4 0 6-2 6-6-1.5 2-3 2.75-4.5 2.25-.86-.29-1.47-1.12-2.14-2.03C16.26 6.75 15 5 12 5ZM6 11c-4 0-6 2-6 6 1.5-2 3-2.75 4.5-2.25.86.29 1.47 1.12 2.14 2.03C7.74 18.25 9 20 12 20c4 0 6-2 6-6-1.5 2-3 2.75-4.5 2.25-.86-.29-1.47-1.12-2.14-2.03C10.26 12.75 9 11 6 11Z" /></svg></span><span class="min-w-0 flex-1"><span class="block text-[12px] font-semibold">Tailwind CSS <span class="version-tag">4.3</span></span><span class="mt-1 block text-[10px] text-muted">Style at the speed of thought</span></span><Icon name="arrow" size={14} class="text-[#bbbcc7] transition-colors group-hover:text-accent" /></a>
          </div>
        </section>

        <footer class="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[10px] text-[#a1a2ad]">
          <span class="flex items-center gap-2"><Icon name="code" size={14} /> A starting point, not a finish line.</span>
          <span class="inline-flex items-center gap-2"><span class={`status-dot ${runtime() === "offline" || runtime() === "connecting" ? "status-dot-offline" : ""}`} />{runtime() === "desktop" ? "Native runtime connected" : runtime() === "connecting" ? "Connecting to native runtime…" : runtime() === "offline" ? "Native runtime offline · local events" : "Browser preview · local events"}<span class="mx-1 text-[#d6d6de]">/</span> TypeScript + Vite</span>
        </footer>
      </main>
    </div>
  );
}
