import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { RoleCard } from '@/components/RoleCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlayCircle } from 'lucide-react';

export default function RoleSelection() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const roleData = {
    admin: {
      title: 'Admin (Vendor)',
      description: 'Manage audit scheduling, assign auditors, configure checklists',
      features: ['Audit Scheduling', 'Auditor Assignment', 'Progress Tracking'],
      icon: 'fas fa-users-cog'
    },
    auditor: {
      title: 'Guest Auditor', 
      description: 'Conduct audits, record observations, upload media',
      features: ['Field Auditing', 'Media Upload', 'Draft Reports'],
      icon: 'fas fa-clipboard-check'
    },
    reviewer: {
      title: 'Final Reviewer',
      description: 'Validate reports, override scores, final submission', 
      features: ['Report Validation', 'Score Override', 'Final Submission'],
      icon: 'fas fa-shield-alt'
    },
    corporate: {
      title: 'QA Corporate',
      description: 'Analytics overview, compliance dashboards, metrics',
      features: ['Analytics Dashboard', 'Compliance Tracking', 'Performance Metrics'], 
      icon: 'fas fa-chart-line'
    },
    hotelgm: {
      title: 'Hotel GM',
      description: 'Property results, action plans, improvement tracking',
      features: ['Property Results', 'Action Plans', 'Compliance Status'],
      icon: 'fas fa-building'
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoggingIn(true);
    
    try {
      // Demo login - use role as both username and password
      const success = await login(role, 'password');
      
      if (success) {
        // Navigate to appropriate dashboard
        const dashboardRoutes = {
          admin: '/admin',
          auditor: '/auditor', 
          reviewer: '/reviewer',
          corporate: '/corporate',
          hotelgm: '/hotel-gm'
        };
        setLocation(dashboardRoutes[role]);
      } else {
        toast({
          title: "Login Failed",
          description: "Unable to authenticate. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed", 
        description: "An error occurred during login.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <i className="fas fa-hotel text-4xl text-blue-600 mr-3"></i>
            <h1 className="text-4xl font-bold text-gray-800">Hotel Brand Audit Platform</h1>
          </div>
          <p className="text-gray-600 text-lg mb-4">Select your role to access your personalized dashboard</p>
          
          <Link href="/user-flow-demo">
            <Button variant="outline" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100">
              <PlayCircle className="h-4 w-4 text-purple-600" />
              <span className="text-purple-700 font-medium">Watch User Flow Demo</span>
            </Button>  
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(roleData).map(([role, data]) => (
            <RoleCard
              key={role}
              role={role as UserRole}
              title={data.title}
              description={data.description}
              features={data.features}
              icon={data.icon}
              colorScheme={role}
              onSelect={handleRoleSelect}
            />
          ))}
        </div>

        {isLoggingIn && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-800">Logging in...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
