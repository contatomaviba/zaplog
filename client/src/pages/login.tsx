import { useState } from "react";
import { useLocation, Redirect } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/AuthContext"; // Importe o useAuth
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// (O schema de registro não é mais necessário aqui, mas pode manter se quiser)

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isAuthenticated } = useAuth(); // Use o contexto
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginFormData) => login(email, password), // Chame a função de login do contexto
    onSuccess: () => {
      toast({ title: "Login realizado com sucesso!" });
      // O redirecionamento agora é automático pelo Router
    },
    onError: (error: any) => {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Se já estiver autenticado, redireciona para o dashboard
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  // ... o resto do seu JSX (a parte visual do formulário) permanece o mesmo
  // Por simplicidade, vou colar o JSX completo abaixo.

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="max-w-md w-full mx-4 shadow-lg">
        <CardContent className="p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Truck className="h-6 w-6 text-white" data-testid="logo-icon" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900" data-testid="app-title">Zaplog</h2>
            <p className="mt-2 text-sm text-gray-600" data-testid="app-subtitle">
              Sistema de Gestão Logística
            </p>
          </div>

          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6" data-testid="login-form">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...loginForm.register("email")}
                  data-testid="input-email"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1" data-testid="error-email">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                  data-testid="input-password"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1" data-testid="error-password">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" data-testid="checkbox-remember" />
                <Label htmlFor="remember" className="text-sm">Lembrar de mim</Label>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:text-primary/80"
                data-testid="link-forgot-password"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => alert("Função de cadastro a ser implementada")} // Simplificado por agora
                  className="font-medium text-primary hover:text-primary/80"
                  data-testid="link-register"
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}