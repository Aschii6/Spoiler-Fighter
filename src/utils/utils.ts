import { loadFilteredUrls } from "./storage_utils";

export const getCurrentHostname = (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
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

export const isCurrentHostnameInFilteredUrls = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const filteredUrls = await loadFilteredUrls();
      const currentHostname = await getCurrentHostname();
      resolve(filteredUrls.includes(currentHostname));
    } catch (error) {
      console.error("Error checking if current hostname is in filtered URLs:", error);
      reject(error);
    }
  });
}