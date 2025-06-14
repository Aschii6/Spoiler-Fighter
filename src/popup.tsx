import React, {useEffect} from "react";
import {createRoot} from "react-dom/client";
import {Button, FormControlLabel, Switch, Snackbar, Box, Select, SelectChangeEvent, MenuItem} from "@mui/material";

import "./styles/tailwind.css";
import {
  loadFilteredTitles,
  loadFilteredUrls,
  loadIsFiltering, saveFilteredTitles,
  saveFilteredUrls,
  saveIsFiltering,
} from "./utils/storage_utils";
import {FilteredUrlList} from "./components/filtered_url_list";
import {getCurrentHostname} from "./utils/utils";
import {TitleList} from "./components/title_list";

const Popup = () => {
  const [isFiltering, setIsFiltering] = React.useState(false);
  const [filteredUrls, setFilteredUrls] = React.useState<string[]>([]);

  const [filteredTitlesOptions, setFilteredTitlesOptions] = React.useState<string[]>([]);
  const [filteredTitles, setFilteredTitles] = React.useState<string[]>([]);

  const [selectedTitle, setSelectedTitle] = React.useState<string>("");

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  useEffect(() => {
    loadIsFiltering().then((value) => {
      setIsFiltering(value);
    });

    loadFilteredUrls().then((urls) => {
      setFilteredUrls(urls);
    });

    filteredTitlesOptions.push(
      "The Dark Knight",
      "The Lord of the Rings",
      "The Shawshank Redemption",
      "Fight Club",
      "The Godfather"
    );

    loadFilteredTitles().then((titles) => {
      setFilteredTitles(titles);
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
        if (hostname.length === 0) {
          return;
        }

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

  const handleSelect = (event: SelectChangeEvent) => {
    const selectedTitle = event.target.value as string;
    setSelectedTitle(selectedTitle);
  }

  const handleAddTitle = () => {
    if (!selectedTitle || selectedTitle.trim() === "") {
      openSnackbar("Please select a title to filter");
      return;
    }

    if (!filteredTitles.includes(selectedTitle)) {
      const newFilteredTitles = [...filteredTitles, selectedTitle];
      setFilteredTitles(newFilteredTitles);
      saveFilteredTitles(newFilteredTitles).then(() => {
        openSnackbar(`Added ${selectedTitle} to filtered titles`);
      });
    } else {
      openSnackbar(`${selectedTitle} is already in filtered titles`);
    }
  };

  const handleRemoveTitle = (title: string) => {
    const newFilteredTitles = filteredTitles.filter((item) => item !== title);
    setFilteredTitles(newFilteredTitles);
    saveFilteredTitles(newFilteredTitles).then(() => {
      openSnackbar(`Removed ${title} from filtered titles`);
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
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
        sx={{
          minWidth: "300px",
        }}
      />
    );
  };

  return (
    <div className={"bg-amber-100 w-[600px] h-[430px] p-2 font-serif"}>
      <h1 className={"text-center text-xl text-zinc-800 font-bold"}>
        Spoiler Fighter
      </h1>
      <hr className={"my-2 mx-10"}/>
      <div className={"grid grid-cols-2"}>
        <div className={"text-center"}>
          <Button
            variant={"outlined"}
            sx={{
              backgroundColor: "#e2b000",
              color: "white",
              "&:hover": {
                backgroundColor: "#d5a500",
              },
              borderWidth: "2px",
              borderColor: "#444",
              borderRadius: "8px",
            }}
            onClick={handleAddUrl}
          >
            Add URL
          </Button>
          <Box sx={{height: "16px"}}/>
          <FilteredUrlList
            filteredUrls={filteredUrls}
            removeUrl={handleRemoveUrl}
          />
        </div>
        <div className={"text-center"}>
          <Button
            variant={"outlined"}
            sx={{
              backgroundColor: "#e2b000",
              color: "white",
              "&:hover": {
                backgroundColor: "#d5a500",
              },
              borderWidth: "2px",
              borderColor: "#444",
              borderRadius: "8px",
            }}
            onClick={handleAddTitle}
          >
            Add Title
          </Button>
          <Box sx={{height: "8px"}}/>
          <Select id={"title-select"} variant={"outlined"} value={selectedTitle} onChange={handleSelect} displayEmpty={true} sx={{
            height: "40px", minWidth: "100px"
          }}>
            <MenuItem value="">
              <em>Select a title</em>
            </MenuItem>
            {filteredTitlesOptions.map((title, index) => (
              <MenuItem key={index} value={title}>
                {title}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{height: "8px"}}/>
          <TitleList titles={filteredTitles} removeTitle={handleRemoveTitle}/>
          <hr className={"my-2 mx-10"}/>
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
    <Popup/>
  </React.StrictMode>,
);
