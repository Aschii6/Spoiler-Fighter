import React from "react";
import { createRoot } from "react-dom/client";
import SaveToFilterButton from "./components/save-to-filter-button";
import FilterList from "./components/filter-list";
import { toast, ToastContainer } from "react-toastify";
import {
  getFilteringEnabled,
  getSavedFilterUrls,
  saveFilterUrl,
  setFilteringEnabled,
} from "./utils/storage-utils";

const Popup = () => {
  const [filterUrls, setFilterUrls] = React.useState<string[]>([]);
  const [filteringEnabledState, setFilteringEnabledState] =
    React.useState<boolean>(false);

  const refreshFilterUrls = async () => {
    const urls = await getSavedFilterUrls();
    setFilterUrls(urls);
  };

  const refreshFilteringEnabled = async () => {
    const enabled = await getFilteringEnabled();
    setFilteringEnabledState(enabled);
  };

  React.useEffect(() => {
    refreshFilterUrls().then();
    refreshFilteringEnabled().then();
  }, []);

  const handleSaveUrl = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    const url = tab.url;

    if (!url) {
      toast.error("No URL found!");
      return;
    }

    const parsedUrl = new URL(url);
    const filterUrl = parsedUrl.hostname;

    await saveFilterUrl(filterUrl);
    toast.success(`URL ${filterUrl} saved to filter list!`);
    await refreshFilterUrls();
  };

  const handleToggleFiltering = async () => {
    const newState = !filteringEnabledState;
    await setFilteringEnabled(newState);
    setFilteringEnabledState(newState);
    toast.success(`Filtering turned ${newState ? "on" : "off"}`);

    if (newState) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab.id !== undefined) {
        await chrome.tabs.sendMessage(tab.id, { action: "enableFiltering" });
      }
    }
  };

  return (
    <div style={{ width: "500px", height: "300", display: "flex" }}>
      <div style={{ flex: 1, padding: "1rem" }}>
        <h1>Spoiler Fighter</h1>
        <SaveToFilterButton onSave={handleSaveUrl} />
        <FilterList filterUrls={filterUrls} setFilterUrls={setFilterUrls} />
      </div>

      <div
        style={{
          width: "40%",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <button onClick={handleToggleFiltering}>
          {filteringEnabledState ? "Disable Filtering" : "Enable Filtering"}
        </button>
      </div>
      <ToastContainer
        position="top-left"
        autoClose={3000}
        pauseOnHover={false}
      />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
