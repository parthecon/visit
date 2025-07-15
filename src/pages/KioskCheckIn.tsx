import CheckInForm from "@/components/visitor/CheckInForm";
import { useState } from "react";

export default function KioskCheckIn() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Visitor Check-In</h2>
        {successMsg ? (
          <div className="text-green-600 text-center text-lg font-semibold py-8">{successMsg}</div>
        ) : (
          <CheckInForm onSuccess={setSuccessMsg} />
        )}
      </div>
    </div>
  );
} 