
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSwitcher from "@/components/RoleSwitcher";
import { LS_KEYS } from "@/utils/auth";
import { Professional } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, MessageSquare, Settings, FileEdit, UsersRound, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ProfessionalDashboard = () => {
  const [professional, setProfessional] = useState<Professional | null>(null);
  
  useEffect(() => {
    // Get user ID from localStorage
    const userId = localStorage.getItem(LS_KEYS.USER_ID);
    if (!userId) return;
    
    // Fetch professional data from Supabase
    const fetchProfessionalData = async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error || !data) {
        console.error("Error fetching professional data:", error);
        return;
      }
      
      // Convert to our Professional type
      const profData: Professional = {
        id: data.id,
        fullName: data.full_name,
        professionType: data.profession_type,
        experience: data.experience,
        location: data.location,
        phone: data.phone,
        bio: data.bio || '',
        profilePicture: data.profile_picture || '',
        createdAt: new Date(data.created_at).getTime()
      };
      
      setProfessional(profData);
    };
    
    fetchProfessionalData();
  }, []);
  
  const quickActions = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      description: "Update your professional information",
      icon: <FileEdit className="h-8 w-8 text-skillink-primary" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Edit Profile",
      color: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      id: "my-clients",
      title: "My Clients",
      description: "View and manage your client list",
      icon: <UsersRound className="h-8 w-8 text-skillink-secondary" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Coming Soon",
      disabled: true,
      color: "bg-gradient-to-br from-purple-50 to-purple-100"
    },
    {
      id: "appointments",
      title: "Appointments",
      description: "Manage your upcoming appointments",
      icon: <Calendar className="h-8 w-8 text-skillink-accent" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Coming Soon",
      disabled: true,
      color: "bg-gradient-to-br from-orange-50 to-orange-100"
    },
    {
      id: "messages",
      title: "Messages",
      description: "Check your client messages and inquiries",
      icon: <MessageSquare className="h-8 w-8 text-green-500" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Coming Soon",
      disabled: true,
      color: "bg-gradient-to-br from-green-50 to-green-100"
    },
  ];
  
  return (
    <ProtectedRoute allowedRoles={["professional"]}>
      <div className="min-h-screen bg-skillink-light">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-skillink-secondary">
              Professional Dashboard
            </h1>
            <RoleSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Profile Summary */}
          {professional && (
            <Card className="mb-8 bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-shrink-0 h-24 w-24 rounded-full bg-skillink-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-skillink-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-skillink-dark">{professional.fullName}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 mt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Profession:</span> {professional.professionType}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Experience:</span> {professional.experience} years
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {professional.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span> {professional.phone}
                      </p>
                    </div>
                    <p className="mt-3 text-gray-700">{professional.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
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
          
          {/* Upcoming Appointments (placeholder) */}
          <h2 className="text-xl font-bold mb-4 mt-8 text-skillink-secondary">Upcoming Appointments</h2>
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                You have no upcoming appointments scheduled at this time.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Your appointments will appear here once clients start booking your services.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ProfessionalDashboard;
