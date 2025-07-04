import CaseList from "@/components/cases/CaseList";

export default function ClosedCasesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Closed Cases</h1>
      <CaseList filter="closed" />
    </div>
  );
} 