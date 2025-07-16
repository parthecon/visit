import React, { useState } from 'react';
import { User, Building2, CreditCard, Bell, CheckCircle } from 'lucide-react';
// If you haven't installed react-hot-toast, run: npm install react-hot-toast
import toast, { Toaster } from 'react-hot-toast';

const plans = [
  { name: 'Starter (Free)', value: 'starter', features: ['Basic check-in', '1 location', 'Email alerts'], limits: 'Up to 100 visitors/mo' },
  { name: 'Basic', value: 'basic', features: ['All Starter features', 'SMS alerts', '3 locations'], limits: 'Up to 500 visitors/mo' },
  { name: 'Professional', value: 'professional', features: ['All Basic features', 'Badge printing', '10 locations'], limits: 'Up to 2000 visitors/mo' },
  { name: 'Enterprise', value: 'enterprise', features: ['All Professional features', 'Custom integrations', 'Unlimited'], limits: 'Contact sales' },
];
const designations = ['Founder', 'HR Head', 'Admin', 'Manager', 'Other'];
const countries = ['USA', 'UK', 'India', 'Singapore', 'Other'];
const timeZones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Singapore'];

const steps = [
  { label: 'Admin Details', icon: <User className="w-5 h-5 mr-2 text-blue-500" /> },
  { label: 'Company Details', icon: <Building2 className="w-5 h-5 mr-2 text-blue-500" /> },
  { label: 'Plan Selection', icon: <CreditCard className="w-5 h-5 mr-2 text-blue-500" /> },
  { label: 'Notification Preferences', icon: <Bell className="w-5 h-5 mr-2 text-blue-500" /> },
  { label: 'Summary', icon: <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> },
];

export default function Signup() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Admin
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('Founder');

  // Step 2: Company
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  // Address fields (split for backend)
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateAddr, setStateAddr] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [officeStart, setOfficeStart] = useState('09:00');
  const [officeEnd, setOfficeEnd] = useState('18:00');

  // Step 3: Plan
  const [plan, setPlan] = useState('starter');

  // Step 4: Notification
  const [notifySMS, setNotifySMS] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);

  // Validation
  const validateStep = async () => {
    setError('');
    if (step === 0) {
      if (!fullName || !email || !phone || !password) {
        setError('Please fill all admin details.');
        return false;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setError('Enter a valid email.');
        return false;
      }
      if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
        setError('Enter a valid phone number.');
        return false;
      }
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) {
        setError('Password must be 8+ chars, include uppercase, number, special char.');
        return false;
      }
      // Check email uniqueness (simulate API call)
      // In real app: await fetch('/api/v1/auth/check-email?email=...')
    }
    if (step === 1) {
      if (!companyName || !street || !city || !stateAddr || !zipCode || !country || !timeZone) {
        setError('Please fill all company details, including address.');
        return false;
      }
      // Check company name uniqueness (simulate API call)
    }
    return true;
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCompanyLogo(e.target.files[0].name);
      setCompanyLogoFile(e.target.files[0]);
    }
  };

  const handleNext = async () => {
    if (!(await validateStep())) return;
    setStep(s => Math.min(s + 1, steps.length - 1));
  };
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Prepare JSON payload
    const payload = {
      name: fullName,
      email,
      phone,
      password,
      designation,
      companyName,
      companyEmail: email, // Use a separate company email if available
      companyPhone: phone, // Use a separate company phone if available
      address: {
        street,
        city,
        state: stateAddr,
        country,
        zipCode,
      },
    };
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        localStorage.setItem('token', data.data.token);
        toast.success('Signup successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1200);
      } else {
        setError(data.message || 'Signup failed.');
        toast.error(data.message || 'Signup failed.');
      }
    } catch (err) {
      setError('Network error.');
      toast.error('Network error.');
    } finally {
      setLoading(false);
    }
  };

  // Summary step
  const summary = (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-500" />Summary</h2>
      <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
        <div><span className="font-medium">Admin:</span> {fullName} ({email}, {phone}, {designation})</div>
        <div><span className="font-medium">Company:</span> {companyName} ({country}, {timeZone})</div>
        <div><span className="font-medium">Address:</span> {street}, {city}, {stateAddr}, {zipCode}</div>
        <div><span className="font-medium">Plan:</span> {plans.find(p => p.value === plan)?.name}</div>
        <div><span className="font-medium">Notifications:</span> {notifySMS && 'SMS '} {notifyEmail && 'Email '} {notifyWhatsApp && 'WhatsApp'}</div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] font-sans">
      <Toaster position="top-center" />
      <form className="w-full max-w-lg bg-white rounded-xl shadow-md p-6 space-y-6" onSubmit={step === steps.length - 1 ? handleSubmit : e => { e.preventDefault(); handleNext(); }}>
        {/* Progress Bar */}
        <div className="flex items-center mb-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
              {i < steps.length - 1 && <div className="w-4 text-center text-xs text-gray-400">{''}</div>}
            </React.Fragment>
          ))}
            </div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          {steps.map((s, i) => (
            <span key={s.label} className={i === step ? 'text-blue-600 font-semibold' : ''}>{s.icon}{s.label}</span>
          ))}
          {step === steps.length - 1 && <span className="text-green-600 font-semibold flex items-center"><CheckCircle className="w-4 h-4 mr-1" />Summary</span>}
        </div>
        {/* Step Content */}
        {step === 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">{steps[0].icon}Admin User Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input className="w-full border rounded px-3 py-2" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input className="w-full border rounded px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <span className="text-xs text-gray-400">Min 8 chars, 1 uppercase, 1 number, 1 special char</span>
              </div>
            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <select className="w-full border rounded px-3 py-2" value={designation} onChange={e => setDesignation(e.target.value)}>
                {designations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              </div>
          </section>
        )}
        {step === 1 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">{steps[1].icon}Company Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input className="w-full border rounded px-3 py-2" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Logo (optional)</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} disabled />
              {companyLogo && <span className="text-xs text-green-600 mt-1 block">Uploaded: {companyLogo}</span>}
              </div>
            {/* Address fields */}
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input className="w-full border rounded px-3 py-2" value={street} onChange={e => setStreet(e.target.value)} required />
                </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">City</label>
                <input className="w-full border rounded px-3 py-2" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">State</label>
                <input className="w-full border rounded px-3 py-2" value={stateAddr} onChange={e => setStateAddr(e.target.value)} required />
              </div>
                </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Zip Code</label>
                <input className="w-full border rounded px-3 py-2" value={zipCode} onChange={e => setZipCode(e.target.value)} required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Country</label>
                <select className="w-full border rounded px-3 py-2" value={country} onChange={e => setCountry(e.target.value)}>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Time Zone</label>
                <select className="w-full border rounded px-3 py-2" value={timeZone} onChange={e => setTimeZone(e.target.value)}>
                  {timeZones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Office Start Time</label>
                <input className="w-full border rounded px-3 py-2" type="time" value={officeStart} onChange={e => setOfficeStart(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Office End Time</label>
                <input className="w-full border rounded px-3 py-2" type="time" value={officeEnd} onChange={e => setOfficeEnd(e.target.value)} />
              </div>
            </div>
          </section>
        )}
        {step === 2 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">{steps[2].icon}Plan Selection</h2>
            <div className="space-y-2">
              {plans.map(p => (
                <label key={p.value} className={`block border rounded-xl p-4 cursor-pointer transition ${plan === p.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                  <input type="radio" className="mr-2" checked={plan === p.value} onChange={() => setPlan(p.value)} />
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{p.limits}</span>
                  <ul className="ml-6 mt-1 text-xs text-gray-500 list-disc">
                    {p.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  {p.value === 'enterprise' && <a href="#" className="text-blue-600 underline text-xs ml-2">Contact sales</a>}
                </label>
              ))}
            </div>
          </section>
        )}
        {step === 3 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">{steps[3].icon}Notification Preferences <span className="text-xs text-gray-400">(Optional)</span></h2>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notifySMS" checked={notifySMS} onChange={e => setNotifySMS(e.target.checked)} className="h-4 w-4 text-blue-500" />
              <label htmlFor="notifySMS" className="text-sm text-gray-700">SMS Alerts</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notifyEmail" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)} className="h-4 w-4 text-blue-500" />
              <label htmlFor="notifyEmail" className="text-sm text-gray-700">Email Alerts</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notifyWhatsApp" checked={notifyWhatsApp} onChange={e => setNotifyWhatsApp(e.target.checked)} className="h-4 w-4 text-blue-500" />
              <label htmlFor="notifyWhatsApp" className="text-sm text-gray-700">WhatsApp Alerts</label>
            </div>
          </section>
        )}
        {step === 4 && summary}
        {/* Error/Success/Loading */}
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {loading && <div className="text-blue-600 text-sm text-center">Registering...</div>}
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-2">
          {step > 0 ? (
            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700" onClick={handleBack}>Back</button>
          ) : <span />}
          {step < steps.length ? (
            <button
              type={step === steps.length - 1 ? 'submit' : 'button'}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition"
              onClick={step === steps.length - 1 ? undefined : handleNext}
              disabled={loading}
            >
              {step === steps.length - 1 ? 'Register' : 'Next'}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}