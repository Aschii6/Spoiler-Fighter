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
  await scanAndHideSpoilers();

  // Run on DOM updates
  const observer = new MutationObserver(() => {
    const now = Date.now();
    if (now - lastCalled > throttleDelay) {
      scanAndHideSpoilers();
      lastCalled = now;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "tryFiltering") {
    scanAndHideSpoilers();
  }
});

init();

async function scanAndHideSpoilers() {
  const filteringEnabled = await getFilteringEnabled();
  if (!filteringEnabled) return;

  const paragraphs = document.querySelectorAll("p, span, h1, h2, h3, h4, h5, h6");

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const text = p.textContent?.trim();

    if (!text || text.length < 5) continue;

    if (p instanceof HTMLParagraphElement || p instanceof HTMLSpanElement || p instanceof HTMLHeadingElement) {
      if (p.style.textDecoration === "line-through") continue;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/spoilers/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [i]: text }) // Send one paragraph at a time
      });

      const result = await response.json();

      if (result[i] === true) {
        if (p instanceof HTMLParagraphElement || p instanceof HTMLSpanElement || p instanceof HTMLHeadingElement) {
          p.style.textDecoration = "line-through"; // Add strikethrough effect
        }
      }
    } catch (error) {
      console.error("API request failed:", error);
    }

    await new Promise(res => setTimeout(res, 500)); // Prevent API spamming
  }
}