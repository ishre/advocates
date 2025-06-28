import React from "react";

const STAGES = [
  "Agreement",
  "Arguments",
  "Charge",
  "Evidence",
  "Judgement",
  "Plaintiff Evidence",
  "Remand"
];

type StageDropdownProps = {
  value: string;
  onChange: (val: string) => void;
};

const StageDropdown: React.FC<StageDropdownProps> = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">Stage</label>
    <select
      className="input w-full"
      value={value}
      onChange={e => onChange(e.target.value)}
      required
    >
      <option value="">Select Stage</option>
      {STAGES.map(stage => (
        <option key={stage} value={stage}>{stage}</option>
      ))}
    </select>
  </div>
);

export default StageDropdown; 