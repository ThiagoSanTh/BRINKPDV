import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, User, Store, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verificar credenciais nos usuários cadastrados
    const savedUsers = localStorage.getItem('systemUsers');
    let users = [];
    
    if (savedUsers) {
      try {
        users = JSON.parse(savedUsers);
      } catch {
        users = [];
      }
    }

    // Credenciais padrão de administrador
    const defaultAdmin = {
      username: "admin",
      password: "admin",
      role: "Administrador"
    };

    // Verificar se é o admin padrão ou um usuário cadastrado
    const user = users.find((u: any) => 
      u.username === username && u.password === password && u.active
    );

    const isDefaultAdmin = username === defaultAdmin.username && 
                           password === defaultAdmin.password;

    if (user || isDefaultAdmin) {
      const loggedUser = user || defaultAdmin;
      
      // Salvar sessão
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify({
        username: loggedUser.username,
        role: loggedUser.role
      }));

      // Disparar evento customizado para notificar o App.tsx
      window.dispatchEvent(new Event('authChanged'));

      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${loggedUser.username}!`,
      });

      setLocation("/");
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Usuário ou senha inválidos",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-center">BRINKPDV</h1>
            <p className="text-muted-foreground text-center mt-2">
              Sistema de Ponto de Venda
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Acesso padrão:</strong>
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Usuário: <code className="font-mono">admin</code> • Senha: <code className="font-mono">admin</code>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
