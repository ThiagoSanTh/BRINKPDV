import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Pencil, Trash2, Package, Tag, TrendingUp } from "lucide-react";
import { Label } from "@/components/ui/label";
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

const initialProducts: any[] = [];

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof initialProducts[0] | null>(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    costPrice: "",
    stock: "",
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas por categoria
  type CategoryStat = {
    name: string;
    count: number;
    totalValue: number;
    totalStock: number;
  };

  const categoryStats = products.reduce((acc, product) => {
    // Normalizar categoria: trim e primeira letra maiúscula
    const cat = product.category.trim();
    const catKey = cat.toLowerCase();
    
    if (!acc[catKey]) {
      acc[catKey] = {
        name: cat,
        count: 0,
        totalValue: 0,
        totalStock: 0,
      };
    }
    acc[catKey].count += 1;
    acc[catKey].totalValue += product.price * product.stock;
    acc[catKey].totalStock += product.stock;
    return acc;
  }, {} as Record<string, CategoryStat>);

  const categories = (Object.values(categoryStats) as CategoryStat[]).sort((a, b) => b.count - a.count);

  const handleNewProduct = () => {
    if (!formData.sku || !formData.name || !formData.price) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha: SKU, Nome e Preço de Venda",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    const costPrice = formData.costPrice ? parseFloat(formData.costPrice) : 0;

    if (price < 0 || costPrice < 0) {
      toast({
        title: "Valores inválidos",
        description: "Preços não podem ser negativos",
        variant: "destructive",
      });
      return;
    }

    const newProduct = {
      id: `PROD${String(products.length + 1).padStart(3, '0')}`,
      sku: formData.sku,
      name: formData.name,
      category: formData.category || 'Sem Categoria',
      price,
      costPrice,
      stock: formData.stock ? parseInt(formData.stock) : 0,
    };

    setProducts(prev => [...prev, newProduct]);

    toast({
      title: "Produto cadastrado!",
      description: `${formData.name} foi adicionado com sucesso`,
    });

    setShowNewDialog(false);
    setFormData({ sku: "", name: "", category: "", price: "", costPrice: "", stock: "" });
  };

  const handleEdit = (product: typeof initialProducts[0]) => {
    setSelectedProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      costPrice: product.costPrice ? product.costPrice.toString() : "",
      stock: product.stock.toString(),
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = () => {
    if (!formData.sku || !formData.name || !formData.price) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha: SKU, Nome e Preço de Venda",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    const costPrice = formData.costPrice ? parseFloat(formData.costPrice) : 0;

    if (price < 0 || costPrice < 0) {
      toast({
        title: "Valores inválidos",
        description: "Preços não podem ser negativos",
        variant: "destructive",
      });
      return;
    }

    setProducts(prev => prev.map(p =>
      p.id === selectedProduct?.id
        ? {
            ...p,
            sku: formData.sku,
            name: formData.name,
            category: formData.category || 'Sem Categoria',
            price,
            costPrice,
            stock: formData.stock ? parseInt(formData.stock) : 0,
          }
        : p
    ));

    toast({
      title: "Produto atualizado!",
      description: `${formData.name} foi atualizado com sucesso`,
    });

    setShowEditDialog(false);
    setFormData({ sku: "", name: "", category: "", price: "", costPrice: "", stock: "" });
    setSelectedProduct(null);
  };

  const handleDelete = (product: typeof initialProducts[0]) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setProducts(prev => prev.filter(p => p.id !== selectedProduct?.id));

    toast({
      title: "Produto excluído",
      description: `${selectedProduct?.name} foi removido do estoque`,
    });

    setShowDeleteDialog(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Produtos</h1>
          <p className="text-muted-foreground">
            Gerenciar catálogo de produtos
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((category) => (
            <Card key={category.name} className="hover-elevate" data-testid={`card-category-${category.name}`}>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-primary/10">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm flex-1">{category.name}</h3>
                  <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estoque</span>
                    <span className="font-medium">{category.totalStock} un.</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor Total</span>
                    <span className="font-semibold text-primary">
                      R$ {category.totalValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, SKU ou categoria..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-product-search"
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço Custo</TableHead>
                  <TableHead className="text-right">Preço Venda</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const margin = product.costPrice > 0 
                    ? ((product.price - product.costPrice) / product.costPrice * 100)
                    : 0;
                  
                  return (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        R$ {product.costPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        R$ {product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.costPrice > 0 ? (
                          <Badge variant={margin >= 30 ? "default" : margin >= 0 ? "secondary" : "destructive"}>
                            {margin.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.stock < 10 ? (
                          <Badge variant="destructive">{product.stock}</Badge>
                        ) : (
                          <span className="font-medium">{product.stock}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEdit(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDelete(product)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showNewDialog} onOpenChange={(open) => {
        setShowNewDialog(open);
        if (!open) {
          setFormData({ sku: "", name: "", category: "", price: "", costPrice: "", stock: "" });
        }
      }}>
        <DialogContent data-testid="dialog-new-product">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input 
                id="sku" 
                placeholder="ELE-001" 
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                data-testid="input-sku" 
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input 
                id="category" 
                placeholder="Eletrônicos" 
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                data-testid="input-category" 
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input 
                id="name" 
                placeholder="Nome do produto" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-name" 
              />
            </div>
            <div>
              <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
              <Input 
                id="costPrice" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                data-testid="input-cost-price" 
              />
            </div>
            <div>
              <Label htmlFor="price">Preço de Venda (R$) *</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                data-testid="input-price" 
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="stock">Estoque Inicial</Label>
              <Input 
                id="stock" 
                type="number" 
                placeholder="0" 
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                data-testid="input-stock" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
            <Button onClick={handleNewProduct} data-testid="button-save-product">Salvar Produto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) {
          setFormData({ sku: "", name: "", category: "", price: "", costPrice: "", stock: "" });
          setSelectedProduct(null);
        }
      }}>
        <DialogContent data-testid="dialog-edit-product">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="edit-sku">SKU *</Label>
              <Input 
                id="edit-sku" 
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                data-testid="input-edit-sku" 
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Input 
                id="edit-category" 
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                data-testid="input-edit-category" 
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-name">Nome do Produto *</Label>
              <Input 
                id="edit-name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-edit-name" 
              />
            </div>
            <div>
              <Label htmlFor="edit-costPrice">Preço de Custo (R$)</Label>
              <Input 
                id="edit-costPrice" 
                type="number" 
                step="0.01" 
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                data-testid="input-edit-cost-price" 
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Preço de Venda (R$) *</Label>
              <Input 
                id="edit-price" 
                type="number" 
                step="0.01" 
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                data-testid="input-edit-price" 
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-stock">Estoque</Label>
              <Input 
                id="edit-stock" 
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                data-testid="input-edit-stock" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdateProduct} data-testid="button-update-product">Atualizar Produto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="dialog-delete-product">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto <strong>{selectedProduct?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
