import CaseList from "@/components/cases/CaseList";

export default function ActiveCasesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Active Cases</h1>
      <CaseList filter="active" />
    </div>
  );
} 