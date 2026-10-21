import { Show } from "solid-js";

export type IconName = "plus" | "minus" | "reset" | "arrow" | "code" | "activity" | "terminal" | "box" | "check";

const paths: Record<IconName, string> = {
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  reset: "M3 10a9 9 0 1 1 2.7 8.4M3 4v6h6",
  arrow: "M7 17 17 7M7 7h10v10",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18",
  activity: "M2 12h5l3-8 4 16 3-8h5",
  terminal: "m5 7 5 5-5 5m8 0h6",
  box: "m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8m-9 5v9M7.5 5.5l9 5",
  check: "m5 12 4 4L19 6",
};

export function Icon(props: { name: IconName; class?: string; size?: number }) {
  return (
    <svg width={props.size ?? 20} height={props.size ?? 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class={props.class}>
      <Show when={paths[props.name]}>{(path) => <path d={path()} />}</Show>
    </svg>
  );
}
