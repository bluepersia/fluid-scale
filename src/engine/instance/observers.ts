import {
  addActiveElement,
  addPendingHiddenElement,
  getState,
  removeActiveElements,
  removePendingHiddenElement,
  sortActiveElements,
} from "./state";

const intersectionObserver = new IntersectionObserver(handleIntersection, {
  root: null,
  rootMargin: "100%",
  threshold: 0,
});

function handleIntersection(entries: IntersectionObserverEntry[]) {
  const removedElements = new Set<HTMLElement>();
  let newActive = false;
  for (const entry of entries) {
    const el = entry.target as HTMLElement;
    const elState = getState().elementStates.get(el)!;
    if (entry.isIntersecting) {
      newActive = true;
      addActiveElement(el);
      removePendingHiddenElement(el);
      elState.isVisible = true;
    } else {
      addPendingHiddenElement(el);
      removedElements.add(el);
      elState.isVisible = false;
    }
  }
  removeActiveElements(removedElements);
  if (newActive) sortActiveElements();
}

const attributesToObserve = new Set<string>([
  "class",
  "id",
  "hidden",
  "width",
  "height",
  "src", // e.g., <img>, <iframe>
  "type", // e.g., <input type="...">
  "disabled",
  "checked",
  "readonly",
  "selected",
  "open", // e.g., <details>
  "multiple",
  "colspan",
  "rowspan",
  "size",
  "lang",
  "dir",
]);

const percentTargetResizeObserver = new ResizeObserver(
  handlePercentTargetResize
);

function handlePercentTargetResize(entries: ResizeObserverEntry[]) {
  entries.forEach((entry) => {
    if (entry.target instanceof HTMLElement)
      getState().elementStates.get(entry.target)!.percentChangeFlag = true;
  });
}

const mutationObservers = new Map<HTMLElement, MutationObserver>();

function observePercentTarget(el: HTMLElement) {
  percentTargetResizeObserver.observe(el);

  const percentTargetMutationObserver = new MutationObserver(
    handlePercentTargetMutation
  );
  percentTargetMutationObserver.observe(el, { attributes: true });
  mutationObservers.set(el, percentTargetMutationObserver);
}

function handlePercentTargetMutation(mutations: MutationRecord[]) {
  mutations.forEach((mutation) => {
    if (
      mutation.target instanceof HTMLElement &&
      mutation.type === "attributes" &&
      mutation.attributeName &&
      (mutation.attributeName.startsWith("data-") ||
        attributesToObserve.has(mutation.attributeName))
    )
      getState().elementStates.get(mutation.target)!.percentChangeFlag = true;
  });
}

function unobservePercentTarget(el: HTMLElement) {
  percentTargetResizeObserver.unobserve(el);
  mutationObservers.get(el)?.disconnect();
  mutationObservers.delete(el);
}

export { intersectionObserver, observePercentTarget, unobservePercentTarget };
