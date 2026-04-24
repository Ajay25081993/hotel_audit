import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Play, Pause, RotateCcw, CheckCircle, Clock, User, Building, FileText, Eye, BarChart3 } from 'lucide-react';
import { Link } from 'wouter';

interface UserFlowStep {
  id: string;
  title: string;
  description: string;
  action: string;
  duration: number;
  dashboardPath?: string;
  completed?: boolean;
}

interface PersonaFlow {
  id: string;
  name: string;
  title: string;
  goal: string;
  icon: any;
  color: string;
  bgColor: string;
  steps: UserFlowStep[];
}

const personaFlows: PersonaFlow[] = [
  {
    id: 'admin',
    name: 'Vendor Admin',
    title: 'Audit Coordinator',
    goal: 'Manage audit scheduling, assign auditors/reviewers, and configure audit scope',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    steps: [
      {
        id: 'admin-1',
        title: 'Login to Admin Dashboard',
        description: 'Access the admin portal with secure credentials',
        action: 'Login with admin/password',
        duration: 2000,
        dashboardPath: '/admin'
      },
      {
        id: 'admin-2',
        title: 'View Properties Due for Audit',
        description: 'Review calendar-based triggers and property audit schedules',
        action: 'Check properties requiring audits',
        duration: 3000
      },
      {
        id: 'admin-3',
        title: 'Assign Mystery Guest Auditor',
        description: 'Select and assign qualified auditor to property',
        action: 'Assign Sarah Johnson as auditor',
        duration: 2500
      },
      {
        id: 'admin-4',
        title: 'Assign QA Reviewer',
        description: 'Select reviewer for final validation process',
        action: 'Assign Michael Chen as reviewer',
        duration: 2000
      },
      {
        id: 'admin-5',
        title: 'Configure Audit Scope',
        description: 'Set audit type, checklist template, and specific areas',
        action: 'Configure F&B + Room Service audit',
        duration: 4000
      },
      {
        id: 'admin-6',
        title: 'Track Progress',
        description: 'Monitor audit progress across all assignments',
        action: 'View real-time audit status',
        duration: 2000
      }
    ]
  },
  {
    id: 'auditor',
    name: 'Guest Auditor',
    title: 'Mystery Guest (Vendor)',
    goal: 'Conduct audit, record observations, and generate AI-assisted report draft',
    icon: Building,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    steps: [
      {
        id: 'auditor-1',
        title: 'Secure Portal Login',
        description: 'Access via OTP/SSO authentication',
        action: 'Login with auditor/password',
        duration: 2000,
        dashboardPath: '/auditor'
      },
      {
        id: 'auditor-2',
        title: 'Access Assigned Audit',
        description: 'View specific Taj hotel assignment details',
        action: 'Open Taj Palace, New Delhi audit',
        duration: 1500
      },
      {
        id: 'auditor-3',
        title: 'Complete Checklist',
        description: 'Enter scores, comments, and upload media evidence',
        action: 'Score cleanliness, branding, operations',
        duration: 8000
      },
      {
        id: 'auditor-4',
        title: 'Upload Media Evidence',
        description: 'Capture and upload photos, videos, voice notes',
        action: 'Upload 12 photos and 3 voice notes',
        duration: 5000
      },
      {
        id: 'auditor-5',
        title: 'Submit Draft Report',
        description: 'Trigger AI scoring, tagging, and summarization',
        action: 'Submit for AI processing',
        duration: 3000
      },
      {
        id: 'auditor-6',
        title: 'Review AI-Generated Draft',
        description: 'Validate AI results and flag any anomalies',
        action: 'Review AI summary and flag issues',
        duration: 4000
      }
    ]
  },
  {
    id: 'reviewer',
    name: 'QA Reviewer',
    title: 'Final Reviewer (Vendor Agency)',
    goal: 'Review AI-generated draft, validate/override, and submit to IHCL',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    steps: [
      {
        id: 'reviewer-1',
        title: 'QA Portal Access',
        description: 'Login to reviewer validation system',
        action: 'Login with reviewer/password',
        duration: 2000,
        dashboardPath: '/reviewer'
      },
      {
        id: 'reviewer-2',
        title: 'Access Submitted Drafts',
        description: 'Review AI-evaluated audit reports',
        action: 'Open pending draft reports',
        duration: 2000
      },
      {
        id: 'reviewer-3',
        title: 'Validate Checklist Scores',
        description: 'Review and verify auditor scoring accuracy',
        action: 'Validate 85% cleanliness score',
        duration: 3000
      },
      {
        id: 'reviewer-4',
        title: 'Review AI Observations',
        description: 'Validate AI-generated Tajness/behavioral insights',
        action: 'Review AI behavioral analysis',
        duration: 4000
      },
      {
        id: 'reviewer-5',
        title: 'Validate CAP Suggestions',
        description: 'Review AI-generated Corrective Action Plans',
        action: 'Approve CAP recommendations',
        duration: 3000
      },
      {
        id: 'reviewer-6',
        title: 'Override/Correct AI Results',
        description: 'Make human corrections where needed',
        action: 'Override 2 AI recommendations',
        duration: 3500
      },
      {
        id: 'reviewer-7',
        title: 'Add Human Commentary',
        description: 'Include additional human insights and remarks',
        action: 'Add contextual observations',
        duration: 4000
      },
      {
        id: 'reviewer-8',
        title: 'Submit Final Report',
        description: 'Formally submit validated report to IHCL',
        action: 'Submit to IHCL corporate',
        duration: 2000
      }
    ]
  },
  {
    id: 'corporate',
    name: 'QA Corporate Team',
    title: 'Corporate Oversight',
    goal: 'Review compliance trends and take data-driven actions',
    icon: BarChart3,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    steps: [
      {
        id: 'corporate-1',
        title: 'Corporate Dashboard Access',
        description: 'View comprehensive audit analytics',
        action: 'Login with corporate/password',
        duration: 2000,
        dashboardPath: '/corporate'
      },
      {
        id: 'corporate-2',
        title: 'Review Completed Audits',
        description: 'Analyze read-only audit completion data',
        action: 'Review 23 completed audits',
        duration: 3000
      },
      {
        id: 'corporate-3',
        title: 'Filter by Compliance Zone',
        description: 'Segment hotels by performance (Green/Amber/Red)',
        action: 'Filter 3 Red zone properties',
        duration: 2500
      },
      {
        id: 'corporate-4',
        title: 'Identify Low Performers',
        description: 'Spot persistent compliance issues',
        action: 'Flag 2 properties for re-audit',
        duration: 3000
      },
      {
        id: 'corporate-5',
        title: 'Trigger Re-Audits',
        description: 'Initiate additional audits for problem properties',
        action: 'Schedule re-audits for next week',
        duration: 2000
      },
      {
        id: 'corporate-6',
        title: 'Track Trend Changes',
        description: 'Monitor improvement over audit cycles',
        action: 'Analyze 6-month trend data',
        duration: 4000
      }
    ]
  },
  {
    id: 'hotelgm',
    name: 'Hotel GM',
    title: 'Franchise Owner',
    goal: 'Review audit outcomes and execute corrective actions',
    icon: Eye,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    steps: [
      {
        id: 'hotelgm-1',
        title: 'GM Portal Access',
        description: 'Access hotel-specific audit results',
        action: 'Login with hotelgm/password',
        duration: 2000,
        dashboardPath: '/hotel-gm'
      },
      {
        id: 'hotelgm-2',
        title: 'Access Finalized Reports',
        description: 'Review read-only validated audit reports',
        action: 'Open Taj Palace audit report',
        duration: 2500
      },
      {
        id: 'hotelgm-3',
        title: 'Review Audit Scores',
        description: 'Analyze performance across all categories',
        action: 'Review 85% overall score breakdown',
        duration: 3000
      },
      {
        id: 'hotelgm-4',
        title: 'Study AI/Human Observations',
        description: 'Understand specific improvement areas',
        action: 'Review 8 improvement observations',
        duration: 4000
      },
      {
        id: 'hotelgm-5',
        title: 'Download CAP Template',
        description: 'Get Corrective Action Plan framework',
        action: 'Download CAP for implementation',
        duration: 1500
      },
      {
        id: 'hotelgm-6',
        title: 'Execute Corrective Actions',
        description: 'Implement improvements and document progress',
        action: 'Complete staff training program',
        duration: 6000
      },
      {
        id: 'hotelgm-7',
        title: 'Upload Execution Proof',
        description: 'Document corrective actions taken',
        action: 'Upload training docs and photos',
        duration: 3000
      },
      {
        id: 'hotelgm-8',
        title: 'Await Confirmation',
        description: 'Wait for corporate validation of actions',
        action: 'Pending corporate review',
        duration: 2000
      }
    ]
  }
];

export default function UserFlowDemo() {
  const [currentPersona, setCurrentPersona] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isPlaying) return;

    const currentFlow = personaFlows[currentPersona];
    const step = currentFlow.steps[currentStep];

    const timer = setTimeout(() => {
      setCompletedSteps(prev => new Set(Array.from(prev).concat([step.id])));
      
      if (currentStep < currentFlow.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (currentPersona < personaFlows.length - 1) {
        setCurrentPersona(prev => prev + 1);
        setCurrentStep(0);
      } else {
        setIsPlaying(false);
      }
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentPersona, currentStep, isPlaying]);

  const resetDemo = () => {
    setCurrentPersona(0);
    setCurrentStep(0);
    setIsPlaying(false);
    setCompletedSteps(new Set());
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const jumpToPersona = (personaIndex: number) => {
    setCurrentPersona(personaIndex);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentFlow = personaFlows[currentPersona];
  const progress = ((currentPersona * 100) + ((currentStep + 1) / currentFlow.steps.length * 100)) / personaFlows.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hotel Audit System - Real-Time User Flow
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Experience the complete audit journey across all 5 personas
          </p>
          
          {/* Controls */}
          <div className="flex justify-center gap-4 mb-6">
            <Button onClick={togglePlayback} className="flex items-center gap-2">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause Demo' : 'Start Demo'}
            </Button>
            <Button variant="outline" onClick={resetDemo} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Overall Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Persona Navigation */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {personaFlows.map((persona, index) => {
            const Icon = persona.icon;
            const isActive = index === currentPersona;
            const isCompleted = index < currentPersona;
            
            return (
              <Card 
                key={persona.id}
                className={`cursor-pointer transition-all duration-300 ${
                  isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
                } ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => jumpToPersona(index)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${persona.bgColor} mb-3`}>
                    <Icon className={`h-6 w-6 ${persona.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">
                    {persona.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {persona.title}
                  </p>
                  {isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  )}
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Persona Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Persona Details */}
          <Card className="h-fit">
            <CardHeader className={`${currentFlow.bgColor} border-b`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-white`}>
                  <currentFlow.icon className={`h-8 w-8 ${currentFlow.color}`} />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {currentFlow.name}
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    {currentFlow.title}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Goal:</h4>
                <p className="text-gray-700">{currentFlow.goal}</p>
              </div>

              {currentFlow.steps[currentStep]?.dashboardPath && (
                <div className="mb-6">
                  <Link href={currentFlow.steps[currentStep].dashboardPath!}>
                    <Button variant="outline" className="w-full">
                      Open {currentFlow.name} Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Persona Progress</span>
                  <span>{currentStep + 1} of {currentFlow.steps.length}</span>
                </div>
                <Progress 
                  value={((currentStep + 1) / currentFlow.steps.length) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Step Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Current Step: {currentStep + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {currentFlow.steps.map((step, index) => {
                  const isCurrentStep = index === currentStep;
                  const isCompleted = completedSteps.has(step.id);
                  const isPending = index > currentStep;

                  return (
                    <div 
                      key={step.id}
                      className={`p-4 rounded-lg border transition-all duration-300 ${
                        isCurrentStep 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : isCompleted 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrentStep 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-1 ${
                            isCurrentStep ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm mb-2 ${
                            isCurrentStep ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {step.description}
                          </p>
                          <div className={`text-xs font-medium ${
                            isCurrentStep ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            Action: {step.action}
                          </div>
                          {isCurrentStep && isPlaying && (
                            <div className="mt-2">
                              <Progress 
                                value={100} 
                                className="h-1 animate-pulse" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Links */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Access to All Dashboards</CardTitle>
            <CardDescription>
              Jump directly to any persona's dashboard to explore the interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {personaFlows.map((persona) => (
                <Link key={persona.id} href={`/${persona.id === 'hotelgm' ? 'hotel-gm' : persona.id}`}>
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <persona.icon className="h-5 w-5" />
                    <span className="text-xs text-center">{persona.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}