
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSwitcher from "@/components/RoleSwitcher";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Building, Calendar, Bookmark, Settings } from "lucide-react";

const HomeownerDashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      id: "browse-professionals",
      title: "Find Professionals",
      description: "Browse qualified professionals for your project",
      icon: <Users className="h-8 w-8 text-skillink-primary" />,
      action: () => navigate("/homeowner/browse-professionals"),
      primaryButton: "Browse Now",
      color: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      id: "browse-vendors",
      title: "Find Vendors",
      description: "Browse suppliers for construction materials",
      icon: <Building className="h-8 w-8 text-skillink-secondary" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Coming Soon",
      disabled: true,
      color: "bg-gradient-to-br from-purple-50 to-purple-100"
    },
    {
      id: "appointments",
      title: "My Appointments",
      description: "View and manage your project appointments",
      icon: <Calendar className="h-8 w-8 text-skillink-accent" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Coming Soon",
      disabled: true,
      color: "bg-gradient-to-br from-orange-50 to-orange-100"
    },
    {
      id: "saved",
      title: "Saved Listings",
      description: "Access your saved professionals and vendors",
      icon: <Bookmark className="h-8 w-8 text-green-500" />,
      action: () => alert("Coming soon in future updates"),
      primaryButton: "Coming Soon",
      disabled: true,
      color: "bg-gradient-to-br from-green-50 to-green-100"
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["homeowner"]}>
      <div className="min-h-screen bg-skillink-light">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-skillink-secondary">
              Homeowner Dashboard
            </h1>
            <RoleSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Quick Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
            <div className="flex items-center space-x-3">
              <Search className="h-5 w-5 text-skillink-gray" />
              <input
                type="text"
                placeholder="Search for professionals, vendors, or services..."
                className="flex-1 py-2 outline-none text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate('/homeowner/browse-professionals');
                  }
                }}
              />
              <Button 
                className="bg-skillink-primary hover:bg-skillink-dark text-white" 
                onClick={() => navigate('/homeowner/browse-professionals')}
              >
                Search
              </Button>
            </div>
          </div>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card) => (
              <Card key={card.id} className={`overflow-hidden hover:shadow-md transition-shadow ${card.color} border-0`}>
                <CardHeader className="pb-2">
                  <div className="mb-2">{card.icon}</div>
                  <CardTitle className="text-xl text-skillink-dark">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="min-h-[40px]">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button
                    onClick={card.action}
                    className={`w-full ${
                      card.disabled
                        ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
                        : "bg-white text-skillink-primary hover:bg-gray-100 border border-skillink-primary/20"
                    }`}
                    disabled={card.disabled}
                  >
                    {card.primaryButton}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Recent Activity (placeholder) */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-skillink-secondary">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">
                Your recent activity will appear here once you start using the platform.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default HomeownerDashboard;
