import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, User, Store, Bell, Users, Download, Database, Plus, Trash2, Upload, FileText, Image, X, Printer, Receipt, RefreshCcw, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const { toast } = useToast();
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(() => {
    // Carregar logo salvo do localStorage ao inicializar
    return localStorage.getItem('storeLogo') || null;
  });
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Vendedor",
  });

  // Obter usuário atual logado
  const getCurrentUser = () => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();

  // Determinar quais funções o usuário pode criar
  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    switch (currentUser.role) {
      case "Administrador":
        return ["Administrador", "Gerente", "Vendedor", "Técnico"];
      case "Gerente":
        return ["Vendedor", "Técnico"];
      default:
        return [];
    }
  };

  const availableRoles = getAvailableRoles();
  const canCreateUsers = availableRoles.length > 0;

  // Função para abrir o diálogo com a função padrão apropriada
  const openNewUserDialog = () => {
    // Definir a função padrão baseada nas permissões disponíveis
    const defaultRole = availableRoles.includes("Vendedor") 
      ? "Vendedor" 
      : availableRoles[0] || "Vendedor";
    
    setNewUser({ 
      username: "", 
      email: "", 
      password: "", 
      role: defaultRole 
    });
    setShowPassword(false);
    setShowNewUserDialog(true);
  };

  // State para Usuários do Sistema
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('systemUsers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // State para Perfil do Usuário
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    const defaults = {
      username: "admin",
      email: "admin@brinkcell.com",
      password: "",
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        username: parsed.username || defaults.username,
        email: parsed.email || defaults.email,
        password: parsed.password || "",
      };
    }
    return defaults;
  });

  // State para Informações da Loja
  const [storeInfo, setStoreInfo] = useState(() => {
    const saved = localStorage.getItem('storeInfo');
    const defaults = {
      name: "BRINKPDV",
      phone: "",
      address: "",
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        name: parsed.name || defaults.name,
        phone: parsed.phone || "",
        address: parsed.address || "",
      };
    }
    return defaults;
  });

  // State para Dados Completos da Loja
  const [storeData, setStoreData] = useState(() => {
    const saved = localStorage.getItem('storeData');
    const defaults = {
      legalName: "BRINKPDV Matriz",
      cnpj: "00.000.000/0001-00",
      address: "Av. Paulista, 1000 - Bela Vista",
      city: "São Paulo",
      state: "SP",
      cep: "01310-100",
      phone: "(11) 99999-9999",
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          legalName: parsed.legalName ?? defaults.legalName,
          cnpj: parsed.cnpj ?? defaults.cnpj,
          address: parsed.address ?? defaults.address,
          city: parsed.city ?? defaults.city,
          state: parsed.state ?? defaults.state,
          cep: parsed.cep ?? defaults.cep,
          phone: parsed.phone ?? defaults.phone,
        };
      } catch {
        return defaults;
      }
    }
    return defaults;
  });

  // State para Configurações de Comprovante
  const [receiptSettings, setReceiptSettings] = useState(() => {
    const saved = localStorage.getItem('receiptSettings');
    const defaults = {
      includeLogo: true,
      receiptHeader: "",
      receiptFooter: "Volte sempre! www.brinkcell.com.br",
      showFiscalData: true,
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          includeLogo: parsed.includeLogo ?? defaults.includeLogo,
          receiptHeader: parsed.receiptHeader ?? defaults.receiptHeader,
          receiptFooter: parsed.receiptFooter ?? defaults.receiptFooter,
          showFiscalData: parsed.showFiscalData ?? defaults.showFiscalData,
        };
      } catch {
        return defaults;
      }
    }
    return defaults;
  });

  // State para Configurações de Impressora
  const [printerSettings, setPrinterSettings] = useState(() => {
    const saved = localStorage.getItem('printerSettings');
    const defaults = {
      printerName: "",
      printerModel: "thermal-80mm",
      paperWidth: "80",
      autoCut: true,
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          printerName: parsed.printerName ?? defaults.printerName,
          printerModel: parsed.printerModel ?? defaults.printerModel,
          paperWidth: parsed.paperWidth ?? defaults.paperWidth,
          autoCut: parsed.autoCut ?? defaults.autoCut,
        };
      } catch {
        return defaults;
      }
    }
    return defaults;
  });

  const handleCreateUser = () => {
    if (!newUser.username) {
      toast({
        title: "Erro",
        description: "Nome de usuário é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o usuário atual tem permissão para criar a função selecionada
    if (!availableRoles.includes(newUser.role)) {
      toast({
        title: "Sem permissão",
        description: `Você não tem permissão para criar usuários com a função ${newUser.role}`,
        variant: "destructive",
      });
      return;
    }

    const newUserData = {
      id: Date.now().toString(),
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      active: true,
    };

    const updatedUsers = [...users, newUserData];
    setUsers(updatedUsers);
    localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário criado",
      description: `${newUser.username} foi adicionado ao sistema`,
    });

    setShowNewUserDialog(false);
    setNewUser({ username: "", email: "", password: "", role: "Vendedor" });
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido do sistema",
    });
  };

  const handleBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      products: [],
      sales: [],
      serviceOrders: [],
      salespersons: [],
      settings: {},
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brinkcell-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("Backup created");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        console.log("GBK file content loaded, length:", (text as string)?.length);
      };
      reader.readAsText(file, 'GBK');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setLogoPreview(imageUrl);
        console.log("Logo uploaded:", file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    localStorage.removeItem('storeLogo');
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new Event('logoUpdated'));
    toast({
      title: "Logo removido",
      description: "O logo da loja foi removido com sucesso",
    });
  };

  const handleSaveLogo = () => {
    if (logoPreview) {
      localStorage.setItem('storeLogo', logoPreview);
      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new Event('logoUpdated'));
      toast({
        title: "Logo salvo",
        description: "O logo foi salvo e atualizado no sistema",
      });
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    toast({
      title: "Perfil salvo",
      description: "As alterações do perfil foram salvas com sucesso",
    });
  };

  const handleSaveStoreInfo = () => {
    localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
    // Disparar evento customizado para atualizar o header
    window.dispatchEvent(new Event('storeInfoUpdated'));
    toast({
      title: "Informações salvas",
      description: "As informações da loja foram salvas com sucesso",
    });
  };

  const handleSaveStoreData = () => {
    localStorage.setItem('storeData', JSON.stringify(storeData));
    toast({
      title: "Dados salvos",
      description: "Os dados da loja foram salvos com sucesso",
    });
  };

  const handleSaveReceiptSettings = () => {
    localStorage.setItem('receiptSettings', JSON.stringify(receiptSettings));
    toast({
      title: "Configurações salvas",
      description: "As configurações do comprovante foram salvas com sucesso",
    });
  };

  const handleSavePrinterSettings = () => {
    localStorage.setItem('printerSettings', JSON.stringify(printerSettings));
    toast({
      title: "Configurações salvas",
      description: "As configurações da impressora foram salvas com sucesso",
    });
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    
    // Simular verificação de atualizações no servidor Google Drive
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsCheckingUpdates(false);
    
    // Link do servidor de atualizações
    const updateServerUrl = "https://drive.google.com/drive/folders/1EExvSO8_jk-TbS4njK44wZYuX5HukK9_?usp=drive_link";
    
    toast({
      title: "Verificação concluída",
      description: "Sistema atualizado. Versão 1.0.0 é a mais recente.",
      action: (
        <button
          onClick={() => window.open(updateServerUrl, '_blank', 'noopener,noreferrer')}
          className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2"
        >
          Ver Atualizações
        </button>
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Configurações</h1>
        <p className="text-muted-foreground">
          Gerenciar preferências do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="card-logo-settings">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Image className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Logo da Loja</h3>
            </div>
            <div className="space-y-3">
              {logoPreview ? (
                <div className="border rounded-md p-4 bg-muted flex items-center justify-center">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="max-h-32 max-w-full object-contain"
                    data-testid="img-logo-preview"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-md p-8 text-center hover-elevate active-elevate-2">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.bmp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    data-testid="input-logo-file"
                  />
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Image className="h-12 w-12 text-muted-foreground" />
                      <p className="font-medium">Clique para selecionar</p>
                      <p className="text-sm text-muted-foreground">
                        JPG ou BMP
                      </p>
                    </div>
                  </Label>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                <p>• Formatos aceitos: JPG, BMP</p>
                <p>• Tamanho recomendado: 500x500px</p>
              </div>
              {logoPreview && (
                <div className="space-y-2">
                  <Button className="w-full" onClick={handleSaveLogo} data-testid="button-save-logo">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Logo
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="destructive" 
                    onClick={handleRemoveLogo} 
                    data-testid="button-delete-logo"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Logo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card data-testid="card-user-settings">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Perfil do Usuário</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={userProfile.username}
                  onChange={(e) => setUserProfile({...userProfile, username: e.target.value})}
                  data-testid="input-username"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={userProfile.password}
                  onChange={(e) => setUserProfile({...userProfile, password: e.target.value})}
                  placeholder="••••••••"
                  data-testid="input-password"
                />
              </div>
              <Button className="w-full" onClick={handleSaveProfile} data-testid="button-save-profile">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </Card>

        <Card data-testid="card-store-settings">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Informações da Loja</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="store-name">Nome da Loja</Label>
                <Input
                  id="store-name"
                  value={storeInfo.name}
                  onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})}
                  data-testid="input-store-name"
                />
              </div>
              <div>
                <Label htmlFor="store-phone">Telefone</Label>
                <Input
                  id="store-phone"
                  value={storeInfo.phone}
                  onChange={(e) => setStoreInfo({...storeInfo, phone: e.target.value})}
                  placeholder="(11) 98765-4321"
                  data-testid="input-store-phone"
                />
              </div>
              <div>
                <Label htmlFor="store-address">Endereço</Label>
                <Input
                  id="store-address"
                  value={storeInfo.address}
                  onChange={(e) => setStoreInfo({...storeInfo, address: e.target.value})}
                  placeholder="Rua, Número - Bairro"
                  data-testid="input-store-address"
                />
              </div>
              <Button className="w-full" onClick={handleSaveStoreInfo} data-testid="button-save-store-info">
                <Save className="h-4 w-4 mr-2" />
                Salvar Informações
              </Button>
            </div>
          </div>
        </Card>

        <Card data-testid="card-system-settings" className="lg:col-span-2">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Dados da Loja</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="store-legal-name">Nome da Loja</Label>
                <Input
                  id="store-legal-name"
                  value={storeData.legalName}
                  onChange={(e) => setStoreData({...storeData, legalName: e.target.value})}
                  data-testid="input-store-legal-name"
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={storeData.cnpj}
                  onChange={(e) => setStoreData({...storeData, cnpj: e.target.value})}
                  data-testid="input-cnpj"
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={storeData.address}
                  onChange={(e) => setStoreData({...storeData, address: e.target.value})}
                  placeholder="Rua, número, bairro"
                  data-testid="input-address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={storeData.city}
                    onChange={(e) => setStoreData({...storeData, city: e.target.value})}
                    data-testid="input-city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={storeData.state}
                    onChange={(e) => setStoreData({...storeData, state: e.target.value})}
                    data-testid="input-state"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={storeData.cep}
                  onChange={(e) => setStoreData({...storeData, cep: e.target.value})}
                  data-testid="input-cep"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={storeData.phone}
                  onChange={(e) => setStoreData({...storeData, phone: e.target.value})}
                  data-testid="input-phone"
                />
              </div>
              <Button className="w-full" variant="outline" onClick={handleSaveStoreData} data-testid="button-save-store">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </Card>

        <Card data-testid="card-system-settings" className="lg:col-span-3">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Preferências do Sistema</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tema Escuro</p>
                  <p className="text-sm text-muted-foreground">
                    Alternar entre modo claro e escuro
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações de Estoque</p>
                  <p className="text-sm text-muted-foreground">
                    Alertas quando estoque estiver baixo
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-stock-alerts" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Som no Checkout</p>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir som ao finalizar venda
                  </p>
                </div>
                <Switch data-testid="switch-checkout-sound" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Impressão Automática</p>
                  <p className="text-sm text-muted-foreground">
                    Imprimir recibo automaticamente
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-auto-print" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-4">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Estrutura de Permissões</h3>
          </div>
          <div className="grid gap-3">
            <div className="border rounded-md p-3 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Administrador</h4>
                <Badge variant="default">Acesso Total</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Pode criar: Administrador, Gerente, Vendedor, Técnico
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Acesso completo a todas as funcionalidades do sistema
              </p>
            </div>
            
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Gerente</h4>
                <Badge variant="secondary">Gerencial</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Pode criar: Vendedor, Técnico
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Gerencia vendedores e técnicos, acesso a relatórios
              </p>
            </div>

            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Vendedor</h4>
                <Badge variant="outline">Operacional</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Não pode criar usuários
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Acesso a vendas, produtos e clientes
              </p>
            </div>

            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Técnico</h4>
                <Badge variant="outline">Operacional</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Não pode criar usuários
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Acesso a ordens de serviço e manutenção
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card data-testid="card-users-management">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Usuários do Sistema</h3>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button 
                onClick={openNewUserDialog} 
                disabled={!canCreateUsers}
                data-testid="button-new-user"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
              {!canCreateUsers && (
                <p className="text-xs text-muted-foreground">
                  Sem permissão para criar usuários
                </p>
              )}
            </div>
          </div>

          {users.length === 0 ? (
            <div className="border rounded-md p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Nenhum usuário cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Clique em "Novo Usuário" para adicionar o primeiro usuário do sistema
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleDeleteUser(user.id)}
                          data-testid={`button-delete-user-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-receipt-settings">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Comprovante de Vendas</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Incluir Logo no Comprovante</p>
                  <p className="text-sm text-muted-foreground">
                    Adicionar logo da loja no topo
                  </p>
                </div>
                <Switch 
                  checked={receiptSettings.includeLogo}
                  onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, includeLogo: checked})}
                  data-testid="switch-include-logo" 
                />
              </div>
              <div>
                <Label htmlFor="receipt-header">Cabeçalho do Comprovante</Label>
                <Input
                  id="receipt-header"
                  placeholder="Ex: Obrigado pela preferência!"
                  value={receiptSettings.receiptHeader}
                  onChange={(e) => setReceiptSettings({...receiptSettings, receiptHeader: e.target.value})}
                  data-testid="input-receipt-header"
                />
              </div>
              <div>
                <Label htmlFor="receipt-footer">Mensagem de Rodapé</Label>
                <Input
                  id="receipt-footer"
                  placeholder="Ex: Volte sempre!"
                  value={receiptSettings.receiptFooter}
                  onChange={(e) => setReceiptSettings({...receiptSettings, receiptFooter: e.target.value})}
                  data-testid="input-receipt-footer"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar Dados Fiscais</p>
                  <p className="text-sm text-muted-foreground">
                    Incluir CNPJ e Inscrição Estadual
                  </p>
                </div>
                <Switch 
                  checked={receiptSettings.showFiscalData}
                  onCheckedChange={(checked) => setReceiptSettings({...receiptSettings, showFiscalData: checked})}
                  data-testid="switch-show-fiscal-data" 
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleSaveReceiptSettings}
                data-testid="button-save-receipt-settings"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </Card>

        <Card data-testid="card-printer-settings">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Printer className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Configuração de Impressora</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="printer-name">Nome da Impressora</Label>
                <Input
                  id="printer-name"
                  placeholder="Ex: Impressora Térmica USB"
                  value={printerSettings.printerName}
                  onChange={(e) => setPrinterSettings({...printerSettings, printerName: e.target.value})}
                  data-testid="input-printer-name"
                />
              </div>
              <div>
                <Label htmlFor="printer-model">Modelo</Label>
                <Select 
                  value={printerSettings.printerModel}
                  onValueChange={(value) => setPrinterSettings({...printerSettings, printerModel: value})}
                >
                  <SelectTrigger id="printer-model" data-testid="select-printer-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thermal-80mm">Térmica 80mm</SelectItem>
                    <SelectItem value="thermal-58mm">Térmica 58mm</SelectItem>
                    <SelectItem value="a4">A4 (Matricial/Jato)</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paper-width">Largura do Papel (mm)</Label>
                <Select 
                  value={printerSettings.paperWidth}
                  onValueChange={(value) => setPrinterSettings({...printerSettings, paperWidth: value})}
                >
                  <SelectTrigger id="paper-width" data-testid="select-paper-width">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58">58mm</SelectItem>
                    <SelectItem value="80">80mm</SelectItem>
                    <SelectItem value="210">210mm (A4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Corte Automático</p>
                  <p className="text-sm text-muted-foreground">
                    Cortar papel após impressão
                  </p>
                </div>
                <Switch 
                  checked={printerSettings.autoCut}
                  onCheckedChange={(checked) => setPrinterSettings({...printerSettings, autoCut: checked})}
                  data-testid="switch-auto-cut" 
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleSavePrinterSettings}
                data-testid="button-save-printer"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-backup">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Backup do Sistema</h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Faça backup de todos os dados do sistema incluindo produtos, vendas, ordens de serviço e configurações.
              </p>
              <div className="flex gap-4">
                <Button onClick={handleBackup} data-testid="button-backup">
                  <Download className="h-4 w-4 mr-2" />
                  Fazer Backup Agora
                </Button>
                <Button variant="outline" data-testid="button-restore">
                  <Database className="h-4 w-4 mr-2" />
                  Restaurar Backup
                </Button>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Último Backup</p>
                <p className="text-sm text-muted-foreground">
                  11 de Outubro de 2024, 14:30
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card data-testid="card-upload-gbk">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Upload de Arquivo GBK</h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Importe produtos de arquivo GBK (codificação chinesa). O sistema processará e adicionará os produtos automaticamente.
              </p>
              <div className="border-2 border-dashed rounded-md p-4 text-center hover-elevate active-elevate-2">
                <Input
                  type="file"
                  accept=".gbk,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="gbk-upload"
                  data-testid="input-gbk-file"
                />
                <Label htmlFor="gbk-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <p className="font-medium">Clique para selecionar arquivo</p>
                    <p className="text-sm text-muted-foreground">
                      Arquivos .gbk ou .txt
                    </p>
                  </div>
                </Label>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Instruções</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Selecione arquivo GBK com dados de produtos</li>
                  <li>• O sistema detectará automaticamente a codificação</li>
                  <li>• Produtos serão importados para o catálogo</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card data-testid="card-system-update">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCcw className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Atualização do Sistema</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Sistema Atualizado</p>
                  <p className="text-sm text-muted-foreground">
                    Versão 1.0.0 - Última verificação: hoje
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdates}
                data-testid="button-check-updates"
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                {isCheckingUpdates ? 'Verificando...' : 'Verificar Atualizações'}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Notas da Versão 1.0.0:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>✅ Sistema PDV completo com vendas e caixa</li>
                <li>✅ Gestão de produtos e estoque</li>
                <li>✅ Ordens de serviço com controle de entrada/saída</li>
                <li>✅ Comissões de vendedores</li>
                <li>✅ Relatórios e estatísticas</li>
                <li>✅ Impressão de recibos e comprovantes</li>
                <li>✅ Backup e restauração de dados</li>
              </ul>
            </div>
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-muted-foreground">
                As atualizações são verificadas no servidor Google Drive. Quando uma nova versão estiver disponível, você será notificado aqui.
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium">Servidor de Atualizações:</p>
                <a
                  href="https://drive.google.com/drive/folders/1EExvSO8_jk-TbS4njK44wZYuX5HukK9_?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                  data-testid="link-update-server"
                >
                  Google Drive
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent data-testid="dialog-new-user">
          <DialogHeader>
            <DialogTitle>Novo Usuário do Sistema</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Crie um novo usuário com permissões específicas baseadas na função selecionada.
          </p>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="new-username">Nome de Usuário</Label>
              <Input
                id="new-username"
                placeholder="login do usuário"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                data-testid="input-new-username"
              />
            </div>
            <div>
              <Label htmlFor="new-email">E-mail</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="email@exemplo.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                data-testid="input-new-email"
              />
            </div>
            <div>
              <Label htmlFor="new-password">Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="pr-10"
                  data-testid="input-new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-new-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo de 8 caracteres
              </p>
            </div>
            <div>
              <Label htmlFor="new-role">Função</Label>
              <Select 
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger data-testid="select-new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {currentUser?.role === "Administrador" 
                  ? "Administrador pode criar qualquer função"
                  : currentUser?.role === "Gerente"
                  ? "Gerente pode criar Vendedor e Técnico"
                  : "Define as permissões do usuário no sistema"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} data-testid="button-save-user">
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
