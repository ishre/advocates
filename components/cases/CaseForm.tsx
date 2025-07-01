"use client";
import React, { useState } from "react";
import CourtDropdown from "./CaseFormFields/CourtDropdown";
import ParticularsDropdown from "./CaseFormFields/ParticularsDropdown";
import StageDropdown from "./CaseFormFields/StageDropdown";
import ClientSelector from "./CaseFormFields/ClientSelector";
import DatePicker from "./CaseFormFields/DatePicker";

type Client = {
  _id: string;
  name: string;
  email: string;
  phone: string;
};

const CaseForm: React.FC = () => {
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);
  const [previousDate, setPreviousDate] = useState<Date | null>(null);
  const [court, setCourt] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [partyName, setPartyName] = useState("");
  const [particulars, setParticulars] = useState("");
  const [year, setYear] = useState("");
  const [stage, setStage] = useState("");
  const [nextDate, setNextDate] = useState<Date | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit logic
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePicker label="Registration Date" value={registrationDate} onChange={setRegistrationDate} />
        <DatePicker label="Previous Date" value={previousDate} onChange={setPreviousDate} />
        <CourtDropdown value={court} onChange={setCourt} />
        <input className="input" type="text" placeholder="Case Number" value={caseNumber} onChange={e => setCaseNumber(e.target.value)} required />
        <input className="input" type="text" placeholder="Name of Party (v/s)" value={partyName} onChange={e => setPartyName(e.target.value)} required />
        <ParticularsDropdown value={particulars} onChange={setParticulars} />
        <input className="input" type="number" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} required />
        <StageDropdown value={stage} onChange={setStage} />
        <DatePicker label="Next Date" value={nextDate} onChange={setNextDate} />
        <ClientSelector value={client} onChange={setClient} />
      </div>
      <button type="submit" className="btn btn-primary mt-4">Create Case</button>
    </form>
  );
};

export default CaseForm; 