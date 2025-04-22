import React, {useEffect} from "react";
import { createRoot } from "react-dom/client";
import { FormControlLabel, Switch } from "@mui/material";

import "./styles/tailwind.css";
import {loadIsFiltering, saveIsFiltering} from "./utils/storage_utils";

const Popup = () => {
  const [isFiltering, setIsFiltering] = React.useState(false);

  useEffect(() => {
    loadIsFiltering().then(value => {
      setIsFiltering(value);
    });
  }, []);

  const handleSwitchChange = () => {
    const newValue = !isFiltering;
    setIsFiltering(newValue);
    saveIsFiltering(newValue).then();
  };

  return (
    <div className={"bg-amber-100 w-[400px] h-[400px] p-2"}>
      <h1 className={"text-center text-xl text-zinc-800 font-bold"}>
        Spoiler Fighter
      </h1>
      <hr className={"my-2 mx-10"} />
      <div className={"grid grid-cols-2 gap-2"}>
        <div>A</div>
        <div className={"text-center"}>
          <FormControlLabel
            label={"Filter"}
            control={
              <Switch
                checked={isFiltering}
                onChange={handleSwitchChange}
              ></Switch>
            }
          />
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
