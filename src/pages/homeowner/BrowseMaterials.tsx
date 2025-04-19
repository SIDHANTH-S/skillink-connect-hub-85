
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSwitcher from "@/components/RoleSwitcher";
import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaterialsSearchFilters } from "@/components/materials/MaterialsSearchFilters";
import { MaterialsGrid } from "@/components/materials/MaterialsGrid";

const BrowseMaterials = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let results = [...products];
    
    if (categoryFilter !== "all") {
      results = results.filter(p => p.category === categoryFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredProducts(results);
  }, [products, searchTerm, categoryFilter]);

  return (
    <ProtectedRoute allowedRoles={["homeowner"]}>
      <div className="min-h-screen bg-skillink-light">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/dashboard/homeowner")}
                className="text-skillink-gray hover:text-skillink-primary transition-colors"
              >
                <Building className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-skillink-secondary">
                Browse Materials
              </h1>
            </div>
            <RoleSwitcher />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <MaterialsSearchFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            categories={Array.from(new Set(products.map(p => p.category)))}
          />
          
          <MaterialsGrid 
            products={filteredProducts}
            isLoading={isLoading}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default BrowseMaterials;
