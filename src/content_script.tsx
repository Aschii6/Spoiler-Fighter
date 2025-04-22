async function hideSpoilers() {
  chrome.runtime.sendMessage({ action: "shouldIHideSpoilers" }).then((response) => {
    if (response.shouldHide) {
      console.log("Hiding spoilers");
      /*const textNodes = document.evaluate(
        "//text()[normalize-space()]",
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      for (let i = 0; i < textNodes.snapshotLength; i++) {
        const node = textNodes.snapshotItem(i);
        if (node) {
          const parentElement = node.parentElement;
          if (parentElement && parentElement.tagName !== "SCRIPT" && parentElement.tagName !== "STYLE") {
            const textContent = node.textContent;
            console.log("Text content:", textContent);
          }
        }
      }*/

      const textNodes = getVisibleTextNodes();
      // const asciiRegexRule = /[ -~]/; // /^[\x00-\x7F]*$/
      const nonAsciiRegexRule = /[^\x00-\x7F]/;
      const nonAsciiRegex = new RegExp(nonAsciiRegexRule);

      const filteredTextNodes = textNodes.filter(({ text }) => {
        return !nonAsciiRegex.test(text); // Return false if text contain ANY non-ASCII character
      });

      let processedTextNodesCount = 0;

      for (const { text, node, parent } of filteredTextNodes) {
        if (parent.dataset.processed) {
          continue;
        }
        processedTextNodesCount++;

        const splitRegexRule = /\b[a-zA-Z]+\b|\d+|[^\s\w]/g;
        const splitRegex = new RegExp(splitRegexRule);

        const splitText = text.match(splitRegex);

        parent.dataset.processed = "true";

        /*if (splitText) {
          const newContent = splitText
            .map((word) => {
              if (nonAsciiRegex.test(word)) {
                return `<span class="spoiler">${word}</span>`;
              }
              return word;
            })
            .join(" ");
          parent.innerHTML = parent.innerHTML.replace(text, newContent);
        }*/
      }

      console.log("Processed text nodes: ", processedTextNodesCount);
    } else {
      console.log("Not hiding spoilers");
      return;
    }
  }).catch((error) => {
    console.error("Error sending message:", error);
  });
}

async function main() {
  try {
    await hideSpoilers();

    const throttleDelay = 1000;
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
    hideSpoilers().then(() => {
      sendResponse({success: true});
    }).catch((error) => {
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
      timeout = setTimeout(() => {
        lastCall = now;
        func(...args);
      }, delay - (now - lastCall));
    } else {
      lastCall = now;
      func(...args);
    }
  };
}

/*
function throttleTrailing(func: Function, limit: number) {
  let lastRun = 0;
  let timeout: NodeJS.Timeout | null = null;
  let pending = false;

  return function () {
    const now = Date.now();
    const elapsed = now - lastRun;

    if (elapsed >= limit) {
      lastRun = now;
      func();
    } else {
      pending = true;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        if (pending) {
          lastRun = now;
          func();
          pending = false;
        }
      }, limit - elapsed);
    }
  }
}*/

type TextNodeInfo = {
  text: string;
  node: Text;
  parent: HTMLElement;
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

        const hasMeaningfulText = node.textContent?.trim().length;

        return isVisible && hasMeaningfulText ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    }
  );

  const results: TextNodeInfo[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const textNode = current as Text;
    const parent = textNode.parentElement!;
    results.push({
      text: textNode.textContent!.trim(),
      node: textNode,
      parent,
    });
  }

  return results;
}

