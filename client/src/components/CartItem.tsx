import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onDiscountChange: (id: string, value: number) => void;
  onPriceChange: (id: string, value: number) => void;
}

export function CartItem({
  id,
  name,
  price,
  quantity,
  discount,
  onIncrement,
  onDecrement,
  onRemove,
  onDiscountChange,
  onPriceChange,
}: CartItemProps) {
  const subtotal = price * quantity;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="rounded-md border p-3 space-y-3" data-testid={`cart-item-${id}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" data-testid={`text-cart-item-name-${id}`}>
            {name}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">R$</span>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => onPriceChange(id, Number(e.target.value || 0))}
              className="h-6 w-20 text-xs font-mono px-1"
              data-testid={`input-item-price-${id}`}
            />
            <span className="text-xs text-muted-foreground">/ un</span>
          </div>
        </div>
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

      <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex-1 min-w-[140px] space-y-1">
          <Label htmlFor={`discount-${id}`} className="text-xs text-muted-foreground">
            Desconto no item
          </Label>
          <Input
            id={`discount-${id}`}
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(e) => onDiscountChange(id, Number(e.target.value || 0))}
            className="h-8 text-sm"
            data-testid={`input-discount-${id}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal: R$ {subtotal.toFixed(2)}</span>
        <span className="font-mono font-semibold text-primary" data-testid={`text-total-${id}`}>
          R$ {total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
