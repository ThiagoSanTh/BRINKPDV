import { ProductCard } from "../ProductCard";

export default function ProductCardExample() {
  const handleAddToCart = (id: string) => {
    console.log("Add to cart:", id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      <ProductCard
        id="1"
        name="Smartphone XYZ Pro Max"
        price={2499.90}
        stock={45}
        category="Eletrônicos"
        onAddToCart={handleAddToCart}
      />
      <ProductCard
        id="2"
        name="Fone de Ouvido Bluetooth Premium"
        price={299.90}
        stock={8}
        category="Acessórios"
        onAddToCart={handleAddToCart}
      />
      <ProductCard
        id="3"
        name="Notebook Ultra 15.6"
        price={4299.00}
        stock={120}
        category="Eletrônicos"
        onAddToCart={handleAddToCart}
      />
      <ProductCard
        id="4"
        name="Mouse Gamer RGB"
        price={189.90}
        stock={3}
        category="Periféricos"
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
