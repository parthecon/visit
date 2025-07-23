import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

const timeZones = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata',
  'Asia/Singapore',
];
const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Other'];
const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
// Add websiteRegex definition
const websiteRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Add TypeScript interfaces for Company and CompanySettings
interface CompanySettings {
  timezone: string;
  workingHours: Record<string, { start: string; end: string; isWorkingDay: boolean }>;
  kioskMode: boolean;
  requireNDA: boolean;
  requireID: boolean;
  requirePhoto: boolean;
  requireSignature: boolean;
  autoApproval: boolean;
  printBadge: boolean;
}
interface Company {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  website?: string;
  industry?: string;
  size?: string;
  settings: CompanySettings;
  subscription?: any;
}

export default function CompanySettings() {
  const { user } = useAuth();
  const companyId = user?.company?._id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); 
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [company, setCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalCompany, setOriginalCompany] = useState<Company | null>(null);

  // Inline success message state
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);

  // Debug logs
  console.log('CompanySettings:', { companyId, loading, error, company });
  console.log('Auth user:', user);
  console.log('companyId:', companyId);

  // Fetch company info
  useEffect(() => {
    async function fetchCompany() {
      if (!companyId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/company/${companyId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        console.log('Fetch response:', res.status, data);
        if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to fetch company info');
        setCompany(data.data);
        setOriginalCompany(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch company info');
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [companyId]);

  // Handle input changes for top-level fields
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      checked = e.target.checked;
    }
    setCompany((prev) => prev ? ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }) : prev);
    setFieldErrors((prev: any) => ({ ...prev, [name]: undefined }));
  }

  // Handle address field changes
  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCompany((prev) => prev ? ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }) : prev);
    setFieldErrors((prev: any) => ({ ...prev, [name]: undefined }));
  }

  // Handle settings.workingHours changes
  function handleWorkingHoursChange(day: string, field: 'start' | 'end', value: string) {
    setCompany((prev: any) => ({
      ...prev,
      settings: {
        ...prev.settings,
        workingHours: {
          ...prev.settings.workingHours,
          [day]: {
            ...prev.settings.workingHours[day],
            [field]: value,
          },
        },
      },
    }));
  }
  function handleWorkingDayToggle(day: string) {
    setCompany((prev: any) => ({
      ...prev,
      settings: {
        ...prev.settings,
        workingHours: {
          ...prev.settings.workingHours,
          [day]: {
            ...prev.settings.workingHours[day],
            isWorkingDay: !prev.settings.workingHours[day].isWorkingDay,
          },
        },
      },
    }));
  }

  // Handle settings booleans
  function handleSettingsBoolChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setCompany((prev: any) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: checked,
      },
    }));
  }

  // Save company info
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isEditing || !companyId || !company) return;
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      // Improved frontend validation
      const errors: any = {};
      if (!company.name) errors.name = 'Company name is required.';
      if (!company.email) errors.email = 'Email is required.';
      else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(company.email)) errors.email = 'Invalid email format.';
      if (!company.phone) errors.phone = 'Phone is required.';
      if (!company.address) {
        errors.address = 'Address is required.';
      } else {
        if (!company.address.street) errors.street = 'Street is required.';
        if (!company.address.city) errors.city = 'City is required.';
        if (!company.address.state) errors.state = 'State is required.';
        if (!company.address.country) errors.country = 'Country is required.';
        if (!company.address.zipCode) errors.zipCode = 'Zip code is required.';
      }
      if (company.website && !websiteRegex.test(company.website)) {
        errors.website = 'Website must be a valid URL (start with http:// or https://)';
      }
      if (!company.settings || !company.settings.timezone) {
        errors.timezone = 'Timezone is required.';
      }
      if (!company.settings || !company.settings.workingHours) {
        errors.workingHours = 'Working hours are required.';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setSaving(false);
        // Focus first error field
        const firstError = Object.keys(errors)[0];
        const el = document.querySelector(`[name="${firstError}"]`);
        if (el) (el as HTMLElement).focus();
        toast.error('Please correct the highlighted fields.');
        return;
      }
      // Always send full address and settings objects
      let body: any = {
        ...company,
        address: { ...company.address },
        settings: { ...company.settings, workingHours: { ...company.settings.workingHours } },
      };
      const res = await fetch(`/api/v1/company/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setError(data.message || 'Failed to update company');
        toast.error(data.message || 'Failed to update company');
        return;
      }
      setCompany(data.data);
      setOriginalCompany(data.data);
      setIsEditing(false);
      setTimeout(() => setInlineSuccess('Company settings updated!'), 0);
      toast.success('Company settings updated!');
    } catch (err: any) {
      setError('Unexpected error: ' + (err?.message || err));
      setSaving(false);
      toast.error('Unexpected error: ' + (err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  // On Cancel, revert to last saved data and exit edit mode
  function handleCancel() {
    setCompany(originalCompany);
    setFieldErrors({});
    setError(null);
    setIsEditing(false);
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto py-8 animate-pulse space-y-8" aria-busy="true" aria-live="polite">
      <div className="h-32 bg-gray-200 rounded-lg" />
      <div className="h-32 bg-gray-200 rounded-lg" />
      <div className="h-32 bg-gray-200 rounded-lg" />
    </div>;
  }

  if (error) {
    return <div className="max-w-2xl mx-auto py-8 text-red-600" role="alert">{error}</div>;
  }

  if (!company) {
    return <div className="max-w-2xl mx-auto py-8 text-gray-600" role="status">No company data found.</div>;
  }

  return (
    <form className="min-h-screen bg-[#F9FAFB] font-sans" onSubmit={handleSave} aria-label="Company Settings Form">
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        {inlineSuccess && (
          <div className="max-w-2xl mx-auto mb-4 p-3 bg-green-100 text-green-800 rounded shadow text-center" role="status">
            {inlineSuccess}
          </div>
        )}
        {/* General Company Info */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#111827] flex items-center gap-2">🏢 Company Profile</h2>
            {!isEditing && <button type="button" className="text-blue-600 underline text-sm" onClick={() => setIsEditing(true)} aria-label="Edit Company Info">Edit</button>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Company Name</label>
            {isEditing ? (
              <input
                className={`w-full border ${fieldErrors.name ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                name="name"
                value={company?.name || ''}
                onChange={handleChange}
                required
                aria-label="Company Name"
              />
            ) : (
              <div className="px-2 py-2 bg-gray-50 rounded border border-gray-100">{company?.name || '-'}</div>
            )}
            {fieldErrors.name && <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">Email</label>
              {isEditing ? (
                <input
                  className={`w-full border ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  name="email"
                  type="email"
                  value={company?.email || ''}
                  onChange={handleChange}
                  required
                  aria-label="Company Email"
                />
              ) : (
                <div className="px-2 py-2 bg-gray-50 rounded border border-gray-100">{company?.email || '-'}</div>
              )}
              {fieldErrors.email && <div className="text-xs text-red-600 mt-1">{fieldErrors.email}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">Phone</label>
              {isEditing ? (
                <input
                  className={`w-full border ${fieldErrors.phone ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  name="phone"
                  type="tel"
                  value={company?.phone || ''}
                  onChange={handleChange}
                  required
                  aria-label="Company Phone"
                />
              ) : (
                <div className="px-2 py-2 bg-gray-50 rounded border border-gray-100">{company?.phone || '-'}</div>
              )}
              {fieldErrors.phone && <div className="text-xs text-red-600 mt-1">{fieldErrors.phone}</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">Industry</label>
              {isEditing ? (
                <select
                  className="w-full border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="industry"
                  value={company?.industry || ''}
                  onChange={handleChange}
                  aria-label="Company Industry"
                >
                  <option value="">Select Industry</option>
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              ) : (
                <div className="px-2 py-2 bg-gray-50 rounded border border-gray-100">{company?.industry || '-'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1">Company Size</label>
              {isEditing ? (
                <select
                  className="w-full border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="size"
                  value={company?.size || ''}
                  onChange={handleChange}
                  aria-label="Company Size"
                >
                  <option value="">Select Size</option>
                  {sizes.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                </select>
              ) : (
                <div className="px-2 py-2 bg-gray-50 rounded border border-gray-100">{company?.size || '-'}</div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Website</label>
            {isEditing ? (
              <input
                className={`w-full border ${fieldErrors.website ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                name="website"
                type="url"
                value={company?.website || ''}
                onChange={handleChange}
                disabled={!isEditing}
                aria-label="Company Website"
              />
            ) : (
              <div className="px-2 py-2 bg-gray-50 rounded border border-gray-100">{company?.website || '-'}</div>
            )}
            {fieldErrors.website && <div className="text-xs text-red-600 mt-1">{fieldErrors.website}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Address</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEditing ? (
                <input
                  className={`w-full border ${fieldErrors.street ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  name="street"
                  placeholder="Street"
                  value={company?.address?.street || ''}
                  onChange={handleAddressChange}
                  required
                  aria-label="Company Street Address"
                />
              ) : (
                <div className="px-2 py-2 bg-gray-50 rounded border border-gray-100">{company?.address?.street || '-'}</div>
              )}
              <input
                className={`w-full border ${fieldErrors.city ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                name="city"
                placeholder="City"
                value={company?.address?.city || ''}
                onChange={handleAddressChange}
                required
                aria-label="Company City"
              />
              <input
                className={`w-full border ${fieldErrors.state ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                name="state"
                placeholder="State"
                value={company?.address?.state || ''}
                onChange={handleAddressChange}
                required
                aria-label="Company State"
              />
              <input
                className={`w-full border ${fieldErrors.country ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                name="country"
                placeholder="Country"
                value={company?.address?.country || ''}
                onChange={handleAddressChange}
                required
                aria-label="Company Country"
              />
              <input
                className={`w-full border ${fieldErrors.zipCode ? 'border-red-500' : 'border-gray-200'} rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                name="zipCode"
                placeholder="Zip Code"
                value={company?.address?.zipCode || ''}
                onChange={handleAddressChange}
                required
                aria-label="Company Zip Code"
              />
            </div>
            {fieldErrors.address && <div className="text-xs text-red-600 mt-1">{fieldErrors.address}</div>}
          </div>
        </section>

        {/* Office Hours & Timezone */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#111827]">🕘 Office Hours & Timezone</h2>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Time Zone</label>
            {isEditing ? (
              <select
                className="w-full border border-gray-200 rounded px-3 py-2 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="timezone"
                value={company?.settings?.timezone || ''}
                onChange={e => setCompany((prev: any) => ({ ...prev, settings: { ...prev.settings, timezone: e.target.value } }))}
                aria-label="Company Timezone"
              >
                {timeZones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            ) : (
              <div className="px-2 py-2 bg-gray-50 rounded border border-gray-100">{company?.settings?.timezone || '-'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Working Hours</label>
            <div className="grid grid-cols-1 gap-2">
              {weekDays.map(day => (
                <div key={day} className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded ${company?.settings?.workingHours?.[day]?.isWorkingDay ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'} text-sm font-medium focus:outline-none`}
                    onClick={() => handleWorkingDayToggle(day)}
                    aria-label={`Toggle ${day.charAt(0).toUpperCase() + day.slice(1)} working day`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </button>
                  <input
                    type="time"
                    className="border border-gray-200 rounded px-2 py-1 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={company?.settings?.workingHours?.[day]?.start || ''}
                    onChange={e => handleWorkingHoursChange(day, 'start', e.target.value)}
                    required={company?.settings?.workingHours?.[day]?.isWorkingDay}
                    aria-label={`${day.charAt(0).toUpperCase() + day.slice(1)} start time`}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    className="border border-gray-200 rounded px-2 py-1 text-[#111827] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={company?.settings?.workingHours?.[day]?.end || ''}
                    onChange={e => handleWorkingHoursChange(day, 'end', e.target.value)}
                    required={company?.settings?.workingHours?.[day]?.isWorkingDay}
                    aria-label={`${day.charAt(0).toUpperCase() + day.slice(1)} end time`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visitor Settings */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#111827]">🛠️ Visitor Settings</h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="kioskMode" checked={!!company?.settings?.kioskMode} onChange={handleSettingsBoolChange} className="h-4 w-4 text-blue-500" aria-label="Kiosk Mode" />
              Kiosk Mode
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="requireNDA" checked={!!company?.settings?.requireNDA} onChange={handleSettingsBoolChange} className="h-4 w-4 text-blue-500" aria-label="Require NDA" />
              Require NDA
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="requireID" checked={!!company?.settings?.requireID} onChange={handleSettingsBoolChange} className="h-4 w-4 text-blue-500" aria-label="Require ID" />
              Require ID
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="requirePhoto" checked={!!company?.settings?.requirePhoto} onChange={handleSettingsBoolChange} className="h-4 w-4 text-blue-500" aria-label="Require Photo" />
              Require Photo
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="requireSignature" checked={!!company?.settings?.requireSignature} onChange={handleSettingsBoolChange} className="h-4 w-4 text-blue-500" aria-label="Require Signature" />
              Require Signature
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="autoApproval" checked={!!company?.settings?.autoApproval} onChange={handleSettingsBoolChange} className="h-4 w-4 text-blue-500" aria-label="Auto Approval" />
              Auto Approval
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="printBadge" checked={!!company?.settings?.printBadge} onChange={handleSettingsBoolChange} className="h-4 w-4 text-blue-500" aria-label="Print Badge" />
              Print Badge
            </label>
          </div>
        </section>

        {/* Subscription Info (read-only) */}
        {company?.subscription && (
          <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#111827]">💳 Billing & Subscription</h2>
            <div className="flex flex-col gap-2">
              <div><span className="font-medium">Plan:</span> {company.subscription.planId || 'N/A'}</div>
              <div><span className="font-medium">Status:</span> {company.subscription.status || 'Active'}</div>
              <div><span className="font-medium">Start:</span> {company.subscription.startDate ? new Date(company.subscription.startDate).toLocaleDateString() : 'N/A'}</div>
              <div><span className="font-medium">Ends:</span> {company.subscription.endDate ? new Date(company.subscription.endDate).toLocaleDateString() : 'N/A'}</div>
              <div><span className="font-medium">Auto Renew:</span> {company.subscription.autoRenew ? 'Yes' : 'No'}</div>
            </div>
          </section>
        )}
      </div>
      {/* Sticky Save/Cancel Buttons */}
      {isEditing && (
        <div className="sticky bottom-0 left-0 w-full bg-[#F9FAFB] border-t flex justify-end px-6 py-4 z-10 gap-2">
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium shadow-sm transition"
            onClick={handleCancel}
            disabled={saving}
            aria-label="Cancel Company Settings Changes"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition"
            disabled={saving}
            aria-label="Save Company Settings"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  );
} 