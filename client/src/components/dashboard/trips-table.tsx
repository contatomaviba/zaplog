import { useState } from "react";
import { Eye, MessageCircle, XCircle, ArrowRight, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Trip, User } from "@/types";

interface TripsTableProps {
  trips: Trip[];
  user: User;
  onUpgrade: () => void;
}

export default function TripsTable({ trips, user, onUpgrade }: TripsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || statusFilter === "all" || trip.status === statusFilter;
    return matchesSearch && matchesStatus && trip.isActive;
  });

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

  const getDriverInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const activeTripsCount = trips.filter(trip => trip.isActive && trip.status !== 'completed').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900" data-testid="table-title">Viagens Ativas</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar viagens..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="pending">Aguardando</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motorista
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progresso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500" data-testid="empty-state">
                  Nenhuma viagem ativa encontrada
                </td>
              </tr>
            ) : (
              filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50" data-testid={`trip-row-${trip.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700" data-testid={`driver-initials-${trip.id}`}>
                          {getDriverInitials(trip.driverName)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900" data-testid={`driver-name-${trip.id}`}>
                          {trip.driverName}
                        </div>
                        <div className="text-sm text-gray-500" data-testid={`driver-phone-${trip.id}`}>
                          {trip.phone}
                        </div>
                        <div className="text-xs text-gray-400" data-testid={`driver-plate-${trip.id}`}>
                          {trip.plate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <span data-testid={`trip-origin-${trip.id}`}>{trip.origin}</span>
                        <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                        <span data-testid={`trip-destination-${trip.id}`}>{trip.destination}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(trip.status)}`}
                          data-testid={`trip-status-${trip.id}`}>
                      {getStatusText(trip.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${trip.progress}%` }}
                        data-testid={`trip-progress-${trip.id}`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{trip.progress}% concluída</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-primary hover:text-primary/80 p-1 rounded"
                        data-testid={`button-view-${trip.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        data-testid={`button-whatsapp-${trip.id}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        data-testid={`button-cancel-${trip.id}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Free Plan Limit Warning */}
      {user.plan === 'free' && (
        <div className="px-6 py-4 bg-amber-50 border-t border-amber-200" data-testid="plan-warning">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-sm font-medium text-amber-800">
                Você está usando {activeTripsCount} de 3 viagens disponíveis no plano Free
              </span>
            </div>
            <Button 
              onClick={onUpgrade}
              size="sm"
              data-testid="button-upgrade-warning"
            >
              Fazer Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
