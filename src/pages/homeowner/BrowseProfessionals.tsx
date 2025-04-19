
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSwitcher from "@/components/RoleSwitcher";
import { Professional, ProfessionType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, User, MapPin, Phone, Calendar, Star, ArrowLeft, PhoneCall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LS_KEYS } from "@/utils/auth";

const BrowseProfessionals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [professionFilter, setProfessionFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      const loadedProfessionals = JSON.parse(localStorage.getItem(LS_KEYS.PROFESSIONALS) || "[]");
      setProfessionals(loadedProfessionals);
      setFilteredProfessionals(loadedProfessionals);
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  useEffect(() => {
    let results = [...professionals];
    
    if (professionFilter !== "all") {
      results = results.filter(p => p.professionType === professionFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        p =>
          p.fullName.toLowerCase().includes(term) ||
          p.professionType.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term) ||
          p.bio.toLowerCase().includes(term)
      );
    }
    
    setFilteredProfessionals(results);
  }, [professionals, searchTerm, professionFilter]);
  
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
  };
  
  const handleBookNow = (professional: Professional) => {
    toast({
      title: "Coming Soon!",
      description: `Booking feature for ${professional.fullName} will be available soon.`,
      duration: 3000,
    });
  };

  const uniqueProfessionTypes = [
    "all",
    ...Array.from(new Set(professionals.map((p) => p.professionType))),
  ];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  const browseProfessionalsContent = (
    <div className="min-h-screen bg-skillink-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/dashboard/homeowner")}
              className="text-skillink-gray hover:text-skillink-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-skillink-secondary">
              Browse Professionals
            </h1>
          </div>
          <RoleSwitcher />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded-lg shadow-sm mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by name, profession, or location..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-64">
                <Select value={professionFilter} onValueChange={setProfessionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by profession" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueProfessionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Professions" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:hidden">
                <Button type="submit" className="w-full bg-skillink-primary hover:bg-skillink-dark">
                  Search
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-xl font-semibold text-skillink-secondary">
            {isLoading ? "Loading..." : `${filteredProfessionals.length} Professionals Found`}
          </h2>
          {professionFilter !== "all" && (
            <Badge className="bg-skillink-primary text-white">
              {professionFilter}
            </Badge>
          )}
        </motion.div>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-white border-0 shadow-sm animate-pulse">
                  <CardContent className="p-6 h-[250px]" />
                </Card>
              ))}
            </div>
          ) : filteredProfessionals.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white shadow-sm border-0 p-8 text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-skillink-secondary mb-2">No Professionals Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {professionals.length === 0
                    ? "Be the first professional to join our platform!"
                    : "Try adjusting your filters or search terms to find professionals."}
                </p>
              </Card>
            </motion.div>
          ) : (
            filteredProfessionals.map((professional) => (
              <motion.div key={professional.id} variants={item}>
                <Card className="group bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 h-20 w-20 rounded-full bg-skillink-primary/10 flex items-center justify-center group-hover:bg-skillink-primary/20 transition-colors">
                        <User className="h-10 w-10 text-skillink-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-skillink-dark group-hover:text-skillink-primary transition-colors">
                          {professional.fullName}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className="bg-skillink-light text-skillink-primary border-skillink-primary">
                            {professional.professionType}
                          </Badge>
                          <div className="flex items-center text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 text-gray-300" />
                          </div>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-skillink-gray" />
                            <span>{professional.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-skillink-gray" />
                            <span>{professional.experience} years experience</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-gray-700 line-clamp-3">
                      {professional.bio}
                    </div>
                    <div className="mt-6 flex justify-between items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{professional.phone}</span>
                      </div>
                      <Button 
                        className="bg-skillink-accent hover:bg-skillink-accent/90 text-white"
                        onClick={() => handleBookNow(professional)}
                      >
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </motion.div>
        
        {professionals.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Button
              className="bg-skillink-primary hover:bg-skillink-dark"
              onClick={() => {
                const sampleProfessionals: Professional[] = [
                  {
                    id: "sample1",
                    fullName: "John Smith",
                    professionType: "Civil Engineer",
                    experience: 8,
                    location: "New York, NY",
                    phone: "+1 (212) 555-1234",
                    bio: "Experienced civil engineer specializing in structural design and analysis. I have worked on residential and commercial projects across the East Coast with a focus on sustainable building practices.",
                    profilePicture: "",
                    createdAt: Date.now(),
                  },
                  {
                    id: "sample2",
                    fullName: "Emily Johnson",
                    professionType: "Architect",
                    experience: 12,
                    location: "San Francisco, CA",
                    phone: "+1 (415) 555-6789",
                    bio: "Award-winning architect with expertise in modern residential design. My approach combines functionality with aesthetic appeal, ensuring spaces that are both beautiful and practical for everyday living.",
                    profilePicture: "",
                    createdAt: Date.now(),
                  },
                  {
                    id: "sample3",
                    fullName: "Michael Rodriguez",
                    professionType: "Contractor",
                    experience: 15,
                    location: "Chicago, IL",
                    phone: "+1 (312) 555-2468",
                    bio: "General contractor with extensive experience in home renovations and new construction. My team and I pride ourselves on quality craftsmanship, attention to detail, and completing projects on time and within budget.",
                    profilePicture: "",
                    createdAt: Date.now(),
                  },
                  {
                    id: "sample4",
                    fullName: "Sarah Williams",
                    professionType: "Interior Designer",
                    experience: 10,
                    location: "Miami, FL",
                    phone: "+1 (305) 555-1357",
                    bio: "Passionate interior designer specializing in residential and small commercial spaces. I create personalized, functional designs that reflect my clients' personalities and lifestyles while maximizing the potential of their spaces.",
                    profilePicture: "",
                    createdAt: Date.now(),
                  },
                ];
                
                localStorage.setItem(
                  LS_KEYS.PROFESSIONALS,
                  JSON.stringify(sampleProfessionals)
                );
                
                setProfessionals(sampleProfessionals);
                setFilteredProfessionals(sampleProfessionals);
              }}
            >
              Add Sample Professionals (Demo)
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
  
  return (
    <ProtectedRoute allowedRoles={["homeowner"]}>
      {browseProfessionalsContent}
    </ProtectedRoute>
  );
};

export default BrowseProfessionals;
