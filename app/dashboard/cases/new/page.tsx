"use client";

import { useRouter } from "next/navigation";
import NewCaseForm from "@/components/forms/NewCaseForm";

export default function NewCasePage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/dashboard/cases');
  };

  const handleSuccess = () => {
    router.push('/dashboard/cases');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New Case</h1>
      <NewCaseForm onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
} 