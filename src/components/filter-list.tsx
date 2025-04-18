import React from "react";
import { toast } from "react-toastify";
import { removeFilterUrl } from "../utils/storage-utils";

const FilterList = ({
  filterUrls,
  setFilterUrls,
}: {
  filterUrls: string[];
  setFilterUrls: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const handleRemoveUrl = async (url: string) => {
    try {
      await removeFilterUrl(url);
      setFilterUrls((prevUrls) => prevUrls.filter((item) => item !== url));
      toast.success(`URL ${url} removed from filter list!`);
    } catch (error) {
      toast.error("Error removing URL from filter list!");
      console.error("Error removing URL from filter list:", error);
    }
  };

  return (
    <div>
      <h2>Saved Filter URLs</h2>
      <ul>
        {filterUrls.map((url) => (
          <li key={url}>
            {url}
            <button onClick={() => handleRemoveUrl(url)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilterList;
