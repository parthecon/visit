import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import HostDropdown from "@/components/visitor/HostDropdown";

interface VisitorFormValues {
  mobile: string;
  name: string;
  aadhar: string;
  gender: string;
  host: string;
  purpose: string;
}

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const purposeOptions = [
  { label: "Interview", value: "interview" },
  { label: "Meeting", value: "meeting" },
  { label: "Delivery", value: "delivery" },
  { label: "Other", value: "other" },
];

const KioskCheckIn: React.FC = () => {
  const methods = useForm<VisitorFormValues>({
    defaultValues: {
      mobile: "",
      name: "",
      aadhar: "",
      gender: "",
      host: "",
      purpose: "",
    },
  });
  const { handleSubmit, reset, control } = methods;
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: VisitorFormValues) => {
    setLoading(true);
    setMessage(null);
    try {
      // Map form data to backend schema
      const payload = {
        name: data.name,
        phone: data.mobile,
        aadhar: data.aadhar,
        gender: data.gender,
        hostId: data.host, // send host as hostId
        purpose: data.purpose,
      };
      const response = await fetch("/api/v1/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("Backend result:", result);
      // Extract id from result.data._id or similar
      const id = result.id || result._id || result.visitorId || result.data?.id || result.data?._id || result.data?.visitorId;
      const visitorData = result.data || payload;
      if (response.ok && id) {
        // Always include host from form data
        navigate(`/gate-pass/${id}`, { state: { ...visitorData, host: data.host, id } });
        reset();
      } else {
        setMessage(result.message || "Registration failed.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-5 pointer-events-none"></div>
      <div className="relative z-10 w-full flex flex-1 items-center justify-center px-2 py-6 min-h-0">
        <div className="glass-card w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[420px] xl:max-w-[480px] 2xl:max-w-[520px] mx-auto p-3 sm:p-4 md:p-6 lg:p-6 xl:p-4 shadow-2xl flex flex-col items-center gap-3 md:gap-4 lg:gap-4 relative overflow-visible min-h-0">
          {/* Floating Elements attached to card */}
          <div className="absolute -top-4 -right-4 w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full animate-bounce pointer-events-none"></div>
          <div className="absolute -bottom-4 -left-4 w-5 h-5 md:w-6 md:h-6 bg-secondary/10 rounded-full animate-pulse pointer-events-none"></div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-lg font-bold text-center leading-tight mb-1 md:mb-2">
            <span className="text-gradient">Visitor Registration</span>
          </h2>
          {message && (
            <div className="text-red-600 text-center text-sm md:text-base font-semibold py-2 md:py-3">{message}</div>
          )}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-2 md:gap-3 lg:gap-3">
              <FormField name="mobile" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs md:text-sm lg:text-xs">Mobile No.</FormLabel>
                  <Input placeholder="Enter your mobile number" {...field} className="text-xs md:text-sm py-2 h-9" />
                </FormItem>
              )} />
              <FormField name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs md:text-sm lg:text-xs">Name</FormLabel>
                  <Input placeholder="Enter your name" {...field} className="text-xs md:text-sm py-2 h-9" />
                </FormItem>
              )} />
              <FormField name="aadhar" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs md:text-sm lg:text-xs">Aadhar No.</FormLabel>
                  <Input placeholder="Enter your Aadhar number" {...field} className="text-xs md:text-sm py-2 h-9" />
                </FormItem>
              )} />
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-sm lg:text-xs">Gender</FormLabel>
                    <div className="flex gap-4 mt-1">
                      {genderOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={() => field.onChange(option.value)}
                            className="accent-primary w-4 h-4"
                          />
                          <span className="text-xs md:text-sm lg:text-xs">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
              <FormField name="host" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs md:text-sm lg:text-xs">Host</FormLabel>
                  <HostDropdown value={field.value} onChange={field.onChange} />
                </FormItem>
              )} />
              <Controller
                name="purpose"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-sm lg:text-xs">Purpose of Visit</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                      <SelectTrigger className="text-xs md:text-sm py-2 h-9">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {purposeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-xs md:text-sm">{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-2 text-sm md:text-base py-2 h-10" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </FormProvider>
        </div>
      </div>
    </section>
  );
};

export default KioskCheckIn; 