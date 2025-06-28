"use client";

import React, { useState } from "react";

const COURTS = [
  "Supreme Court of India",
  "High Court",
  "District Court",
  "Family Court",
  "Consumer Court",
  "Labour Court",
  "Tribunal",
  "Other"
];

type CourtDropdownProps = {
  value: string;
  onChange: (val: string) => void;
};

const CourtDropdown: React.FC<CourtDropdownProps> = ({ value, onChange }) => {
  const [custom, setCustom] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Name of Court</label>
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
        <option value="">Select Court</option>
        {COURTS.map(court => (
          <option key={court} value={court}>{court}</option>
        ))}
        <option value="custom">Custom...</option>
      </select>
      {isCustom && (
        <input
          className="input mt-2"
          type="text"
          placeholder="Enter custom court name"
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

export default CourtDropdown; 