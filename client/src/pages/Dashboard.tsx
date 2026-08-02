import { useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { SalesChart } from "@/components/SalesChart";
import { DollarSign, ShoppingCart, Package, AlertTriangle, CreditCard, Smartphone, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const mockSalesData: any[] = [];
const mockRecentSales: any[] = [];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [cashIn, setCashIn] = useState(0);
  const [cashOut, setCashOut] = useState(0);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [entryAmount, setEntryAmount] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalDescription, setWithdrawalDescription] = useState("");

  const handleCashEntry = () => {
    const amount = parseFloat(entryAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido",
        variant: "destructive",
      });
      return;
    }

    setCashIn(prev => prev + amount);
    setShowEntryDialog(false);
    setEntryAmount("");
    setEntryDescription("");
    
    toast({
      title: "Entrada registrada",
      description: `R$ ${amount.toFixed(2)} adicionado ao caixa`,
    });
  };

  const handleCashWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido",
        variant: "destructive",
      });
      return;
    }

    setCashOut(prev => prev + amount);
    setShowWithdrawalDialog(false);
    setWithdrawalAmount("");
    setWithdrawalDescription("");
    
    toast({
      title: "Saída registrada",
      description: `R$ ${amount.toFixed(2)} retirado do caixa`,
    });
  };

  const cashBalance = cashIn - cashOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema PDV BRINKCELL
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setLocation("/reports")} className="cursor-pointer" data-testid="clickable-card-sales-today">
          <StatsCard
            title="Vendas Hoje"
            value="R$ 0,00"
            icon={DollarSign}
          />
        </div>
        <div onClick={() => setLocation("/pos")} className="cursor-pointer" data-testid="clickable-card-transactions">
          <StatsCard
            title="Transações"
            value="0"
            icon={ShoppingCart}
          />
        </div>
        <div onClick={() => setLocation("/products")} className="cursor-pointer" data-testid="clickable-card-products">
          <StatsCard
            title="Produtos"
            value="0"
            icon={Package}
          />
        </div>
        <div onClick={() => setLocation("/products")} className="cursor-pointer" data-testid="clickable-card-low-stock">
          <StatsCard
            title="Estoque Baixo"
            value="0"
            icon={AlertTriangle}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Vendas por Forma de Pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-sales-credit">
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                    Crédito
                  </p>
                  <p className="text-2xl font-bold mt-2 font-mono">
                    R$ 0,00
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    0% do total
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-md bg-chart-1/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-chart-1" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card data-testid="card-sales-debit">
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                    Débito
                  </p>
                  <p className="text-2xl font-bold mt-2 font-mono">
                    R$ 0,00
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    0% do total
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-md bg-chart-2/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-chart-2" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card data-testid="card-sales-pix">
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                    PIX
                  </p>
                  <p className="text-2xl font-bold mt-2 font-mono">
                    R$ 0,00
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    0% do total
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-md bg-chart-3/10 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-chart-3" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card data-testid="card-sales-cash">
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                    Dinheiro
                  </p>
                  <p className="text-2xl font-bold mt-2 font-mono">
                    R$ 0,00
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    0% do total
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-md bg-chart-4/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-chart-4" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={mockSalesData} />
        </div>

        <Card data-testid="card-recent-sales">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vendas Recentes</h3>
            {mockRecentSales.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nenhuma venda realizada hoje</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockRecentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    data-testid={`recent-sale-${sale.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{sale.product}</p>
                      <p className="text-xs text-muted-foreground">{sale.time}</p>
                    </div>
                    <p className="font-mono font-semibold text-sm text-primary">
                      R$ {sale.value.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-cash-register">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Caixa de Dinheiro</h3>
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <span className="text-sm text-muted-foreground">Entradas</span>
                </div>
                <span className="font-mono font-semibold text-chart-2" data-testid="text-cash-in">
                  R$ {cashIn.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">Saídas</span>
                </div>
                <span className="font-mono font-semibold text-destructive" data-testid="text-cash-out">
                  R$ {cashOut.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-sm font-semibold">Saldo em Caixa</span>
                <span className="text-2xl font-bold font-mono text-primary" data-testid="text-cash-balance">
                  R$ {cashBalance.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={() => setShowEntryDialog(true)}
                data-testid="button-cash-entry"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Entrada
              </Button>
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={() => setShowWithdrawalDialog(true)}
                data-testid="button-cash-withdrawal"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Saída
              </Button>
            </div>
          </div>
        </Card>

        <Card data-testid="card-quick-actions">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/pos">
                <Button data-testid="button-new-sale">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Nova Venda
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" data-testid="button-add-product">
                  <Package className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </Link>
              <Link href="/service-orders">
                <Button variant="outline" data-testid="button-new-service-order">
                  Nova Ordem de Serviço
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" data-testid="button-view-reports">
                  Visualizar Relatórios
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Diálogo de Entrada de Dinheiro */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent data-testid="dialog-cash-entry">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              Entrada de Dinheiro
            </DialogTitle>
            <DialogDescription>
              Registre uma entrada de dinheiro no caixa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="entry-amount">Valor (R$)</Label>
              <Input
                id="entry-amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={entryAmount}
                onChange={(e) => setEntryAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCashEntry()}
                data-testid="input-entry-amount"
              />
            </div>
            <div>
              <Label htmlFor="entry-description">Descrição (opcional)</Label>
              <Textarea
                id="entry-description"
                placeholder="Ex: Venda em dinheiro, Troco inicial..."
                value={entryDescription}
                onChange={(e) => setEntryDescription(e.target.value)}
                data-testid="input-entry-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEntryDialog(false)}
              data-testid="button-cancel-entry"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCashEntry}
              data-testid="button-confirm-entry"
            >
              Confirmar Entrada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Saída de Dinheiro */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent data-testid="dialog-cash-withdrawal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Saída de Dinheiro
            </DialogTitle>
            <DialogDescription>
              Registre uma retirada de dinheiro do caixa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="withdrawal-amount">Valor (R$)</Label>
              <Input
                id="withdrawal-amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCashWithdrawal()}
                data-testid="input-withdrawal-amount"
              />
            </div>
            <div>
              <Label htmlFor="withdrawal-description">Descrição (opcional)</Label>
              <Textarea
                id="withdrawal-description"
                placeholder="Ex: Despesa, Pagamento fornecedor..."
                value={withdrawalDescription}
                onChange={(e) => setWithdrawalDescription(e.target.value)}
                data-testid="input-withdrawal-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowWithdrawalDialog(false)}
              data-testid="button-cancel-withdrawal"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCashWithdrawal}
              data-testid="button-confirm-withdrawal"
            >
              Confirmar Saída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
