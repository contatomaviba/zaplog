import { authApi } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Truck, 
  LayoutDashboard, 
  Route, 
  Users, 
  Settings, 
  CheckCircle 
} from "lucide-react";
import type { User } from "@/types";

interface SidebarProps {
  user: User;
  activeTripsCount: number;
}

export default function Sidebar({ user, activeTripsCount }: SidebarProps) {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    authApi.logout();
    setLocation("/login");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'text-purple-800 bg-purple-50 border-purple-200';
      case 'standard': return 'text-blue-800 bg-blue-50 border-blue-200';
      default: return 'text-amber-800 bg-amber-50 border-amber-200';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Pro';
      case 'standard': return 'Standard';
      default: return 'Free';
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="h-5 w-5 text-white" data-testid="sidebar-logo" />
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900" data-testid="sidebar-title">Zaplog</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a
            href="#"
            className="bg-primary/10 text-primary group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </a>
          <a
            href="#"
            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
            data-testid="nav-trips"
          >
            <Route className="mr-3 h-5 w-5" />
            Viagens
          </a>
          <a
            href="#"
            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
            data-testid="nav-drivers"
          >
            <Users className="mr-3 h-5 w-5" />
            Motoristas
          </a>
          <a
            href="#"
            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
            data-testid="nav-settings"
          >
            <Settings className="mr-3 h-5 w-5" />
            Configurações
          </a>
        </nav>

        {/* Status Cards */}
        <div className="px-4 pb-6 space-y-3">
          {/* WhatsApp Extension Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3" data-testid="extension-status">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-800">Extensão Conectada</span>
            </div>
            <p className="text-xs text-green-600 mt-1">WhatsApp Web integrado</p>
          </div>

          {/* Plan Status */}
          <div className={`border rounded-lg p-3 ${getPlanColor(user.plan)}`} data-testid="plan-status">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" data-testid="plan-name">
                  Plano {getPlanName(user.plan)}
                </span>
                {user.plan === 'free' && (
                  <p className="text-xs mt-1" data-testid="plan-usage">
                    {activeTripsCount} de 3 viagens
                  </p>
                )}
              </div>
              {user.plan === 'free' && (
                <button className="text-xs bg-primary text-white px-3 py-1 rounded-full hover:bg-primary/90 transition-colors"
                        data-testid="button-upgrade">
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
          <div className="flex items-center">
            <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary" data-testid="user-initials">
                {getInitials(user.name)}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900" data-testid="user-name">
                {user.name}
              </p>
              <p className="text-xs text-gray-500" data-testid="user-email">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-700"
              data-testid="button-logout"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
