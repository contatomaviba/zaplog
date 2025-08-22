import { X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { toast } = useToast();

  const handlePlanSelect = (plan: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `Upgrade para o plano ${plan} será implementado em breve.`,
    });
    onClose();
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      current: true,
      features: [
        'Até 3 viagens ativas',
        'Dashboard básico',
        'Integração WhatsApp'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 'R$ 49',
      period: '/mês',
      recommended: true,
      features: [
        'Viagens ilimitadas',
        'Dashboard avançado',
        'Relatórios e análises',
        'Suporte prioritário'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 99',
      period: '/mês',
      features: [
        'Tudo do Standard +',
        'API personalizada',
        'Integrações avançadas',
        'Suporte 24/7'
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl" data-testid="upgrade-modal">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">Escolha seu Plano</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 rounded-xl p-6 relative ${
                plan.recommended ? 'border-primary' : 'border-gray-200'
              }`}
              data-testid={`plan-card-${plan.id}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-3 py-1 text-xs font-semibold rounded-full">
                    Recomendado
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900" data-testid={`plan-name-${plan.id}`}>
                  {plan.name}
                </h4>
                <p className="text-3xl font-bold text-gray-900 mt-2" data-testid={`plan-price-${plan.id}`}>
                  {plan.price}
                  <span className="text-sm font-normal text-gray-500">{plan.period}</span>
                </p>
              </div>
              
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600" data-testid={`plan-feature-${plan.id}-${index}`}>
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                className={`w-full mt-6 ${
                  plan.current 
                    ? 'bg-gray-100 text-gray-700 cursor-not-allowed hover:bg-gray-100' 
                    : plan.recommended 
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                disabled={plan.current}
                onClick={() => handlePlanSelect(plan.name)}
                data-testid={`button-select-${plan.id}`}
              >
                {plan.current ? 'Plano Atual' : `Escolher ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
