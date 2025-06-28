"use client";

import NewCaseForm from "@/components/forms/NewCaseForm";

export default function NewCasePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New Case</h1>
      <NewCaseForm onClose={() => {}} onSuccess={() => {}} />
    </div>
  );
} 