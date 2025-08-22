import { Route, Truck, CheckCircle, Users } from "lucide-react";
import type { TripStats } from "@/types";

interface StatsCardsProps {
  stats: TripStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200" data-testid="card-total-trips">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Viagens</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="stat-total">
              {stats.total}
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Route className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-green-600 text-sm font-medium">+8%</span>
          <span className="text-gray-500 text-sm ml-1">vs mês anterior</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200" data-testid="card-active-trips">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Viagens Ativas</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="stat-active">
              {stats.active}
            </p>
          </div>
          <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-amber-600 text-sm font-medium">Limite: 3</span>
          <span className="text-gray-500 text-sm ml-1">(Plano Free)</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200" data-testid="card-completed-trips">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Concluídas</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="stat-completed">
              {stats.completed}
            </p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-green-600 text-sm font-medium">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% taxa
          </span>
          <span className="text-gray-500 text-sm ml-1">de sucesso</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200" data-testid="card-drivers">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Motoristas</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="stat-drivers">
              {stats.drivers}
            </p>
          </div>
          <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-blue-600 text-sm font-medium">{stats.active} ativos</span>
          <span className="text-gray-500 text-sm ml-1">hoje</span>
        </div>
      </div>
    </div>
  );
}
