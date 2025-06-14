import React from "react";
import { Button, List, ListItem } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";

export const TitleList = ({
  titles,
  removeTitle,
}: {
  titles: string[];
  removeTitle: (title: string) => void;
}) => {
  return (
    <div className={"w-full flex flex-col items-center"}>
      <div className={"w-[90%]"}>
        <h1 className={"text-center text-lg text-zinc-800 font-semibold"}>
          Specific Titles to be Filtered
        </h1>
        <List
          id = {"title-list"}
          className={"font-serif border-2 rounded-lg border-gray-500 bg-amber-200"}
          sx={{
            maxHeight: "150px",
            overflowY: "auto",
          }}
        >
          {titles.length === 0 ? (
            <p className={"text-center text-sm text-zinc-800 font-serif"}>
              No titles to be filtered
            </p>
          ) : (
            titles.map((title, index) => (
              <ListItem
                key={index}
                id = {`title-${index}`}
                className={"text-sm font-serif text-zinc-800"}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 12px",
                }}
              >
                {title}
                <Button
                  variant="text"
                  onClick={() => removeTitle(title)}
                  sx={{minWidth: 0, padding: 0}}
                >
                  <RemoveIcon color="error"/>
                </Button>
              </ListItem>
            ))
          )}
        </List>
      </div>
    </div>
  );
};