import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import { useLocation } from "wouter";
import { Eye, MessageCircle, XCircle, CheckCircle, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TripModal from "@/components/modals/trip-modal";
import UpgradeModal from "@/components/modals/upgrade-modal";
import TripDetailsModal from "@/components/modals/trip-details-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Trip } from "@/types";

type SortField = 'driverName' | 'origin' | 'destination' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function TripsPage() {
  const [, setLocation] = useLocation();
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get current user
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = authApi.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      return response.json();
    },
  });

  // Get trips
  const { data: tripsData, isLoading: isTripsLoading } = useQuery({
    queryKey: ["/api/trips"],
    queryFn: async () => {
      const token = authApi.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("/api/trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }

      return response.json();
    },
    enabled: !!userData,
    refetchInterval: 30000,
  });

  // Handle authentication errors
  if (userError || !authApi.getToken()) {
    authApi.logout();
    setLocation("/login");
    return null;
  }

  if (isUserLoading || isTripsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando viagens...</p>
        </div>
      </div>
    );
  }

  const user: User = userData?.user;
  const allTrips: Trip[] = tripsData?.trips || [];
  const activeTripsCount = allTrips.filter(trip => trip.isActive && trip.status !== 'completed').length;

  // Filter and sort trips
  const filteredAndSortedTrips = useMemo(() => {
    let filtered = allTrips.filter(trip => {
      const matchesSearch = trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trip.plate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort trips
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allTrips, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrips = filteredAndSortedTrips.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsDetailsModalOpen(true);
  };

  const handleWhatsAppContact = (trip: Trip) => {
    const phone = trip.phone.replace(/\D/g, '');
    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${phone}&text=Olá%20${encodeURIComponent(trip.driverName)},%20como%20está%20sua%20viagem?`;
    window.open(whatsappUrl, '_blank');
  };

  // Mutations: cancel and complete
  const cancelTrip = useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authApi.getToken()}` },
        body: JSON.stringify({ status: 'cancelled', isActive: false }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/trips"] }); },
  });
  const completeTrip = useMutation({
    mutationFn: async (tripId: string) => {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authApi.getToken()}` },
        body: JSON.stringify({ status: 'completed', isActive: false, progress: 100 }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/trips"] }); },
  });

  return (
    <div className="min-h-screen bg-gray-50" data-testid="trips-page">
      <Sidebar user={user} activeTripsCount={activeTripsCount} />
      
      <div className="ml-64 flex-1">
        <Header onCreateTrip={() => setIsTripModalOpen(true)} />
        
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Todas as Viagens</h1>
            <p className="text-gray-600">Gerencie todas as suas viagens logísticas</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="text"
                    placeholder="Buscar por motorista, origem, destino ou placa..."
                    className="sm:w-80"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    data-testid="input-search"
                  />
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-40" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="active">Em Trânsito</SelectItem>
                      <SelectItem value="pending">Aguardando</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {filteredAndSortedTrips.length} viagem(ns) encontrada(s)
                  </span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1 hover:text-gray-700"
                        onClick={() => handleSort('driverName')}
                      >
                        Motorista
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1 hover:text-gray-700"
                        onClick={() => handleSort('origin')}
                      >
                        Origem
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1 hover:text-gray-700"
                        onClick={() => handleSort('destination')}
                      >
                        Destino
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1 hover:text-gray-700"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-1 hover:text-gray-700"
                        onClick={() => handleSort('createdAt')}
                      >
                        Data
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTrips.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500" data-testid="empty-state">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Eye className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium mb-2">Nenhuma viagem encontrada</p>
                          <p className="text-sm text-gray-400">
                            {searchTerm || statusFilter !== "all" 
                              ? "Tente ajustar os filtros de busca" 
                              : "Comece criando sua primeira viagem"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50" data-testid={`trip-row-${trip.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                                {getDriverInitials(trip.driverName)}
                              </div>
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
                          <div className="text-sm text-gray-900" data-testid={`trip-origin-${trip.id}`}>
                            {trip.origin}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900" data-testid={`trip-destination-${trip.id}`}>
                            {trip.destination}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(trip.status)}`} data-testid={`trip-status-${trip.id}`}>
                            {getStatusText(trip.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            className="w-56 border rounded px-2 py-1 text-sm"
                            defaultValue={trip.observations || ''}
                            placeholder="Observação da viagem"
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                const value = (e.target as HTMLInputElement).value;
                                await fetch(`/api/trips/${trip.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authApi.getToken()}` },
                                  body: JSON.stringify({ observations: value }),
                                });
                                queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-testid={`trip-date-${trip.id}`}>
                          {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                              title="Ver detalhes"
                              onClick={() => handleViewDetails(trip)}
                              data-testid={`button-view-${trip.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-800"
                              title="Contatar via WhatsApp"
                              onClick={() => handleWhatsAppContact(trip)}
                              data-testid={`button-whatsapp-${trip.id}`}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => completeTrip.mutate(trip.id)}
                                  data-testid={`button-complete-${trip.id}`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only md:not-sr-only md:text-xs ml-1">Finalizar</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => cancelTrip.mutate(trip.id)}
                                  data-testid={`button-cancel-${trip.id}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span className="sr-only md:not-sr-only md:text-xs ml-1">Cancelar</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando {startIndex + 1} até {Math.min(startIndex + itemsPerPage, filteredAndSortedTrips.length)} de {filteredAndSortedTrips.length} resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        user={user}
        activeTripsCount={activeTripsCount}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      <TripDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        trip={selectedTrip}
      />
    </div>
  );
}
