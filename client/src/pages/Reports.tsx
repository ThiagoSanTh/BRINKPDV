import { useState } from "react";
import { useLocation } from "wouter";
import { SalesChart } from "@/components/SalesChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Calendar, Lock, CreditCard, DollarSign, Smartphone, Banknote, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

//todo: remove mock functionality
const mockSalesData = [
  { date: "05/10", value: 8234 },
  { date: "06/10", value: 9845 },
  { date: "07/10", value: 7621 },
  { date: "08/10", value: 11234 },
  { date: "09/10", value: 10987 },
  { date: "10/10", value: 13450 },
  { date: "11/10", value: 12450 },
];

const mockTopProducts: any[] = [];

// Mock data for products sold by period
const mockPeriodProducts = [
  {
    id: 1,
    name: "Produto Exemplo A",
    total: 1500.00,
    credit: 800.00,
    debit: 400.00,
    pix: 200.00,
    cash: 100.00,
  },
  {
    id: 2,
    name: "Produto Exemplo B",
    total: 2300.00,
    credit: 1200.00,
    debit: 600.00,
    pix: 300.00,
    cash: 200.00,
  },
];

export default function Reports() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [password, setPassword] = useState("");
  const [showPeriodDialog, setShowPeriodDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<{ start: string; end: string } | null>(null);

  const handleUnlock = () => {
    if (password === "admin") {
      setIsUnlocked(true);
      setShowPasswordDialog(false);
    }
  };

  const handleClose = () => {
    setLocation("/");
  };

  const handleSelectPeriod = () => {
    setShowPeriodDialog(true);
  };

  const handleApplyPeriod = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Erro",
        description: "Selecione as datas de início e fim",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Erro",
        description: "Data inicial não pode ser maior que data final",
        variant: "destructive",
      });
      return;
    }

    setSelectedPeriod({ start: startDate, end: endDate });
    setShowPeriodDialog(false);
    
    toast({
      title: "Período atualizado",
      description: `${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`,
    });
  };

  const handleExport = () => {
    // Gerar CSV com os dados do relatório
    const csvData = [
      ['Produto', 'Quantidade', 'Receita'],
      ...mockTopProducts.map(p => [p.name, p.qty, p.revenue.toFixed(2)])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório exportado",
      description: "O arquivo CSV foi baixado com sucesso",
    });
  };

  if (!isUnlocked) {
    return (
      <Dialog open={showPasswordDialog} onOpenChange={handleClose}>
        <DialogContent data-testid="dialog-password-protection">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Acesso Restrito - Relatórios
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">Digite a senha para acessar os relatórios:</p>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                data-testid="input-reports-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUnlock} data-testid="button-unlock-reports">Acessar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Relatórios</h1>
          <p className="text-muted-foreground">
            {selectedPeriod 
              ? `${new Date(selectedPeriod.start).toLocaleDateString('pt-BR')} até ${new Date(selectedPeriod.end).toLocaleDateString('pt-BR')}`
              : 'Análises e estatísticas de vendas'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSelectPeriod} data-testid="button-select-period">
            <Calendar className="h-4 w-4 mr-2" />
            Selecionar Período
          </Button>
          <Button onClick={handleExport} data-testid="button-export-report">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Diálogo de Seleção de Período */}
      <Dialog open={showPeriodDialog} onOpenChange={setShowPeriodDialog}>
        <DialogContent data-testid="dialog-select-period">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Selecionar Período
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPeriodDialog(false)} data-testid="button-cancel-period">
              Cancelar
            </Button>
            <Button onClick={handleApplyPeriod} data-testid="button-apply-period">
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Produtos Vendidos por Período */}
      {selectedPeriod && (
        <Card data-testid="card-period-products">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Produtos Vendidos no Período - {new Date(selectedPeriod.start).toLocaleDateString('pt-BR')} até {new Date(selectedPeriod.end).toLocaleDateString('pt-BR')}
            </h3>
            {mockPeriodProducts.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">Nenhum produto vendido no período selecionado</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Crédito</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Débito</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Smartphone className="h-3.5 w-3.5" />
                          <span>PIX</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Banknote className="h-3.5 w-3.5" />
                          <span>Dinheiro</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPeriodProducts.map((product) => (
                      <TableRow key={product.id} data-testid={`row-period-product-${product.id}`}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-primary">
                          R$ {product.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-chart-1">
                          R$ {product.credit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-chart-2">
                          R$ {product.debit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-chart-3">
                          R$ {product.pix.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-chart-4">
                          R$ {product.cash.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      )}

      <SalesChart data={mockSalesData} title="Vendas dos últimos 7 dias" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-top-products">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
            {mockTopProducts.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">Nenhum produto vendido no período</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTopProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right font-mono">{product.qty}</TableCell>
                        <TableCell className="text-right font-mono text-primary">
                          R$ {product.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>

        <Card data-testid="card-summary">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Resumo do Período</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Total de Vendas</span>
                <span className="font-bold font-mono text-xl text-primary">
                  R$ 0,00
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Total de Transações</span>
                <span className="font-bold font-mono text-xl">
                  0
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span className="font-bold font-mono text-xl">
                  R$ 0,00
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Produtos Vendidos</span>
                <span className="font-bold font-mono text-xl">
                  0
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card data-testid="card-monthly-closure">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fechamento Mensal - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-chart-1" />
                  <p className="text-sm text-muted-foreground font-medium">Crédito</p>
                </div>
                <p className="text-2xl font-bold font-mono">R$ 0,00</p>
                <p className="text-xs text-muted-foreground mt-1">0% do total</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-chart-2" />
                  <p className="text-sm text-muted-foreground font-medium">Débito</p>
                </div>
                <p className="text-2xl font-bold font-mono">R$ 0,00</p>
                <p className="text-xs text-muted-foreground mt-1">0% do total</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-4 w-4 text-chart-3" />
                  <p className="text-sm text-muted-foreground font-medium">PIX</p>
                </div>
                <p className="text-2xl font-bold font-mono">R$ 0,00</p>
                <p className="text-xs text-muted-foreground mt-1">0% do total</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="h-4 w-4 text-chart-4" />
                  <p className="text-sm text-muted-foreground font-medium">Dinheiro</p>
                </div>
                <p className="text-2xl font-bold font-mono">R$ 0,00</p>
                <p className="text-xs text-muted-foreground mt-1">0% do total</p>
              </div>
            </Card>
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total do Mês:</span>
                <span className="text-3xl font-bold font-mono text-primary" data-testid="text-monthly-total">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-base font-medium text-muted-foreground">Lucro Total:</span>
                <span className="text-2xl font-bold font-mono text-green-600 dark:text-green-400" data-testid="text-total-profit">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-muted-foreground">Margem de Lucro:</span>
                <span className="text-2xl font-bold font-mono text-green-600 dark:text-green-400" data-testid="text-profit-margin">0%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
