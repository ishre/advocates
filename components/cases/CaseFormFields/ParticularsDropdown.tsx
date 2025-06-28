"use client";

import React, { useState } from "react";

const PARTICULARS = [
  "Bail Application",
  "Rent Application",
  "Civil Misc Appeal",
  "Criminal Revision",
  "Civil Suit",
  "Criminal Complaint",
  "Execution Application",
  "Injunction Application",
  "Probate Application",
  "Succession Certificate",
  "Divorce Petition",
  "Maintenance Application",
  "Anticipatory Bail",
  "Regular Bail",
  "Appeal",
  "Writ Petition",
  "Other"
];

type ParticularsDropdownProps = {
  value: string;
  onChange: (val: string) => void;
};

const ParticularsDropdown: React.FC<ParticularsDropdownProps> = ({ value, onChange }) => {
  const [custom, setCustom] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Particulars</label>
      <select
        className="input w-full"
        value={isCustom ? "custom" : value}
        onChange={e => {
          if (e.target.value === "custom") {
            setIsCustom(true);
            onChange(custom);
          } else {
            setIsCustom(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">Select Particulars</option>
        {PARTICULARS.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
        <option value="custom">Custom...</option>
      </select>
      {isCustom && (
        <input
          className="input mt-2"
          type="text"
          placeholder="Enter custom particulars"
          value={custom}
          onChange={e => {
            setCustom(e.target.value);
            onChange(e.target.value);
          }}
        />
      )}
    </div>
  );
};

export default ParticularsDropdown; 