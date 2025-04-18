import React from "react";
import { toast } from "react-toastify";
import {saveFilterUrl} from "../utils/storage-utils";

const SaveToFilterButton = () => {
  const handleClick = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      const url = tab.url;

      if (!url) {
        toast.error("No URL found!");

        console.error("No URL found!");
        return;
      }

      const parsedUrl = new URL(url);
      const filterUrl = parsedUrl.hostname;

      await saveFilterUrl(filterUrl);

      toast.success(`URL ${filterUrl} saved to filter list!`);
      console.log(`URL ${filterUrl} saved to filter list!`);
    } catch (error) {
      toast.error("Error saving URL to filter list!");
      console.error("Error saving URL to filter list:", error);
    }
  };

  return (
    <button onClick={handleClick} className="save-to-filter-button">
      Save to Filter
    </button>
  );
};

export default SaveToFilterButton;
