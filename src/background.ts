import {loadIsFiltering} from "./utils/storage_utils";
import {isCurrentHostnameInFilteredUrls} from "./utils/utils";

function polling() {
  setTimeout(polling, 1000 * 30);
}

polling();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "shouldIHideSpoilers") {
    (async () => {
      const isFiltering = await loadIsFiltering();
      const isInFilteredUrls = await isCurrentHostnameInFilteredUrls();

      if (!isFiltering || !isInFilteredUrls) {
        sendResponse({ shouldHide: false });
        return;
      }
      sendResponse({ shouldHide: true });
    })();

    return true;
  }
});