import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { CartItem } from "@/components/CartItem";
import { Search, CreditCard, Barcode, Package, Plus, List, Grid3x3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockProducts: any[] = [];
const mockSalespersons: any[] = [];

interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showObservationDialog, setShowObservationDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [observation, setObservation] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedSalesperson, setSelectedSalesperson] = useState("");

  // Extrair categorias únicas dos produtos
  const categories = ["all", ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBarcode = barcodeSearch 
      ? p.barcode?.includes(barcodeSearch) 
      : true;
    
    const matchesCategory = selectedCategory === "all" 
      ? true 
      : p.category === selectedCategory;

    return matchesSearch && matchesBarcode && matchesCategory;
  });

  const handleAddToCart = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const handleIncrement = (id: string) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrement = (id: string) => {
    setCart(cart.map(item =>
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const handleRemove = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowObservationDialog(true);
  };

  const handleProceedToPayment = () => {
    setShowObservationDialog(false);
    setShowPaymentDialog(true);
  };

  const handlePayment = () => {
    console.log("Payment processed", { 
      paymentMethod, 
      observation, 
      salesperson: mockSalespersons.find(s => s.id === selectedSalesperson)?.name 
    });
    setCart([]);
    setShowPaymentDialog(false);
    setShowObservationDialog(false);
    setPaymentAmount("");
    setPaymentMethod("dinheiro");
    setObservation("");
    setSelectedSalesperson("");
  };

  const change = paymentAmount ? parseFloat(paymentAmount) - total : 0;

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">PDV / Ponto de Venda</h1>
          <p className="text-muted-foreground">Selecione produtos para adicionar à venda</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <Label htmlFor="salesperson-select" className="text-sm font-medium whitespace-nowrap">
            Vendedor:
          </Label>
          <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
            <SelectTrigger id="salesperson-select" className="w-full sm:w-64" data-testid="select-salesperson">
              <SelectValue placeholder="Selecione o vendedor" />
            </SelectTrigger>
            <SelectContent>
              {mockSalespersons.map((salesperson) => (
                <SelectItem key={salesperson.id} value={salesperson.id}>
                  {salesperson.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos por nome ou categoria..."
                className="pl-9 pr-20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-product-search"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                  onClick={() => setSearchTerm("")}
                  data-testid="button-clear-search"
                >
                  Limpar
                </Button>
              )}
            </div>
            <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} data-testid="button-toggle-view">
              {viewMode === "grid" ? <List className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código de barras..."
                className="pl-9 pr-20"
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                data-testid="input-barcode-search"
              />
              {barcodeSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                  onClick={() => setBarcodeSearch("")}
                  data-testid="button-clear-barcode"
                >
                  Limpar
                </Button>
              )}
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48" data-testid="select-category-filter">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.filter(c => c !== "all").map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || barcodeSearch || selectedCategory !== "all") && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" data-testid="badge-search-results">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </Badge>
              {filteredProducts.length === 0 && (
                <span className="text-muted-foreground">
                  com os filtros aplicados
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 ml-auto"
                onClick={() => {
                  setSearchTerm("");
                  setBarcodeSearch("");
                  setSelectedCategory("all");
                }}
                data-testid="button-clear-all-filters"
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">Nenhum produto cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Cadastre produtos na seção "Produtos" para começar a vender
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">R$ {product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {product.stock < 10 ? (
                          <Badge variant="destructive">{product.stock}</Badge>
                        ) : (
                          <span className="text-muted-foreground">{product.stock}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => handleAddToCart(product.id)} data-testid={`button-add-${product.id}`}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      <Card className="w-96 flex flex-col" data-testid="card-shopping-cart">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Carrinho</h2>
          <p className="text-sm text-muted-foreground">
            {cart.length} {cart.length === 1 ? "item" : "itens"}
          </p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground">Carrinho vazio</p>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione produtos para iniciar a venda
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="font-mono text-primary" data-testid="text-cart-total">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              data-testid="button-checkout"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Finalizar Venda
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={showObservationDialog} onOpenChange={setShowObservationDialog}>
        <DialogContent data-testid="dialog-observation">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="payment-method">Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method" data-testid="select-payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                  <SelectItem value="debito">Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="observation">Observações (opcional)</Label>
              <Textarea
                id="observation"
                placeholder="Digite observações sobre a venda..."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="resize-none"
                rows={4}
                data-testid="textarea-observation"
              />
            </div>
            <div className="flex justify-between text-lg pt-2 border-t">
              <span className="font-semibold">Total:</span>
              <span className="font-bold font-mono text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowObservationDialog(false)}
              data-testid="button-cancel-observation"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProceedToPayment}
              data-testid="button-proceed-payment"
            >
              Prosseguir para Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent data-testid="dialog-payment">
          <DialogHeader>
            <DialogTitle>Finalizar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forma de Pagamento:</span>
                <span className="font-semibold capitalize">{paymentMethod}</span>
              </div>
              {observation && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Observação:</span>
                  <span className="text-sm">{observation}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-lg border-t pt-2">
              <span>Total a Pagar:</span>
              <span className="font-bold font-mono text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
            {paymentMethod === "dinheiro" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Valor Recebido
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="text-lg font-mono"
                    data-testid="input-payment-amount"
                  />
                </div>
                {change >= 0 && paymentAmount && (
                  <div className="flex justify-between text-lg">
                    <span>Troco:</span>
                    <span className="font-bold font-mono text-chart-2" data-testid="text-change">
                      R$ {change.toFixed(2)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentDialog(false);
                setShowObservationDialog(true);
              }}
              data-testid="button-back-to-observation"
            >
              Voltar
            </Button>
            <Button
              onClick={handlePayment}
              disabled={paymentMethod === "dinheiro" && (!paymentAmount || parseFloat(paymentAmount) < total)}
              data-testid="button-confirm-payment"
            >
              Confirmar e Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
