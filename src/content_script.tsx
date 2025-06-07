import {loadFilteredTitles} from "./utils/storage_utils";

let isHidingSpoilers = false;

async function hideSpoilers() {
  if (isHidingSpoilers) {
    console.log("hideSpoilers is already running, skipping this call.");
    return;
  }

  isHidingSpoilers = true;

  try {
    const response = await chrome.runtime.sendMessage({action: "shouldIHideSpoilers"});

    if (response.shouldHide) {
      console.log("Hiding spoilers");

      const filteredTitles = await loadFilteredTitles();
      const textNodes = getVisibleTextNodes();
      const nonAsciiRegex = /[^\x00-\x7F]/;

      const filteredTextNodes = textNodes.filter(({text, node}) => {
        const parent = node.parentElement;
        return !nonAsciiRegex.test(text) || !(parent?.dataset.processed)
      });

      let processedTextNodesCount = 0;

      const GROUP_LENGTH = 150;

      type TextNodeGroup = {
        text: string;
        nodes: TextNodeInfo[];
      };
      const textNodeGroups: TextNodeGroup[] = [];
      let currentGroup: TextNodeGroup = {text: "", nodes: []};

      for (const {text, node} of filteredTextNodes) {
        if (currentGroup.text.length + text.length > GROUP_LENGTH) {
          textNodeGroups.push(currentGroup);
          console.log("New group created");
          currentGroup = {text: "", nodes: []};
        }
        currentGroup.text += text + " ";
        currentGroup.nodes.push({text, node});
      }

      if (currentGroup.text.length > 0) {
        textNodeGroups.push(currentGroup);
      }

      for (const group of textNodeGroups) {
        try {
          const response = await fetch("http://127.0.0.1:8000/spoilers/predict", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({sentences: [group.text], titles: filteredTitles}),
          });

          if (!response.ok) {
            console.log("Network response was not ok");
            continue;
          }

          const data = await response.json();

          if (data["predictions"][0] == true) {
            for (const {text, node} of group.nodes) {
              replaceTextNodeWithSpan(node, text);
              processedTextNodesCount++;
            }
          }

          const parents = new Set(group.nodes.map(({node}) => node.parentElement));
          for (const parent of parents) {
            if (parent) {
              parent.dataset.processed = "true";
            }
          }
        } catch (error) {
          console.error("Error sending request:", error);
        }
      }

      /*for (const { text, node } of filteredTextNodes) {
        console.log(text);

        const parent = node.parentElement;
        if (parent?.dataset.processed) continue;

        processedTextNodesCount++;

        try {
          const response = await fetch("http://127.0.0.1:8000/spoilers/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sentences: [text], titles: filteredTitles }),
          });

          if (!response.ok) {
            console.log("Network response was not ok");
            continue;
          }

          const data = await response.json();

          if (data["predictions"][0] === true) {
            replaceTextNodeWithSpan(node, text);
          }

          if (parent === null) {
            console.warn("Parent element is null for node:", node);
            continue;
          }
          parent.dataset.processed = "true";
        } catch (error) {
          console.error("Error sending request:", error);
        }
      }*/

      console.log("Processed text nodes: ", processedTextNodesCount);
    } else {
      console.log("Not hiding spoilers");
    }
  } catch (error) {
    console.error("Error in hideSpoilers:", error);
  } finally {
    isHidingSpoilers = false;
  }
}

function replaceTextNodeWithSpan(node: Text, text: string) {
  const span = document.createElement("span");
  span.className = "spoiler-fighter-hidden";
  span.textContent = text;
  span.onclick = () => {
    if (span.classList.contains("spoiler-fighter-hidden")) {
      span.classList.remove("spoiler-fighter-hidden");
      span.classList.add("spoiler-fighter-revealed");
    } else {
      span.classList.remove("spoiler-fighter-revealed");
      span.classList.add("spoiler-fighter-hidden");
    }
  };
  node.replaceWith(span);
  span.dataset.processed = "true";
}

async function main() {
  try {
    await hideSpoilers();

    const throttleDelay = 3000;
    const throttledHideSpoilers = throttle(hideSpoilers, throttleDelay);

    const observer = new MutationObserver(() => {
      throttledHideSpoilers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.error("Error in content script:", error);
  }
}

main().then();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "hideSpoilers") {
    hideSpoilers()
      .then(() => {
        sendResponse({success: true});
      })
      .catch((error) => {
        console.error("Error hiding spoilers:", error);
        sendResponse({success: false});
      });
    return true;
  }
});

function throttle(func: Function, delay: number) {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: any[]) {
    const now = Date.now();
    if (lastCall && now < lastCall + delay) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(
        () => {
          lastCall = now;
          func(...args);
        },
        delay - (now - lastCall),
      );
    } else {
      lastCall = now;
      func(...args);
    }
  };
}

type TextNodeInfo = {
  text: string;
  node: Text;
};

function getVisibleTextNodes(): TextNodeInfo[] {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const style = window.getComputedStyle(parent);
        const isVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          parseFloat(style.opacity) > 0;

        if (node.textContent === null) return NodeFilter.FILTER_REJECT;

        const hasMeaningfulText = node.textContent.trim().length > 10;

        return isVisible && hasMeaningfulText
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    },
  );

  const results: TextNodeInfo[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const textNode = current as Text;

    if (!textNode.textContent) continue;
    if (textNode.textContent.trim().length === 0) continue;

    results.push({
      text: textNode.textContent!,
      node: textNode
    });
  }

  return results;
}

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .spoiler-fighter-hidden {
      background-color: #333 !important;
      color: transparent !important;
      cursor: pointer !important;
      text-decoration: none !important;
      border-radius: 4px !important;
      filter: blur(2px) !important;
    }

    .spoiler-fighter-revealed {
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(style);
}

// Call the function to inject styles
injectStyles();