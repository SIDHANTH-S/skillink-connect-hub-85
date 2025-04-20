
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleSwitcher from "@/components/RoleSwitcher";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductsList } from "@/components/products/ProductsList";
import { useToast } from "@/hooks/use-toast";

const ManageProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <div className="min-h-screen bg-skillink-light">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/dashboard/vendor")}
                className="text-skillink-gray hover:text-skillink-primary transition-colors"
              >
                <Package className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-skillink-secondary">
                Manage Products
              </h1>
            </div>
            <RoleSwitcher />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-skillink-secondary">
              Your Products
            </h2>
            <Button
              onClick={() => setIsAddingProduct(true)}
              className="bg-skillink-primary hover:bg-skillink-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {isAddingProduct && (
            <ProductForm
              onSuccess={() => {
                setIsAddingProduct(false);
                fetchProducts();
              }}
              onCancel={() => setIsAddingProduct(false)}
            />
          )}

          <ProductsList
            products={products}
            isLoading={isLoading}
            onProductUpdated={fetchProducts}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ManageProducts;
