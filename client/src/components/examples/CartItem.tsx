import { CartItem } from "../CartItem";
import { useState } from "react";

export default function CartItemExample() {
  const [items, setItems] = useState([
    { id: "1", name: "Smartphone XYZ", price: 2499.90, quantity: 1 },
    { id: "2", name: "Fone Bluetooth", price: 299.90, quantity: 2 },
  ]);

  const handleIncrement = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrement = (id: string) => {
    setItems(items.map(item => 
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-md p-4 space-y-2">
      {items.map(item => (
        <CartItem
          key={item.id}
          {...item}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}
