import React from "react";

const SaveToFilterButton = ({ onSave }: { onSave: () => void }) => {
  return (
    <button onClick={onSave} className="save-to-filter-button">
      Save to Filter
    </button>
  );
};

export default SaveToFilterButton;
