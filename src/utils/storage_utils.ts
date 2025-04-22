import {getStorage, setStorage} from "./chrome_storage_utils";

export const loadIsFiltering = async (): Promise<boolean> => {
  try {
    const isFiltering = await getStorage("isFiltering");
    return isFiltering !== undefined ? isFiltering : false;
  } catch (error) {
    console.error("Error getting isFiltering from storage:", error);
    return false;
  }
}

export const saveIsFiltering = async (isFiltering: boolean): Promise<void> => {
  try {
    await setStorage("isFiltering", isFiltering);
  } catch (error) {
    console.error("Error setting isFiltering in storage:", error);
  }
}