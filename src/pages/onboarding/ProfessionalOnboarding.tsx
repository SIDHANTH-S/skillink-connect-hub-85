
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, LS_KEYS } from "@/utils/auth";
import { Professional, ProfessionType } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, MapPin, Phone, FileText, Award } from "lucide-react";

const professionTypes: ProfessionType[] = [
  'Civil Engineer',
  'Architect',
  'Interior Designer',
  'Structural Engineer',
  'Project Manager',
  'Contractor',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Mason',
  'Painter',
  'Landscaper',
  'HVAC Specialist',
  'Other'
];

const ProfessionalOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Professional>>({
    fullName: "",
    professionType: "Civil Engineer",
    experience: 0,
    location: "",
    phone: "",
    bio: "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Professional, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleChange = (name: keyof Professional, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Professional, string>> = {};
    
    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.professionType) {
      newErrors.professionType = "Profession type is required";
    }
    
    if (typeof formData.experience !== 'number' || formData.experience < 0) {
      newErrors.experience = "Experience must be a positive number";
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    if (!formData.bio?.trim()) {
      newErrors.bio = "Bio is required";
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
      // Get user ID from Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to complete onboarding.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      // Create professional profile in Supabase
      const professionalData = {
        id: userId,
        fullName: formData.fullName,
        professionType: formData.professionType,
        experience: formData.experience,
        location: formData.location,
        phone: formData.phone,
        bio: formData.bio,
        profilePicture: "",
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('professionals')
        .upsert(professionalData);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success!",
        description: "Your professional profile has been created.",
      });
      
      // Navigate to dashboard
      navigate("/dashboard/professional");
    } catch (error: any) {
      console.error("Error during onboarding:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-skillink-light p-4">
      <div className="w-full max-w-3xl">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-skillink-secondary">Professional Profile Setup</CardTitle>
            <CardDescription>Complete your profile to start offering your services to homeowners</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>
                
                {/* Profession Type */}
                <div className="space-y-2">
                  <Label htmlFor="professionType" className="flex items-center gap-2">
                    <Award className="h-4 w-4" /> Profession
                  </Label>
                  <Select
                    value={formData.professionType}
                    onValueChange={(value) => handleChange("professionType", value)}
                  >
                    <SelectTrigger className={errors.professionType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.professionType && (
                    <p className="text-xs text-red-500">{errors.professionType}</p>
                  )}
                </div>
                
                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience" className="flex items-center gap-2">
                    <Award className="h-4 w-4" /> Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", parseInt(e.target.value) || 0)}
                    placeholder="5"
                    className={errors.experience ? "border-red-500" : ""}
                  />
                  {errors.experience && (
                    <p className="text-xs text-red-500">{errors.experience}</p>
                  )}
                </div>
                
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="New York, NY"
                    className={errors.location ? "border-red-500" : ""}
                  />
                  {errors.location && (
                    <p className="text-xs text-red-500">{errors.location}</p>
                  )}
                </div>
                
                {/* Phone */}
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
                
                {/* Profile Picture (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile Picture (Optional)
                  </Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    className="cursor-not-allowed opacity-60"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Coming soon in future updates.
                  </p>
                </div>
                
                {/* Bio */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Professional Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Tell homeowners about your expertise and experience..."
                    className={`min-h-[120px] ${errors.bio ? "border-red-500" : ""}`}
                  />
                  {errors.bio && (
                    <p className="text-xs text-red-500">{errors.bio}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  className="bg-skillink-primary hover:bg-skillink-dark"
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

export default ProfessionalOnboarding;
