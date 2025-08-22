import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onCreateTrip: () => void;
}

export default function Header({ onCreateTrip }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">Dashboard</h1>
            <p className="text-sm text-gray-500" data-testid="page-subtitle">
              Gerencie suas viagens logísticas
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <Button onClick={onCreateTrip} className="flex items-center" data-testid="button-create-trip">
              <Plus className="h-4 w-4 mr-2" />
              Nova Viagem
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
