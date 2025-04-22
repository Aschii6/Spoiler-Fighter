import React from "react";
import { Button, List, ListItem } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";

export const FilteredUrlList = ({
  filteredUrls,
  removeUrl,
}: {
  filteredUrls: string[];
  removeUrl: (url: string) => void;
}) => {
  return (
    <div>
      <h1 className={"text-center text-lg text-zinc-800 font-semibold"}>
        Filtered URLs
      </h1>
      <hr className={"my-1 mx-6"} />
      <List
        className={"p-2 font-serif"}
        sx={{
          maxHeight: "250px",
          overflowY: "auto",
        }}
      >
        {filteredUrls.length === 0 ? (
          <p className={"text-center text-sm text-zinc-800 font-serif"}>
            No filtered URLs
          </p>
        ) : (
          filteredUrls.map((url, index) => (
            <ListItem
              key={index}
              className={"text-sm font-serif text-zinc-800"}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {url}
              <Button
                variant="text"
                onClick={() => removeUrl(url)}
                sx={{ minWidth: 0, padding: 0 }}
              >
                <RemoveIcon color="error" />
              </Button>
            </ListItem>
          ))
        )}
      </List>
    </div>
  );
};
