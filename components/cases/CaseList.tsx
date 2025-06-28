import React from "react";

type CaseListProps = {
  filter: "all" | "active" | "closed";
};

const CaseList: React.FC<CaseListProps> = ({ filter }) => {
  return (
    <div className="border rounded p-4 bg-white">
      <p>Case list placeholder. Filter: <b>{filter}</b></p>
      {/* TODO: Render table/list of cases here */}
    </div>
  );
};

export default CaseList; 