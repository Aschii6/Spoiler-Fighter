import {getFilteringEnabled} from "./utils/storage-utils";

const placeholderFunction = async () => {
  const filteringEnabled = await getFilteringEnabled();
  if (!filteringEnabled) return;

  console.log("Placeholder filter function triggered");
};

let lastCalled = 0;
const throttleDelay = 1000;

const init = async () => {
  // Run once on initial load
  await placeholderFunction();

  // Run on DOM updates
  const observer = new MutationObserver(() => {
    const now = Date.now();
    if (now - lastCalled > throttleDelay) {
      placeholderFunction();
      lastCalled = now;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "enableFiltering") {
    placeholderFunction();
  }
});

init();
