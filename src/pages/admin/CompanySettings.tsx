import React, { useState } from 'react';

const timeZones = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata',
  'Asia/Singapore',
];
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CompanySettings() {
  // General Info
  const [companyName, setCompanyName] = useState('Visitify Inc.');
  const [address, setAddress] = useState('123 Main St, Metropolis');
  const [timeZone, setTimeZone] = useState('UTC');

  // Office Hours
  const [workingDays, setWorkingDays] = useState([true, true, true, true, true, false, false]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  // Visitor Settings
  const [selfCheckIn, setSelfCheckIn] = useState(true);
  const [badgePrinting, setBadgePrinting] = useState(false);
  const [ndaFile, setNdaFile] = useState(null);

  // Notification Preferences
  const [notifyHostSMS, setNotifyHostSMS] = useState(true);
  const [notifyHostEmail, setNotifyHostEmail] = useState(true);
  const [notifyVisitor, setNotifyVisitor] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(15);

  const handleNdaChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNdaFile(e.target.files[0].name);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Placeholder: Show a success message or toast
    alert('Settings saved! (static demo)');
  };

  return (
    <form className="min-h-screen bg-[#F9FAFB] font-sans" onSubmit={handleSave}>
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        {/* General Company Info */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#111827]">🏢 General Company Info</h2>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Company Name</label>
            <input
              className="w-full border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Address</label>
            <textarea
              className="w-full border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Time Zone</label>
            <select
              className="w-full border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeZone}
              onChange={e => setTimeZone(e.target.value)}
            >
              {timeZones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </section>

        {/* Office Hours */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#111827]">🕘 Office Hours</h2>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Working Days</label>
            <div className="flex gap-2">
              {weekDays.map((d, i) => (
                <button
                  type="button"
                  key={d}
                  className={`px-3 py-1 rounded ${workingDays[i] ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'} text-sm font-medium focus:outline-none`}
                  onClick={() => setWorkingDays(wd => wd.map((v, j) => j === i ? !v : v))}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#111827] mb-1">Start Time</label>
              <input
                type="time"
                className="w-full border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#111827] mb-1">End Time</label>
              <input
                type="time"
                className="w-full border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Visitor Settings */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#111827]">🛠️ Visitor Settings</h2>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="selfCheckIn" checked={selfCheckIn} onChange={e => setSelfCheckIn(e.target.checked)} className="h-4 w-4 text-blue-500" />
            <label htmlFor="selfCheckIn" className="text-sm text-[#111827]">Enable Visitor Self Check-in</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="badgePrinting" checked={badgePrinting} onChange={e => setBadgePrinting(e.target.checked)} className="h-4 w-4 text-blue-500" />
            <label htmlFor="badgePrinting" className="text-sm text-[#111827]">Enable Badge Printing</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">NDA Upload (PDF)</label>
            <input type="file" accept="application/pdf" onChange={handleNdaChange} className="block" />
            {ndaFile && <span className="text-xs text-green-600 mt-1 block">Uploaded: {ndaFile}</span>}
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#111827]">🔔 Notification Preferences</h2>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notifyHostSMS" checked={notifyHostSMS} onChange={e => setNotifyHostSMS(e.target.checked)} className="h-4 w-4 text-blue-500" />
            <label htmlFor="notifyHostSMS" className="text-sm text-[#111827]">Notify Host on Check-in (SMS)</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notifyHostEmail" checked={notifyHostEmail} onChange={e => setNotifyHostEmail(e.target.checked)} className="h-4 w-4 text-blue-500" />
            <label htmlFor="notifyHostEmail" className="text-sm text-[#111827]">Notify Host on Check-in (Email)</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notifyVisitor" checked={notifyVisitor} onChange={e => setNotifyVisitor(e.target.checked)} className="h-4 w-4 text-blue-500" />
            <label htmlFor="notifyVisitor" className="text-sm text-[#111827]">Notify Visitor on Approval</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Reminder Before Visit (minutes)</label>
            <input
              type="number"
              min={1}
              className="w-32 border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={reminderMinutes}
              onChange={e => setReminderMinutes(Number(e.target.value))}
            />
          </div>
        </section>
      </div>
      {/* Sticky Save Button */}
      <div className="sticky bottom-0 left-0 w-full bg-[#F9FAFB] border-t flex justify-end px-6 py-4 z-10">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
} 