import { X, MapPin, User, Phone, Car, Clock, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types";

interface TripDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export default function TripDetailsModal({ isOpen, onClose, trip }: TripDetailsModalProps) {
  if (!trip) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Em Trânsito';
      case 'pending':
        return 'Aguardando';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handleWhatsAppContact = () => {
    const phone = trip.phone.replace(/\D/g, '');
    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${phone}&text=Olá%20${encodeURIComponent(trip.driverName)},%20como%20está%20sua%20viagem?`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="trip-details-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="modal-title">
            <Car className="h-5 w-5" />
            Detalhes da Viagem
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(trip.status)}`}>
              {getStatusText(trip.status)}
            </span>
            <div className="text-sm text-gray-500">
              {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </div>
          </div>

          {/* Driver Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Motorista
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="text-sm text-gray-900">{trip.driverName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p className="text-sm text-gray-900">{trip.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Placa do Veículo</label>
                <p className="text-sm text-gray-900">{trip.plate}</p>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Rota
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Origem</label>
                <p className="text-sm text-gray-900">{trip.origin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Destino</label>
                <p className="text-sm text-gray-900">{trip.destination}</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Progresso
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300" 
                style={{ width: `${trip.progress || 0}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">{trip.progress || 0}% concluída</div>
          </div>

          {/* Observations */}
          {trip.observations && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
              <p className="text-sm text-gray-700">{trip.observations}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleWhatsAppContact}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Contatar via WhatsApp
            </Button>
            
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}