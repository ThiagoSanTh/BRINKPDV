import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  name,
  price,
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemProps) {
  const total = price * quantity;

  return (
    <div className="flex items-center gap-2 py-3 border-b" data-testid={`cart-item-${id}`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" data-testid={`text-cart-item-name-${id}`}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          R$ {price.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => onDecrement(id)}
          data-testid={`button-decrement-${id}`}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-mono text-sm" data-testid={`text-quantity-${id}`}>
          {quantity}
        </span>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => onIncrement(id)}
          data-testid={`button-increment-${id}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <p className="font-mono font-semibold text-sm w-20 text-right" data-testid={`text-total-${id}`}>
        R$ {total.toFixed(2)}
      </p>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => onRemove(id)}
        data-testid={`button-remove-${id}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
