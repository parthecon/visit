import { useNavigate } from "react-router-dom";

export default function KioskIndex() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Welcome to Visitify Kiosk</h1>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <button
          className="w-full py-6 text-xl rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => navigate("/kiosk/checkin")}
        >
          Visitor Check-In
        </button>
        <button
          className="w-full py-6 text-xl rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
          onClick={() => navigate("/kiosk/checkout")}
        >
          Visitor Check-Out
        </button>
      </div>
    </div>
  );
}
