import { Card, CardContent } from '@/components/ui/card';
import { UserRole } from '@shared/schema';

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  features: string[];
  icon: string;
  colorScheme: string;
  onSelect: (role: UserRole) => void;
}

export function RoleCard({ role, title, description, features, icon, colorScheme, onSelect }: RoleCardProps) {
  const colorClasses = {
    admin: 'from-orange-50 to-orange-100 border-orange-200 hover:border-orange-400',
    auditor: 'from-green-50 to-green-100 border-green-200 hover:border-green-400', 
    reviewer: 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400',
    corporate: 'from-amber-50 to-amber-100 border-amber-200 hover:border-amber-400',
    hotelgm: 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400'
  };

  const iconColors = {
    admin: 'bg-orange-500',
    auditor: 'bg-green-500',
    reviewer: 'bg-purple-500', 
    corporate: 'bg-amber-500',
    hotelgm: 'bg-blue-600'
  };

  const checkColors = {
    admin: 'text-orange-500',
    auditor: 'text-green-500',
    reviewer: 'text-purple-500',
    corporate: 'text-amber-500', 
    hotelgm: 'text-blue-600'
  };

  return (
    <Card 
      className={`bg-gradient-to-br ${colorClasses[role]} border-2 cursor-pointer transition-all hover:shadow-lg`}
      onClick={() => onSelect(role)}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <div className={`w-16 h-16 ${iconColors[role]} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <i className={`${icon} text-white text-2xl`}></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          <div className="text-left text-xs text-gray-500">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center mb-1">
                <i className={`fas fa-check ${checkColors[role]} mr-2`}></i>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
