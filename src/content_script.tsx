import {loadFilteredTitles} from "./utils/storage_utils";

async function hideSpoilers() {
  chrome.runtime
    .sendMessage({action: "shouldIHideSpoilers"})
    .then(async (response) => {
      if (response.shouldHide) {
        console.log("Hiding spoilers");

        const filteredTitles = await loadFilteredTitles();

        const textNodes = getVisibleTextNodes();
        // const asciiRegexRule = /[ -~]/; // /^[\x00-\x7F]*$/
        const nonAsciiRegexRule = /[^\x00-\x7F]/;
        const nonAsciiRegex = new RegExp(nonAsciiRegexRule);

        const filteredTextNodes = textNodes.filter(({text}) => {
          return !nonAsciiRegex.test(text); // Return false if text contain ANY non-ASCII character
        });

        let processedTextNodesCount = 0;

        for (const {text, node} of filteredTextNodes) {
          const parent = node.parentElement;
          if (parent?.dataset.processed) continue;

          processedTextNodesCount++;

          console.log(text)

          /*try {
            const response = await fetch(
              "http://127.0.0.1:8000/spoilers/predict",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "sentences": [text], "titles": filteredTitles }),
              },
            );

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();

            if ((data["predictions"])[0] == true) {
              // node.textContent = "SPOILER HIDDEN";
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
              }
              node.replaceWith(span);
            }

            if (parent === null) {
              console.warn("Parent element is null for node:", node);
              continue;
            }
            parent.dataset.processed = "true";
          } catch (error) {
            console.error("Error sending request:", error);
          }*/

          if (parent !== null)
            parent.dataset.processed = "true";
        }

        console.log("Processed text nodes: ", processedTextNodesCount);
      } else {
        console.log("Not hiding spoilers");
        return;
      }
    })
    .catch((error) => {
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

        const hasMeaningfulText = node.textContent?.trim().length;

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
      text: textNode.textContent!.trim(),
      node: textNode
    });
  }

  return results;
}
