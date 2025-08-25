import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/auth";
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

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginMutation = useMutation({
  mutationFn: ({ email, password }: LoginFormData) => authApi.login(email, password),
  onSuccess: () => {
    toast({ title: "Login realizado com sucesso!" });
    // Força um recarregamento da página para o dashboard
    window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, name, confirmPassword }: RegisterFormData) => 
      authApi.register(email, password, name, confirmPassword),
    onSuccess: () => {
      toast({ title: "Conta criada com sucesso!" });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

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

          {!isRegister ? (
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
                    onClick={() => setIsRegister(true)}
                    className="font-medium text-primary hover:text-primary/80"
                    data-testid="link-register"
                  >
                    Cadastre-se
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6" data-testid="register-form">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    {...registerForm.register("name")}
                    data-testid="input-name"
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-name">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    {...registerForm.register("email")}
                    data-testid="input-register-email"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-register-email">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerForm.register("password")}
                    data-testid="input-register-password"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-register-password">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...registerForm.register("confirmPassword")}
                    data-testid="input-confirm-password"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1" data-testid="error-confirm-password">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="font-medium text-primary hover:text-primary/80"
                    data-testid="link-login"
                  >
                    Faça login
                  </button>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
