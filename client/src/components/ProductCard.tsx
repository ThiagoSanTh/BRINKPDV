import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  onAddToCart?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  price,
  stock,
  image,
  category,
  onAddToCart,
}: ProductCardProps) {
  const isLowStock = stock < 10;

  return (
    <Card
      className="overflow-hidden hover-elevate cursor-pointer"
      data-testid={`card-product-${id}`}
    >
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        {isLowStock && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2"
            data-testid={`badge-low-stock-${id}`}
          >
            Estoque Baixo
          </Badge>
        )}
      </div>
      <div className="p-4">
        {category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {category}
          </p>
        )}
        <h3 className="font-medium text-base line-clamp-2 mb-2" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xl font-bold font-mono text-primary" data-testid={`text-price-${id}`}>
              R$ {price.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`text-stock-${id}`}>
              Estoque: {stock}
            </p>
          </div>
          <Button
            size="icon"
            onClick={() => onAddToCart?.(id)}
            data-testid={`button-add-to-cart-${id}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
