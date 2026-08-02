import { StatsCard } from "../StatsCard";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <StatsCard
        title="Vendas Hoje"
        value="R$ 12.450"
        icon={DollarSign}
        trend={{ value: 12.5, isPositive: true }}
      />
      <StatsCard
        title="Transações"
        value="142"
        icon={ShoppingCart}
        trend={{ value: 8.2, isPositive: true }}
      />
      <StatsCard
        title="Produtos"
        value="1.284"
        icon={Package}
      />
      <StatsCard
        title="Estoque Baixo"
        value="23"
        icon={AlertTriangle}
      />
    </div>
  );
}
