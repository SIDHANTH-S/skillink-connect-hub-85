
import { Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MaterialCard } from "./MaterialCard";

interface MaterialsGridProps {
  products: any[];
  isLoading: boolean;
}

export const MaterialsGrid = ({ products, isLoading }: MaterialsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white border-0 shadow-sm animate-pulse">
            <div className="p-6 h-[200px]" />
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="bg-white shadow-sm border-0 p-8 text-center">
        <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-skillink-secondary mb-2">No Materials Found</h3>
        <p className="text-gray-500">
          No materials match your search criteria. Try adjusting your filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <MaterialCard key={product.id} product={product} />
      ))}
    </div>
  );
};
