import React from "react";
import { createRoot } from "react-dom/client";
import SaveToFilterButton from "./components/save-to-filter-button";
import FilterList from "./components/filter-list";
import { toast, ToastContainer } from "react-toastify";
import { getSavedFilterUrls, saveFilterUrl } from "./utils/storage-utils";

const Popup = () => {
  const [filterUrls, setFilterUrls] = React.useState<string[]>([]);

  const refreshFilterUrls = async () => {
    const urls = await getSavedFilterUrls();
    setFilterUrls(urls);
  };

  React.useEffect(() => {
    refreshFilterUrls().then();
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

  return (
    <div style={{ width: 500, height: 300 }}>
      <h1>Spoiler Fighter</h1>
      <SaveToFilterButton onSave={handleSaveUrl} />
      <FilterList filterUrls={filterUrls} setFilterUrls={setFilterUrls} />
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
