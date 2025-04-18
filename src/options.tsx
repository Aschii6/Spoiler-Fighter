import React from "react";
import { createRoot } from "react-dom/client";

const Options = () => {
    return (
        <div>
        <h1>Options</h1>
        <p>Configure your settings here.</p>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);