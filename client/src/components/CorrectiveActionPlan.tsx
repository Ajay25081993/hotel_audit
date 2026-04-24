import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, Users, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CorrectiveActionPlan {
  propertyName: string;
  auditDate: string;
  overallScore: number;
  complianceZone: string;
  criticalIssues: string[];
  immediateActions: {
    title: string;
    description: string;
    timeline: string;
    responsibility: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
  improvementRecommendations: {
    category: string;
    recommendation: string;
    expectedOutcome: string;
    implementationCost: string;
    timeline: string;
  }[];
  followUpSchedule: {
    action: string;
    timeline: string;
    responsible: string;
  }[];
  budgetEstimate: {
    category: string;
    estimatedCost: string;
    justification: string;
  }[];
}

interface CorrectiveActionPlanProps {
  auditId: number;
  propertyName: string;
  auditScore: number;
  triggerButton?: React.ReactNode;
}

export function CorrectiveActionPlan({ auditId, propertyName, auditScore, triggerButton }: CorrectiveActionPlanProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [actionPlan, setActionPlan] = useState<CorrectiveActionPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateActionPlan = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/audits/${auditId}/action-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate action plan');
      }
      
      const planData = await response.json();
      setActionPlan(planData);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to generate action plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate action plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'Medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplianceZoneColor = (zone: string) => {
    switch (zone) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'amber':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button 
            onClick={generateActionPlan}
            disabled={isGenerating}
            className="w-full"
            variant="outline"
          >
            {isGenerating ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Generating AI Action Plan...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Get AI Action Plan
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Generated Corrective Action Plan
          </DialogTitle>
          <DialogDescription>
            Comprehensive improvement recommendations for {propertyName}
          </DialogDescription>
        </DialogHeader>

        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <Zap className="h-6 w-6 mr-2 animate-spin" />
            <span>Generating action plan with AI...</span>
          </div>
        )}

        {error && !isGenerating && !actionPlan && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <Button 
              onClick={generateActionPlan} 
              className="mt-3"
              disabled={isGenerating}
              size="sm"
            >
              Retry Generation
            </Button>
          </div>
        )}

        {actionPlan && (
          <div className="space-y-6">
            {/* Header Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{actionPlan.propertyName}</span>
                  <Badge className={getComplianceZoneColor(actionPlan.complianceZone)}>
                    {actionPlan.complianceZone.toUpperCase()} Zone
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Audit Date: {actionPlan.auditDate} | Overall Score: {actionPlan.overallScore}%
                </CardDescription>
              </CardHeader>
              
              {actionPlan.criticalIssues && actionPlan.criticalIssues.length > 0 && (
                <CardContent>
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Critical Issues Identified
                  </h4>
                  <ul className="space-y-1">
                    {actionPlan.criticalIssues.map((issue: string, index: number) => (
                      <li key={index} className="text-sm text-red-700 ml-6">• {issue}</li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>

            {/* Immediate Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Immediate Actions Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionPlan.immediateActions && actionPlan.immediateActions.map((action: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{action.title}</h4>
                      <Badge className={getPriorityColor(action.priority)}>
                        {getPriorityIcon(action.priority)}
                        <span className="ml-1">{action.priority}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{action.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {action.timeline}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {action.responsibility}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Improvement Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Long-term Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionPlan.improvementRecommendations && actionPlan.improvementRecommendations.map((rec: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{rec.category}</h4>
                      <Badge variant="outline">{rec.implementationCost}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.recommendation}</p>
                    <p className="text-sm text-green-700 mb-2">
                      <strong>Expected Outcome:</strong> {rec.expectedOutcome}
                    </p>
                    <div className="text-xs text-gray-600">
                      <strong>Timeline:</strong> {rec.timeline}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Budget Estimates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Estimates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {actionPlan.budgetEstimate && actionPlan.budgetEstimate.map((budget: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{budget.category}</h4>
                      <p className="text-sm text-gray-600">{budget.justification}</p>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      {budget.estimatedCost}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Follow-up Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Follow-up Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {actionPlan.followUpSchedule && actionPlan.followUpSchedule.map((followUp: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{followUp.action}</h4>
                      <p className="text-sm text-gray-600">Responsible: {followUp.responsible}</p>
                    </div>
                    <Badge variant="outline">{followUp.timeline}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}