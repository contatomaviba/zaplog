import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/types";

const tripFormSchema = z.object({
  driverName: z.string().min(2, "Nome do motorista é obrigatório"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  plate: z.string().min(7, "Placa deve ter pelo menos 7 caracteres"),
  origin: z.string().min(2, "Origem é obrigatória"),
  destination: z.string().min(2, "Destino é obrigatório"),
  status: z.enum(["pending", "active"]),
  observations: z.string().optional(),
});

type TripFormData = z.infer<typeof tripFormSchema>;

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  activeTripsCount: number;
}

export default function TripModal({ isOpen, onClose, user, activeTripsCount }: TripModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      driverName: "",
      phone: "",
      plate: "",
      origin: "",
      destination: "",
      status: "pending",
      observations: "",
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const response = await apiRequest("POST", "/api/trips", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Viagem criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar viagem",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TripFormData) => {
    createTripMutation.mutate(data);
  };

  const canCreateTrip = user.plan !== 'free' || activeTripsCount < 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="trip-modal">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">Nova Viagem</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="trip-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="driverName">Nome do Motorista</Label>
              <Input
                id="driverName"
                placeholder="Digite o nome do motorista"
                {...form.register("driverName")}
                data-testid="input-driver-name"
              />
              {form.formState.errors.driverName && (
                <p className="text-sm text-red-600 mt-1" data-testid="error-driver-name">
                  {form.formState.errors.driverName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                {...form.register("phone")}
                data-testid="input-phone"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600 mt-1" data-testid="error-phone">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="plate">Placa do Veículo</Label>
              <Input
                id="plate"
                placeholder="ABC-1234"
                {...form.register("plate")}
                data-testid="input-plate"
              />
              {form.formState.errors.plate && (
                <p className="text-sm text-red-600 mt-1" data-testid="error-plate">
                  {form.formState.errors.plate.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="status">Status Inicial</Label>
              <Select onValueChange={(value) => form.setValue("status", value as "pending" | "active")}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Aguardando</SelectItem>
                  <SelectItem value="active">Em Trânsito</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600 mt-1" data-testid="error-status">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="origin">Origem</Label>
              <Input
                id="origin"
                placeholder="Cidade, Estado"
                {...form.register("origin")}
                data-testid="input-origin"
              />
              {form.formState.errors.origin && (
                <p className="text-sm text-red-600 mt-1" data-testid="error-origin">
                  {form.formState.errors.origin.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="destination">Destino</Label>
              <Input
                id="destination"
                placeholder="Cidade, Estado"
                {...form.register("destination")}
                data-testid="input-destination"
              />
              {form.formState.errors.destination && (
                <p className="text-sm text-red-600 mt-1" data-testid="error-destination">
                  {form.formState.errors.destination.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              rows={3}
              placeholder="Informações adicionais sobre a viagem..."
              {...form.register("observations")}
              data-testid="textarea-observations"
            />
          </div>

          {/* Free Plan Limit Check */}
          {user.plan === 'free' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" data-testid="plan-warning">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-amber-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Atenção - Plano Free</p>
                  <p className="text-sm text-amber-600">
                    {canCreateTrip 
                      ? `Você poderá criar mais ${3 - activeTripsCount} viagem(s). Após isso, será necessário fazer upgrade.`
                      : "Limite de viagens atingido. Faça upgrade para criar mais viagens."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createTripMutation.isPending || !canCreateTrip}
              data-testid="button-create"
            >
              {createTripMutation.isPending ? "Criando..." : "Criar Viagem"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
