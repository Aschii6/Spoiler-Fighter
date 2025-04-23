import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Button, FormControlLabel, Switch, Snackbar, Box } from "@mui/material";

import "./styles/tailwind.css";
import {
  loadFilteredUrls,
  loadIsFiltering,
  saveFilteredUrls,
  saveIsFiltering,
} from "./utils/storage_utils";
import { FilteredUrlList } from "./components/filtered_url_list";
import { getCurrentHostname } from "./utils/utils";

const Popup = () => {
  const [isFiltering, setIsFiltering] = React.useState(false);
  const [filteredUrls, setFilteredUrls] = React.useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  useEffect(() => {
    loadIsFiltering().then((value) => {
      setIsFiltering(value);
    });

    loadFilteredUrls().then((urls) => {
      setFilteredUrls(urls);
    });
  }, []);

  const handleSwitchChange = () => {
    const newValue = !isFiltering;
    setIsFiltering(newValue);
    saveIsFiltering(newValue).then();

    if (newValue) {
      chrome.runtime
        .sendMessage({
          action: "hideSpoilers",
        })
        .then((r) => {
          console.log(r);
        });
    }
  };

  const handleAddUrl = () => {
    getCurrentHostname()
      .then((hostname) => {
        if (!filteredUrls.includes(hostname)) {
          const newFilteredUrls = [...filteredUrls, hostname];
          setFilteredUrls(newFilteredUrls);
          saveFilteredUrls(newFilteredUrls).then(() => {
            openSnackbar(`Added ${hostname} to filtered URLs`);
          });

          chrome.runtime
            .sendMessage({
              action: "hideSpoilers",
            })
            .then((r) => {
              console.log(r);
            });
        } else {
          openSnackbar(`${hostname} is already in filtered URLs`);
        }
      })
      .catch((error) => {
        console.error("Error getting current hostname:", error);
        openSnackbar("Error getting current hostname");
      });
  };

  const handleRemoveUrl = (url: string) => {
    const newFilteredUrls = filteredUrls.filter((item) => item !== url);
    setFilteredUrls(newFilteredUrls);
    saveFilteredUrls(newFilteredUrls).then(() => {
      openSnackbar(`Removed ${url} from filtered URLs`);
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const openSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const snackbar = () => {
    return (
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <Button color="inherit" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      />
    );
  };

  return (
    <div className={"bg-amber-100 w-[450px] h-[400px] p-2 font-serif"}>
      <h1 className={"text-center text-xl text-zinc-800 font-bold"}>
        Spoiler Fighter
      </h1>
      <hr className={"my-2 mx-10"} />
      <div className={"grid grid-cols-2 gap-2"}>
        <div className={"text-center"}>
          <Button
            variant={"outlined"}
            sx={{
              backgroundColor: "#e2b000",
              color: "white",
              "&:hover": {
                backgroundColor: "#d5a500",
              },
              borderRadius: "8px",
            }}
            onClick={handleAddUrl}
          >
            Add URL
          </Button>
          <Box sx={{ height: "10px" }} />
          <FilteredUrlList
            filteredUrls={filteredUrls}
            removeUrl={handleRemoveUrl}
          />
        </div>
        <div className={""}>
          <FormControlLabel
            label={
              <p className={"text-md text-zinc-800 font-serif"}>
                Filter Spoilers
              </p>
            }
            control={
              <Switch
                checked={isFiltering}
                onChange={handleSwitchChange}
              ></Switch>
            }
          />
        </div>
      </div>
      {snackbar()}
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
