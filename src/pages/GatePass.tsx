import { useParams, useLocation, Link } from "react-router-dom";
import React, { useRef } from "react";
// @ts-ignore
import QRCode from "react-qr-code";

const GatePass = () => {
  const { id } = useParams();
  const location = useLocation();
  const visitor = location.state;
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!cardRef.current) return;
    const printContents = cardRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Gate Pass</title>');
      printWindow.document.write('<style>body{margin:0;padding:0;}@media print{body{background:#fff;}}</style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  if (!visitor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 font-bold mb-4">No visitor data found. Please register again.</div>
        <Link to="/register-visitor" className="text-blue-600 underline">Register a visitor</Link>
      </div>
    );
  }

  // Host name logic
  let hostName = '-';
  if (typeof visitor.hostId === 'object' && visitor.hostId !== null) {
    hostName = visitor.hostId.name || '-';
  } else if (typeof visitor.hostId === 'string' && visitor.hostId !== 'N/A' && visitor.hostId !== '') {
    // Try to use hostName or host fallback if present
    hostName = visitor.hostName || visitor.host || '-';
  }
  const inTime = visitor.inTime || (visitor.createdAt ? new Date(visitor.createdAt).toLocaleTimeString() : "N/A");
  const qrValue = `Gate Pass\nName: ${visitor.name}\nMobile: ${visitor.phone}\nPurpose: ${visitor.purpose}\nIn Time: ${inTime}\nHost Name: ${hostName}\nID: ${id}`;

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div ref={cardRef} className="max-w-xs w-full bg-white rounded-2xl shadow-xl flex flex-col items-center py-6 px-4 border border-gray-200">
        <h2 className="text-center font-bold text-lg mb-1">E-Connect Solutions Pvt. Ltd.</h2>
        <div className="text-center text-gray-500 font-semibold mb-2 text-sm">
          Show your E-Visit Pass to Receptions
        </div>
        <hr className="w-full my-2 border-gray-300" />
        <div className="grid grid-cols-2 gap-y-2 w-full text-xs mb-2">
          <div className="font-semibold">In Time</div>
          <div className="font-bold">{inTime}</div>
          <div className="font-semibold">Type</div>
          <div className="font-bold">{visitor.purpose}</div>
          <div className="font-semibold">Mobile No</div>
          <div className="font-bold">{visitor.phone}</div>
          <div className="font-semibold">Name</div>
          <div className="font-bold">{visitor.name}</div>
          <div className="font-semibold">Host Name</div>
          <div className="font-bold">{hostName}</div>
        </div>
        <hr className="w-full my-2 border-gray-300" />
        <div className="text-center font-bold text-sm mb-1">
          This E-Visit Pass<br />valid for 4 hour's.
        </div>
        <div className="text-center text-gray-400 font-semibold mb-2">Thank You</div>
        <div className="w-full border-t border-dashed border-gray-300 my-2"></div>
        <div className="flex flex-col items-center mt-2">
          <div className="bg-gray-100 rounded-xl p-4 mb-2">
            <QRCode value={qrValue} size={80} />
          </div>
          <div className="text-center font-semibold text-sm">E-Visit Pass</div>
        </div>
      </div>
      <div className="flex flex-col items-center mt-6">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition mb-2"
        >
          Print Gate Pass
        </button>
        <Link to="/register-visitor" className="text-blue-600 hover:underline">Register another visitor</Link>
      </div>
    </section>
  );
};

export default GatePass; 