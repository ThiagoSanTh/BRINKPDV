import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ShoppingCart, 
  CreditCard, 
  Smartphone, 
  Wallet,
  Calendar,
  TrendingUp,
  X
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Sale } from "@shared/schema";

interface SaleWithDetails extends Sale {
  salespersonName?: string;
}

export default function DailySales() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  const { data: sales = [], isLoading } = useQuery<SaleWithDetails[]>({
    queryKey: ["/api/sales/today"],
  });

  // Filtrar vendas por método de pagamento selecionado
  const filteredSales = selectedPaymentMethod
    ? sales.filter(sale => sale.paymentMethod === selectedPaymentMethod)
    : sales;

  // Cálculos das vendas do dia
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalTransactions = sales.length;

  const salesByPayment = sales.reduce((acc, sale) => {
    const method = sale.paymentMethod;
    acc[method] = (acc[method] || 0) + Number(sale.total);
    return acc;
  }, {} as Record<string, number>);

  const paymentMethods = [
    { 
      name: "Crédito", 
      value: salesByPayment["Crédito"] || 0,
      icon: CreditCard,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10"
    },
    { 
      name: "Débito", 
      value: salesByPayment["Débito"] || 0,
      icon: CreditCard,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10"
    },
    { 
      name: "PIX", 
      value: salesByPayment["PIX"] || 0,
      icon: Smartphone,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10"
    },
    { 
      name: "Dinheiro", 
      value: salesByPayment["Dinheiro"] || 0,
      icon: Wallet,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10"
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vendas do Dia</h1>
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Vendas do Dia</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          data-testid="card-total-sales"
          className={`cursor-pointer transition-all hover-elevate active-elevate-2 ${
            selectedPaymentMethod === null ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedPaymentMethod(null)}
        >
          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                    Total de Vendas
                  </p>
                  {selectedPaymentMethod === null && (
                    <Badge variant="default" className="h-5 text-xs">
                      Ativo
                    </Badge>
                  )}
                </div>
                <p className="text-3xl font-bold mt-2 font-mono text-primary">
                  {formatCurrency(totalSales)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card data-testid="card-total-transactions">
          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Transações
                </p>
                <p className="text-3xl font-bold mt-2 font-mono">
                  {totalTransactions}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-chart-2/10 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-chart-2" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Vendas por Forma de Pagamento */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Por Forma de Pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethods.map((method) => {
            const isSelected = selectedPaymentMethod === method.name;
            return (
              <Card 
                key={method.name} 
                data-testid={`card-payment-${method.name.toLowerCase()}`}
                className={`cursor-pointer transition-all hover-elevate active-elevate-2 ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  if (isSelected) {
                    setSelectedPaymentMethod(null);
                  } else {
                    setSelectedPaymentMethod(method.name);
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                          {method.name}
                        </p>
                        {isSelected && (
                          <Badge variant="default" className="h-5 text-xs">
                            Ativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold mt-2 font-mono">
                        {formatCurrency(method.value)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {totalSales > 0 
                          ? `${((method.value / totalSales) * 100).toFixed(1)}% do total`
                          : '0% do total'
                        }
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-md ${method.bgColor} flex items-center justify-center`}>
                        <method.icon className={`h-6 w-6 ${method.color}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabela de Vendas */}
      <Card data-testid="card-sales-list">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedPaymentMethod 
                ? `Vendas em ${selectedPaymentMethod}`
                : 'Lista de Vendas'
              }
            </h3>
            {selectedPaymentMethod && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPaymentMethod(null)}
                data-testid="button-clear-filter"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtro
              </Button>
            )}
          </div>
          
          {filteredSales.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">
                {selectedPaymentMethod 
                  ? `Nenhuma venda realizada com ${selectedPaymentMethod} hoje`
                  : 'Nenhuma venda realizada hoje'
                }
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} data-testid={`sale-row-${sale.id}`}>
                      <TableCell className="font-medium">
                        {formatTime(sale.createdAt)}
                      </TableCell>
                      <TableCell>
                        {sale.salespersonName || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" data-testid={`badge-payment-${sale.id}`}>
                          {sale.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-primary">
                        {formatCurrency(Number(sale.total))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
