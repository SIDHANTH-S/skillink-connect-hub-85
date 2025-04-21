import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAuthenticated, saveUserRole, setActiveRole, getCurrentUserId } from "@/utils/auth";
import { Vendor, BusinessType } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, MapPin, Phone, User, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

type ProfileWithVendorData = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  vendor_data?: any;
  roles?: string[];
}

const businessTypes: BusinessType[] = [
  'Cement', 'Steel', 'Timber', 'Glass', 'Electrical', 'Plumbing', 
  'Hardware', 'Tools', 'Paint', 'Flooring', 'Roofing', 'Insulation', 
  'Solar', 'Other'
];

const VendorOnboarding = () => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Vendor>>({
    companyName: "",
    businessType: "Cement",
    yearsInBusiness: 0,
    location: "",
    contactPerson: "",
    phone: "",
    description: "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Vendor, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        navigate("/login");
        return;
      }
      
      const userId = await getCurrentUserId();
      if (userId) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          const typedProfileData = profileData as ProfileWithVendorData;
          
          if (!error && typedProfileData && 
              Object.prototype.hasOwnProperty.call(typedProfileData, 'vendor_data') && 
              typedProfileData.vendor_data) {
            setActiveRole('vendor');
            navigate('/dashboard/vendor');
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
    };
    
    checkAuthentication();
  }, [navigate]);
  
  const handleChange = (name: keyof Vendor, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Vendor, string>> = {};
    
    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company name is required";
    }
    
    if (!formData.businessType) {
      newErrors.businessType = "Business type is required";
    }
    
    if (typeof formData.yearsInBusiness !== 'number' || formData.yearsInBusiness < 0) {
      newErrors.yearsInBusiness = "Years in business must be a positive number";
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        uiToast({
          variant: "destructive",
          title: "Error",
          description: "User ID not found. Please log in again."
        });
        navigate("/login");
        return;
      }
      
      const vendorData = {
        company_name: formData.companyName,
        business_type: formData.businessType,
        years_in_business: formData.yearsInBusiness,
        location: formData.location,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        description: formData.description,
        created_at: new Date().toISOString(),
      };
      
      try {
        const { data: existingProfile, error: profileFetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileFetchError && profileFetchError.code !== 'PGRST116') {
          throw new Error(profileFetchError.message);
        }
        
        try {
          const updateData: any = {
            id: userId,
            vendor_data: vendorData,
            full_name: existingProfile?.full_name || null,
            avatar_url: existingProfile?.avatar_url || null,
            updated_at: new Date().toISOString(),
            created_at: existingProfile?.created_at || new Date().toISOString()
          };
          
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(updateData)
            .select();
          
          if (profileError) {
            if (profileError.message && profileError.message.toLowerCase().includes("vendor_data")) {
              toast.error("Database setup required", {
                description: "The 'vendor_data' column doesn't exist in the profiles table. Please add it in the Supabase dashboard.",
                duration: 10000,
              });
              throw new Error("Database setup required: " + profileError.message);
            } else {
              throw new Error(profileError.message);
            }
          }
          
          await saveUserRole('vendor');
          setActiveRole('vendor');
          
          uiToast({
            title: "Success",
            description: "Vendor profile created successfully!"
          });
          
          navigate("/dashboard/vendor");
        } catch (updateError: any) {
          console.error("Error updating profile:", updateError);
          throw updateError;
        }
      } catch (error: any) {
        console.error("Error during onboarding:", error);
        uiToast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Something went wrong. Please try again."
        });
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Error during onboarding:", error);
      uiToast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again."
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-skillink-light p-4">
      <div className="w-full max-w-3xl">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-skillink-secondary">Vendor Business Profile</CardTitle>
            <CardDescription>Complete your business profile to connect with professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building className="h-4 w-4" /> Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="ABC Construction Supplies"
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-500">{errors.companyName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="flex items-center gap-2">
                    <Building className="h-4 w-4" /> Business Type
                  </Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleChange("businessType", value)}
                  >
                    <SelectTrigger className={errors.businessType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessType && (
                    <p className="text-xs text-red-500">{errors.businessType}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="yearsInBusiness" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Years in Business
                  </Label>
                  <Input
                    id="yearsInBusiness"
                    type="number"
                    min="0"
                    value={formData.yearsInBusiness}
                    onChange={(e) => handleChange("yearsInBusiness", parseInt(e.target.value) || 0)}
                    placeholder="10"
                    className={errors.yearsInBusiness ? "border-red-500" : ""}
                  />
                  {errors.yearsInBusiness && (
                    <p className="text-xs text-red-500">{errors.yearsInBusiness}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Chicago, IL"
                    className={errors.location ? "border-red-500" : ""}
                  />
                  {errors.location && (
                    <p className="text-xs text-red-500">{errors.location}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Contact Person
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange("contactPerson", e.target.value)}
                    placeholder="Jane Smith"
                    className={errors.contactPerson ? "border-red-500" : ""}
                  />
                  {errors.contactPerson && (
                    <p className="text-xs text-red-500">{errors.contactPerson}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 234 567 8900"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logo" className="flex items-center gap-2">
                    <Building className="h-4 w-4" /> Company Logo (Optional)
                  </Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="cursor-not-allowed opacity-60"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Coming soon in future updates.
                  </p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Business Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe your business, products, and services..."
                    className={`min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  className="bg-skillink-secondary hover:bg-skillink-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Profile..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorOnboarding;
