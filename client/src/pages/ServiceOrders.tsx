import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Eye, Pencil, Trash2, Wrench, Printer, Share2, CheckCircle } from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/sales";

interface ServiceOrderRecord {
  id: string;
  orderNumber: string;
  customer: string;
  customerContact: string;
  serial?: string | null;
  device: string;
  issue: string;
  status: string;
  priority: string;
  value: number;
  date: string;
  deadline: string;
  exitDate?: string | null;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Orçamento": "outline",
  "Em andamento": "default",
  "Aguardando peças": "secondary",
  "Concluída": "secondary",
  "Cancelada": "destructive",
};

const priorityColors: Record<string, "default" | "secondary" | "destructive"> = {
  "Baixa": "secondary",
  "Média": "default",
  "Alta": "destructive",
};

const formatDate = (value: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("pt-BR");
};

export default function ServiceOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrderRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [customer, setCustomer] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [device, setDevice] = useState("");
  const [serial, setSerial] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("Média");
  const [deadline, setDeadline] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Orçamento");

  const [selectedPrinter, setSelectedPrinter] = useState("default");
  const [printCopies, setPrintCopies] = useState("1");

  const availablePrinters = [
    { id: "default", name: "Impressora Padrão do Sistema" },
    { id: "thermal", name: "Impressora Térmica 80mm" },
    { id: "laser", name: "HP LaserJet Pro" },
    { id: "pdf", name: "Salvar como PDF" },
  ];

  const { data: orders = [], isLoading } = useQuery<ServiceOrderRecord[]>({
    queryKey: ["/api/service-orders"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (payload: Omit<ServiceOrderRecord, "id">) => {
      const response = await apiRequest("POST", "/api/service-orders", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      toast({
        title: "Ordem de Serviço criada!",
        description: "A ordem foi salva com sucesso.",
      });
      setCustomer("");
      setCustomerContact("");
      setDevice("");
      setSerial("");
      setIssue("");
      setPriority("Média");
      setDeadline("");
      setValue("");
      setStatus("Orçamento");
      setShowNewDialog(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar ordem",
        description: "Não foi possível salvar a ordem de serviço.",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ServiceOrderRecord> }) => {
      const response = await apiRequest("PUT", `/api/service-orders/${id}`, payload);
      return response.json();
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      if (selectedOrder?.id === variables.id) {
        setSelectedOrder((current) => current ? { ...current, ...variables.payload } : current);
      }
      toast({
        title: "Ordem atualizada",
        description: "A alteração foi salva com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar ordem",
        description: "Não foi possível salvar a alteração.",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(search) ||
        order.customer.toLowerCase().includes(search) ||
        order.device.toLowerCase().includes(search) ||
        order.issue.toLowerCase().includes(search) ||
        (order.serial ?? "").toLowerCase().includes(search);

      const matchesStatus = statusFilter ? order.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.value || 0), 0), [orders]);

  const handleViewDetails = (order: ServiceOrderRecord) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleNewOrder = () => {
    if (!customer || !device || !issue) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha: Cliente, Aparelho e Defeito",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newId = `OS${String(orders.length + 1).padStart(4, "0")}`;
    const finalDeadline = deadline || today;

    createOrderMutation.mutate({
      orderNumber: newId,
      customer,
      customerContact,
      serial,
      device,
      issue,
      priority,
      status,
      date: today,
      deadline: finalDeadline,
      value: Number(value || 0),
      exitDate: status === "Concluída" ? today : null,
    });
  };

  const handleCompleteOrder = (orderId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    updateOrderMutation.mutate({
      id: orderId,
      payload: {
        status: "Concluída",
        exitDate: today,
      },
    });
  };

  const handleShareWhatsApp = (order: ServiceOrderRecord) => {
    const message = `*BRINKCELL - Ordem de Serviço*%0A%0A` +
      `*OS:* ${order.orderNumber}%0A` +
      `*Cliente:* ${order.customer}%0A` +
      `*Aparelho:* ${order.device}%0A` +
      `*Defeito:* ${order.issue}%0A` +
      `*Status:* ${order.status}%0A` +
      `*Prioridade:* ${order.priority}%0A` +
      `*Valor:* ${formatCurrency(order.value)}%0A` +
      `*Data:* ${formatDate(order.date)}%0A` +
      `*Prazo:* ${formatDate(order.deadline)}` +
      (order.exitDate ? `%0A*Data de Saída:* ${formatDate(order.exitDate)}` : "");

    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleOpenPrintDialog = (order: ServiceOrderRecord) => {
    setSelectedOrder(order);
    setShowPrintDialog(true);
  };

  const handlePrint = () => {
    if (!selectedOrder) return;

    const printer = availablePrinters.find((p) => p.id === selectedPrinter);
    toast({
      title: "Imprimindo OS",
      description: `${selectedOrder.orderNumber} será impresso em: ${printer?.name} (${printCopies} cópia(s))`,
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Ordem de Serviço - ${selectedOrder.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .info { margin: 10px 0; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          .section { margin-top: 20px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BRINKCELL</h1>
          <h2>ORDEM DE SERVIÇO</h2>
          <h3>${selectedOrder.orderNumber}</h3>
        </div>

        <div class="section">
          <div class="info"><span class="label">Cliente:</span> ${selectedOrder.customer}</div>
          <div class="info"><span class="label">Contato:</span> ${selectedOrder.customerContact || "-"}</div>
          <div class="info"><span class="label">Data:</span> ${formatDate(selectedOrder.date)}</div>
          <div class="info"><span class="label">Prazo:</span> ${formatDate(selectedOrder.deadline)}</div>
        </div>

        <div class="section">
          <div class="info"><span class="label">Aparelho:</span> ${selectedOrder.device}</div>
          <div class="info"><span class="label">Série:</span> ${selectedOrder.serial || "-"}</div>
          <div class="info"><span class="label">Defeito:</span> ${selectedOrder.issue}</div>
        </div>

        <div class="section">
          <div class="info"><span class="label">Status:</span> ${selectedOrder.status}</div>
          <div class="info"><span class="label">Prioridade:</span> ${selectedOrder.priority}</div>
          <div class="info"><span class="label">Valor:</span> ${formatCurrency(selectedOrder.value)}</div>
          ${selectedOrder.exitDate ? `<div class="info"><span class="label">Data de Saída:</span> ${formatDate(selectedOrder.exitDate)}</div>` : ""}
        </div>

        <div class="footer">
          <p>_________________________________</p>
          <p>Assinatura do Cliente</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        if (selectedPrinter !== "pdf") {
          setTimeout(() => printWindow.close(), 500);
        }
      }, 250);
    }

    setShowPrintDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerenciar consertos e manutenções</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} data-testid="button-new-service-order">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter(null)} data-testid="card-total-orders">
          <div className="p-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Total {statusFilter === null && "✓"}
            </p>
            <p className="text-2xl font-bold font-mono">{orders.length}</p>
          </div>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("Em andamento")} data-testid="card-in-progress-orders">
          <div className="p-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Em Andamento {statusFilter === "Em andamento" && "✓"}
            </p>
            <p className="text-2xl font-bold font-mono text-primary">
              {orders.filter((o) => o.status === "Em andamento").length}
            </p>
          </div>
        </Card>
        <Card className="cursor-pointer hover-elevate" onClick={() => setStatusFilter("Concluída")} data-testid="card-completed-orders">
          <div className="p-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Concluídas {statusFilter === "Concluída" && "✓"}
            </p>
            <p className="text-2xl font-bold font-mono text-chart-2">
              {orders.filter((o) => o.status === "Concluída").length}
            </p>
          </div>
        </Card>
        <Card data-testid="card-revenue">
          <div className="p-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Receita
            </p>
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente, aparelho ou defeito..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-service-order-search"
              />
            </div>
          </div>

          <div className="border rounded-md">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando ordens de serviço...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Aparelho</TableHead>
                    <TableHead>Defeito</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-service-order-${order.id}`}>
                      <TableCell className="font-mono font-semibold">{order.orderNumber}</TableCell>
                      <TableCell className="font-medium">{order.customer}</TableCell>
                      <TableCell>{order.device}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.issue}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[order.status] || "outline"}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityColors[order.priority] || "default"}>{order.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(order.value)}</TableCell>
                      <TableCell className="text-sm">{formatDate(order.deadline)}</TableCell>
                      <TableCell className="text-sm">
                        {order.exitDate ? (
                          <span className="text-green-600 dark:text-green-500 font-medium">{formatDate(order.exitDate)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleViewDetails(order)} data-testid={`button-view-${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status !== "Concluída" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleCompleteOrder(order.id)}
                              title="Baixar OS"
                              data-testid={`button-complete-${order.id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8" disabled data-testid={`button-edit-${order.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleShareWhatsApp(order)} data-testid={`button-share-${order.id}`}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenPrintDialog(order)} title="Imprimir OS" data-testid={`button-print-${order.id}`}>
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {!isLoading && filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-new-service-order">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Serviço</DialogTitle>
            <DialogDescription>Preencha os dados da ordem de serviço</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="customer">Cliente *</Label>
              <Input id="customer" placeholder="Nome do cliente" value={customer} onChange={(e) => setCustomer(e.target.value)} data-testid="input-customer" />
            </div>
            <div>
              <Label htmlFor="customer-contact">Contato do Cliente</Label>
              <Input id="customer-contact" placeholder="(11) 98765-4321" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} data-testid="input-customer-contact" />
            </div>
            <div>
              <Label htmlFor="device">Aparelho *</Label>
              <Input id="device" placeholder="Ex: Smartphone XYZ" value={device} onChange={(e) => setDevice(e.target.value)} data-testid="input-device" />
            </div>
            <div>
              <Label htmlFor="serial">Número de Série</Label>
              <Input id="serial" placeholder="Número de série" value={serial} onChange={(e) => setSerial(e.target.value)} data-testid="input-serial" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="issue">Defeito Relatado *</Label>
              <Textarea id="issue" placeholder="Descreva o problema..." rows={3} value={issue} onChange={(e) => setIssue(e.target.value)} data-testid="input-issue" />
            </div>
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger data-testid="select-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deadline">Prazo</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} data-testid="input-deadline" />
            </div>
            <div>
              <Label htmlFor="value">Valor Estimado</Label>
              <Input id="value" type="number" step="0.01" placeholder="0.00" value={value} onChange={(e) => setValue(e.target.value)} data-testid="input-value" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orçamento">Orçamento</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Aguardando peças">Aguardando peças</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
            <Button onClick={handleNewOrder} disabled={createOrderMutation.isPending} data-testid="button-save-service-order">
              Salvar Ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-service-order-details">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
            <DialogDescription>Informações completas da ordem de serviço</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Número da OS</p>
                  <p className="font-mono font-bold text-lg">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={statusColors[selectedOrder.status] || "outline"}>{selectedOrder.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contato</p>
                  <p className="font-medium">{selectedOrder.customerContact || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prioridade</p>
                  <Badge variant={priorityColors[selectedOrder.priority] || "default"}>{selectedOrder.priority}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Aparelho</p>
                <p className="font-medium">{selectedOrder.device}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Número de Série</p>
                <p className="font-medium">{selectedOrder.serial || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Defeito Relatado</p>
                <p>{selectedOrder.issue}</p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de Entrada</p>
                  <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prazo</p>
                  <p className="font-medium">{formatDate(selectedOrder.deadline)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de Saída</p>
                  {selectedOrder.exitDate ? (
                    <p className="font-medium text-green-600 dark:text-green-500">{formatDate(selectedOrder.exitDate)}</p>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor</p>
                  <p className="font-bold font-mono text-primary">{formatCurrency(selectedOrder.value)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
            {selectedOrder && selectedOrder.status !== "Concluída" && (
              <Button onClick={() => handleCompleteOrder(selectedOrder.id)} data-testid="button-complete-order">
                <CheckCircle className="h-4 w-4 mr-2" />
                Baixar OS
              </Button>
            )}
            <Button variant="outline" onClick={() => selectedOrder && handleShareWhatsApp(selectedOrder)} data-testid="button-share-whatsapp">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar WhatsApp
            </Button>
            <Button onClick={() => selectedOrder && handleOpenPrintDialog(selectedOrder)} data-testid="button-print-details">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent data-testid="dialog-print">
          <DialogHeader>
            <DialogTitle>Imprimir Ordem de Serviço</DialogTitle>
            <DialogDescription>Selecione a impressora e o número de cópias</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Ordem de Serviço</p>
                <p className="font-mono font-bold text-lg">{selectedOrder.orderNumber}</p>
                <p className="text-sm mt-1">{selectedOrder.customer} - {selectedOrder.device}</p>
              </div>

              <div>
                <Label htmlFor="printer-select">Selecionar Impressora</Label>
                <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                  <SelectTrigger id="printer-select" data-testid="select-printer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availablePrinters.map((printer) => (
                      <SelectItem key={printer.id} value={printer.id}>
                        {printer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="copies">Número de Cópias</Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  max="10"
                  value={printCopies}
                  onChange={(e) => setPrintCopies(e.target.value)}
                  data-testid="input-print-copies"
                />
              </div>

              <div className="p-3 border rounded-md bg-blue-50 dark:bg-blue-950">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Impressora selecionada:</strong> {availablePrinters.find((p) => p.id === selectedPrinter)?.name}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>Cancelar</Button>
            <Button onClick={handlePrint} data-testid="button-confirm-print">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
