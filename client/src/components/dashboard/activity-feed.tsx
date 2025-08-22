import { Check, Plus, MessageCircle } from "lucide-react";

export default function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: 'location_update',
      driverName: 'Mario Silva',
      message: 'atualizou a localização da viagem',
      timestamp: '5 minutos atrás',
      icon: Check,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 2,
      type: 'trip_created',
      driverName: 'João Rodrigues',
      message: 'Nova viagem criada para',
      timestamp: '15 minutos atrás',
      icon: Plus,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 3,
      type: 'message_received',
      driverName: 'Mario Silva',
      message: 'Mensagem recebida via WhatsApp de',
      timestamp: '1 hora atrás',
      icon: MessageCircle,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="activity-title">
          Atividade Recente
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                <div className={`h-8 w-8 ${activity.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {activity.type === 'trip_created' ? (
                      <>
                        {activity.message} <span className="font-medium">{activity.driverName}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{activity.driverName}</span> {activity.message}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500" data-testid={`activity-timestamp-${activity.id}`}>
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <button 
            className="text-primary hover:text-primary/80 text-sm font-medium"
            data-testid="button-view-all-activities"
          >
            Ver todas as atividades
          </button>
        </div>
      </div>
    </div>
  );
}
