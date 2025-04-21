import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSwitcher from "@/components/RoleSwitcher";
import { getCurrentUserId } from "@/utils/auth";
import { Vendor } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ShoppingCart, FileEdit, BarChart, TrendingUp, Package, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface VendorData {
  company_name: string;
  business_type: string;
  years_in_business: number;
  location: string;
  contact_person: string;
  phone: string;
  description: string;
  created_at: string;
}

const VendorDashboard = () => {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "User ID not found. Please log in again."
          });
          navigate("/login");
          return;
        }
        
        // Get vendor data from user profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('vendor_data')
          .eq('id', userId)
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        if (profileData?.vendor_data) {
          setVendorData(profileData.vendor_data as VendorData);
        } else {
          toast({
            variant: "destructive",
            title: "Profile Not Found",
            description: "Please complete your vendor profile setup."
          });
          navigate("/onboarding/vendor");
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data."
        });
      }
    };
    
    fetchVendorData();
  }, [navigate, toast]);
  
  const handleManageProducts = () => {
    navigate("/vendor/manage-products");
  };
  
  const quickActions = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      description: "Update your company information",
      icon: <FileEdit className="h-8 w-8 text-skillink-primary" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Edit Profile",
      color: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      id: "manage-products",
      title: "Manage Products",
      description: "Add and update your product listings",
      icon: <Package className="h-8 w-8 text-skillink-secondary" />,
      action: handleManageProducts,
      primaryButton: "Manage Products",
      color: "bg-gradient-to-br from-purple-50 to-purple-100"
    },
    {
      id: "orders",
      title: "Orders",
      description: "View and manage your product orders",
      icon: <ShoppingCart className="h-8 w-8 text-skillink-accent" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Coming Soon",
      disabled: true,
      color: "bg-gradient-to-br from-orange-50 to-orange-100"
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "View your business performance metrics",
      icon: <BarChart className="h-8 w-8 text-green-500" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Coming Soon",
      disabled: true,
      color: "bg-gradient-to-br from-green-50 to-green-100"
    },
  ];
  
  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <div className="min-h-screen bg-skillink-light">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-skillink-secondary">
              Vendor Dashboard
            </h1>
            <RoleSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Business Profile Summary */}
          {vendorData && (
            <Card className="mb-8 bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-shrink-0 h-24 w-24 rounded-full bg-skillink-primary/10 flex items-center justify-center">
                    <Building className="h-12 w-12 text-skillink-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-skillink-dark">{vendorData.company_name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 mt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Business Type:</span> {vendorData.business_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Years in Business:</span> {vendorData.years_in_business}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {vendorData.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Contact:</span> {vendorData.contact_person}, {vendorData.phone}
                      </p>
                    </div>
                    <p className="mt-3 text-gray-700">{vendorData.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Featured Action */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-skillink-secondary mb-2">Start Selling Your Products</h3>
                    <p className="text-gray-700">Add your products to make them available to homeowners and professionals</p>
                  </div>
                  <Button
                    onClick={handleManageProducts}
                    className="bg-skillink-primary hover:bg-skillink-primary/90 shadow-sm"
                    size="lg"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Manage Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <h2 className="text-xl font-bold mb-4 text-skillink-secondary">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Card key={action.id} className={`overflow-hidden hover:shadow-md transition-shadow ${action.color} border-0`}>
                <CardHeader className="pb-2">
                  <div className="mb-2">{action.icon}</div>
                  <CardTitle className="text-xl text-skillink-dark">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="min-h-[40px]">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button
                    onClick={action.action}
                    className={`w-full ${
                      action.disabled
                        ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
                        : "bg-white text-skillink-primary hover:bg-gray-100 border border-skillink-primary/20"
                    }`}
                    disabled={action.disabled}
                  >
                    {action.primaryButton}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Business Performance (placeholder) */}
          <h2 className="text-xl font-bold mb-4 mt-8 text-skillink-secondary">Business Performance</h2>
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                Your business performance metrics will appear here once you start receiving orders.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Track sales, order history, and customer engagement from this dashboard.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default VendorDashboard;
