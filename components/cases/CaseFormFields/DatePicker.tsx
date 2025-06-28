import React from "react";

type DatePickerProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
};

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        className="input w-full"
        type="date"
        value={value ? value.toISOString().substring(0, 10) : ""}
        onChange={e => {
          const val = e.target.value;
          onChange(val ? new Date(val) : null);
        }}
      />
    </div>
  );
};

export default DatePicker; 