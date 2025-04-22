import { loadFilteredUrls } from "./storage_utils";

export const getCurrentHostname = (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.url) {
      reject(new Error("No active tab found or no URL available"));
      return;
    }

    const url = new URL(tab.url);
    const hostname = url.hostname;
    resolve(hostname);
  });
};
