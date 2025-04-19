
import { Building, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MaterialCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
  };
}

export const MaterialCard = ({ product }: MaterialCardProps) => {
  return (
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        {product.image_url && (
          <div className="aspect-video mb-4 rounded-md overflow-hidden">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h3 className="text-lg font-semibold text-skillink-dark mb-2">
          {product.name}
        </h3>
        <Badge className="mb-3 bg-skillink-light text-skillink-primary">
          {product.category}
        </Badge>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-skillink-primary">
            ${product.price.toFixed(2)}
          </span>
          <Button 
            className="bg-skillink-accent hover:bg-skillink-accent/90"
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
        {product.stock > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {product.stock} units available
          </p>
        )}
      </CardContent>
    </Card>
  );
};
