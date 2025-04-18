import { getStorage, setStorage } from "./chrome-storage-utils";

export const getSavedFilterUrls = async (): Promise<string[]> => {
  try {
    const urls = await getStorage("savedFilterUrls");
    return urls || [];
  } catch (error) {
    console.error("Error getting saved filter URLs:", error);
    return [];
  }
}

export const saveFilterUrl = async (url: string): Promise<void> => {
  try {
    const urls = await getSavedFilterUrls();
    if (!urls.includes(url)) {
      urls.push(url);
      await setStorage("savedFilterUrls", urls);
    }
  } catch (error) {
    console.error("Error saving filter URL:", error);
  }
}

export const removeFilterUrl = async (url: string): Promise<void> => {
  try {
    const urls = await getSavedFilterUrls();
    const filteredUrls = urls.filter((savedUrl) => savedUrl !== url);
    await setStorage("savedFilterUrls", filteredUrls);
  } catch (error) {
    console.error("Error removing filter URL:", error);
  }
}
