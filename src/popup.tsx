import React from "react";
import { createRoot } from "react-dom/client";

import "./styles/tailwind.css";

const Popup = () => {
    return (
        <div className={"w-[400px] h-[400px] "}>
        <h1>Welcome to the Popup!</h1>
        <p>This is a simple popup example.</p>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);