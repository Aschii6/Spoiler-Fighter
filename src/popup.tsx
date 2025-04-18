import React from "react";
import { createRoot } from "react-dom/client";

import SaveToFilterButton from "./components/save-to-filter-button";
import { ToastContainer } from "react-toastify";
import FilterList from "./components/filter-list";

const Popup = () => {
  return (
    <div style={{ width: 500, height: 300 }}>
      <h1>Spoiler Fighter</h1>
      <SaveToFilterButton />

      <FilterList />

      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnHover={false}
        closeOnClick
        draggable
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
