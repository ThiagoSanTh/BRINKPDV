import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Eye, Pencil, Trash2, Users, DollarSign } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialSalespersons: any[] = [];

export default function Salespersons() {
  const { toast } = useToast();
  const [salespersons, setSalespersons] = useState(initialSalespersons);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState<typeof initialSalespersons[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    commission: "",
    entryDate: "",
  });

  const filteredSalespersons = salespersons.filter(sp =>
    sp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.phone.includes(searchTerm)
  );

  const activeSalespersons = salespersons.filter(sp => sp.active);
  const totalCommissionPaid = salespersons.reduce((sum, sp) => 
    sum + (sp.totalSales * sp.commission / 100), 0
  );

  const handleNewSalesperson = () => {
    console.log("Creating new salesperson:", formData);
    
    if (!formData.name || !formData.email || !formData.commission) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha: Nome, E-mail e Comissão",
        variant: "destructive",
      });
      return;
    }

    const newId = `VEN${String(salespersons.length + 1).padStart(3, '0')}`;
    const today = new Date().toLocaleDateString('pt-BR');
    
    const newSalesperson = {
      id: newId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      commission: parseFloat(formData.commission),
      entryDate: formData.entryDate ? new Date(formData.entryDate).toLocaleDateString('pt-BR') : today,
      active: true,
      totalSales: 0,
    };

    setSalespersons(prev => [...prev, newSalesperson]);
    
    toast({
      title: "Vendedor cadastrado!",
      description: `${formData.name} foi adicionado com sucesso`,
    });
    
    setShowNewDialog(false);
    setFormData({ name: "", email: "", phone: "", commission: "", entryDate: "" });
  };

  const handleEdit = (salesperson: typeof initialSalespersons[0]) => {
    setSelectedSalesperson(salesperson);
    setFormData({
      name: salesperson.name,
      email: salesperson.email,
      phone: salesperson.phone,
      commission: salesperson.commission.toString(),
      entryDate: salesperson.entryDate,
    });
    setShowEditDialog(true);
  };

  const handleUpdateSalesperson = () => {
    console.log("Updating salesperson:", selectedSalesperson?.id, formData);
    
    if (!formData.name || !formData.email || !formData.commission) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha: Nome, E-mail e Comissão",
        variant: "destructive",
      });
      return;
    }

    setSalespersons(prev => prev.map(sp => 
      sp.id === selectedSalesperson?.id 
        ? {
            ...sp,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            commission: parseFloat(formData.commission),
            entryDate: formData.entryDate ? new Date(formData.entryDate).toLocaleDateString('pt-BR') : sp.entryDate,
          }
        : sp
    ));

    toast({
      title: "Vendedor atualizado!",
      description: `${formData.name} foi atualizado com sucesso`,
    });
    
    setShowEditDialog(false);
    setFormData({ name: "", email: "", phone: "", commission: "", entryDate: "" });
    setSelectedSalesperson(null);
  };

  const handleDelete = (salesperson: typeof initialSalespersons[0]) => {
    setSelectedSalesperson(salesperson);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    console.log("Deleting salesperson:", selectedSalesperson?.id);
    
    setSalespersons(prev => prev.filter(sp => sp.id !== selectedSalesperson?.id));
    
    toast({
      title: "Vendedor removido",
      description: `${selectedSalesperson?.name} foi removido do sistema`,
    });
    
    setShowDeleteDialog(false);
    setSelectedSalesperson(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Vendedores</h1>
          <p className="text-muted-foreground">
            Gerenciar vendedores e comissões
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} data-testid="button-new-salesperson">
          <Plus className="h-4 w-4 mr-2" />
          Novo Vendedor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Total de Vendedores
            </p>
            <p className="text-2xl font-bold font-mono">{salespersons.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Vendedores Ativos
            </p>
            <p className="text-2xl font-bold font-mono text-chart-2">
              {activeSalespersons.length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Comissões Pagas
            </p>
            <p className="text-2xl font-bold font-mono text-primary">
              R$ {totalCommissionPaid.toFixed(2)}
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
                placeholder="Buscar por nome, e-mail ou telefone..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-salesperson-search"
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Comissão (%)</TableHead>
                  <TableHead className="text-right">Vendas Totais</TableHead>
                  <TableHead className="text-right">Comissão a Receber</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalespersons.map((salesperson) => (
                  <TableRow key={salesperson.id} data-testid={`row-salesperson-${salesperson.id}`}>
                    <TableCell className="font-medium">{salesperson.name}</TableCell>
                    <TableCell className="text-muted-foreground">{salesperson.email}</TableCell>
                    <TableCell className="text-muted-foreground">{salesperson.phone}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {salesperson.commission.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      R$ {salesperson.totalSales.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
                      R$ {(salesperson.totalSales * salesperson.commission / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{salesperson.entryDate}</TableCell>
                    <TableCell>
                      <Badge variant={salesperson.active ? "default" : "secondary"}>
                        {salesperson.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEdit(salesperson)}
                          data-testid={`button-edit-${salesperson.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleDelete(salesperson)}
                          data-testid={`button-delete-${salesperson.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSalespersons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhum vendedor encontrado</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent data-testid="dialog-new-salesperson">
          <DialogHeader>
            <DialogTitle>Novo Vendedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Nome do vendedor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-name"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="input-phone"
              />
            </div>
            <div>
              <Label htmlFor="commission">Comissão (%)</Label>
              <Input
                id="commission"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ex: 5.0"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                data-testid="input-commission"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentual de comissão sobre vendas
              </p>
            </div>
            <div>
              <Label htmlFor="entry-date">Data de Entrada</Label>
              <Input
                id="entry-date"
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                data-testid="input-entry-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNewSalesperson} data-testid="button-save-salesperson">
              Salvar Vendedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent data-testid="dialog-edit-salesperson">
          <DialogHeader>
            <DialogTitle>Editar Vendedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nome Completo</Label>
              <Input
                id="edit-name"
                placeholder="Nome do vendedor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-edit-name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-edit-email"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="input-edit-phone"
              />
            </div>
            <div>
              <Label htmlFor="edit-commission">Comissão (%)</Label>
              <Input
                id="edit-commission"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ex: 5.0"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                data-testid="input-edit-commission"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentual de comissão sobre vendas
              </p>
            </div>
            <div>
              <Label htmlFor="edit-entry-date">Data de Entrada</Label>
              <Input
                id="edit-entry-date"
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                data-testid="input-edit-entry-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateSalesperson} data-testid="button-update-salesperson">
              Atualizar Vendedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="dialog-delete-salesperson">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o vendedor <strong>{selectedSalesperson?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
