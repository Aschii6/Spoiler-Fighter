import { getStorage, setStorage } from "./chrome_storage_utils";

export const loadIsFiltering = async (): Promise<boolean> => {
  try {
    const isFiltering = await getStorage("isFiltering");
    return isFiltering !== undefined ? isFiltering : false;
  } catch (error) {
    console.error("Error getting isFiltering from storage:", error);
    return false;
  }
};

export const saveIsFiltering = async (isFiltering: boolean): Promise<void> => {
  try {
    await setStorage("isFiltering", isFiltering);
  } catch (error) {
    console.error("Error setting isFiltering in storage:", error);
  }
};

export const loadFilteredUrls = async (): Promise<string[]> => {
  try {
    const filteredUrls = await getStorage("filteredUrls");
    return filteredUrls !== undefined ? filteredUrls : [];
  } catch (error) {
    console.error("Error getting filteredUrls from storage:", error);
    return [];
  }
};

export const saveFilteredUrls = async (
  filteredUrls: string[],
): Promise<void> => {
  try {
    await setStorage("filteredUrls", filteredUrls);
  } catch (error) {
    console.error("Error setting filteredUrls in storage:", error);
  }
};

export const saveFilteredTitles = async (
  filteredTitles: string[],
): Promise<void> => {
  try {
    await setStorage("filteredTitles", filteredTitles);
  } catch (error) {
    console.error("Error setting filteredTitles in storage:", error);
  }
}

export const loadFilteredTitles = async (): Promise<string[]> => {
  try {
    const filteredTitles = await getStorage("filteredTitles");
    return filteredTitles !== undefined ? filteredTitles : [];
  } catch (error) {
    console.error("Error getting filteredTitles from storage:", error);
    return [];
  }
};
