import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AlertCircle, BarChart3, Building, CheckCircle, Clock, MessageSquare, Send, TrendingUp, Users, Zap, Download, Eye, FileText, Filter } from 'lucide-react';

export default function CorporateDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [recommendationOpen, setRecommendationOpen] = useState(false);
  const [surveyData, setSurveyData] = useState({
    title: '',
    description: '',
    questions: ['']
  });
  const [recommendationData, setRecommendationData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    targetProperties: 'all'
  });
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [reportDetailsOpen, setReportDetailsOpen] = useState(false);

  // Fetch real-time data
  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ['/audits'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/properties'],
    refetchInterval: 30000
  });

  // Calculate real-time KPIs from all relevant audits
  const completedAudits = (audits as any[]).filter((audit: any) => 
    audit.status === 'approved' || audit.status === 'completed' || audit.status === 'reviewed'
  );
  const approvedAudits = (audits as any[]).filter((audit: any) => audit.status === 'approved');
  const allAuditsWithScores = (audits as any[]).filter((audit: any) => audit.overallScore > 0);
  
  const kpiData = {
    // Use approved audits for compliance calculation, fallback to all scored audits if no approved ones
    overallCompliance: approvedAudits.length > 0 
      ? Math.round(approvedAudits.reduce((sum: number, audit: any) => sum + (audit.overallScore || 0), 0) / approvedAudits.length)
      : allAuditsWithScores.length > 0 
        ? Math.round(allAuditsWithScores.reduce((sum: number, audit: any) => sum + audit.overallScore, 0) / allAuditsWithScores.length)
        : 0,
    
    // Total properties count
    totalProperties: (properties as any[]).length,
    
    // Critical issues - properties with scores below 70
    criticalIssues: allAuditsWithScores.filter((audit: any) => audit.overallScore < 70).length,
    
    // Audits this month - include all audits with activity this month
    auditsThisMonth: (audits as any[]).filter((audit: any) => {
      const auditDate = new Date(audit.submittedAt || audit.reviewedAt || audit.createdAt);
      const now = new Date();
      return auditDate.getMonth() === now.getMonth() && auditDate.getFullYear() === now.getFullYear();
    }).length,
    
    // Additional metrics for enhanced real-time data
    totalAudits: (audits as any[]).length,
    pendingAudits: (audits as any[]).filter((audit: any) => 
      audit.status === 'scheduled' || audit.status === 'in_progress'
    ).length,
    excellentProperties: allAuditsWithScores.filter((audit: any) => audit.overallScore >= 90).length,
    goodProperties: allAuditsWithScores.filter((audit: any) => audit.overallScore >= 80 && audit.overallScore < 90).length,
    amberProperties: allAuditsWithScores.filter((audit: any) => audit.overallScore >= 70 && audit.overallScore < 80).length
  };

  // Debug logging
  console.log('Corporate - Audits data:', audits);
  console.log('Corporate - Properties data:', properties);
  console.log('Corporate - KPI data:', kpiData);

  // Calculate comprehensive regional performance data
  const regionalPerformanceData = () => {
    const regions = [...new Set((properties as any[]).map((p: any) => p.region))];
    
    return regions.map(region => {
      const regionProperties = (properties as any[]).filter((p: any) => p.region === region);
      const regionAudits = (audits as any[]).filter((audit: any) => 
        regionProperties.some((p: any) => p.id === audit.propertyId) && audit.status === 'approved'
      );
      
      const scores = regionAudits.map((a: any) => a.overallScore).filter((s: any) => s);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) : 0;
      const excellentCount = scores.filter((s: number) => s >= 85).length;
      const goodCount = scores.filter((s: number) => s >= 70 && s < 85).length;
      const poorCount = scores.filter((s: number) => s < 70).length;
      
      return {
        region,
        properties: regionProperties.length,
        audits: regionAudits.length,
        avgScore,
        excellentCount,
        goodCount,
        poorCount,
        complianceRate: regionAudits.length > 0 ? Math.round((excellentCount + goodCount) / regionAudits.length * 100) : 0,
        trend: avgScore >= 85 ? 'excellent' : avgScore >= 70 ? 'good' : 'poor',
        lastAudit: regionAudits.length > 0 ? 
          new Date(Math.max(...regionAudits.map((a: any) => new Date(a.submittedAt || a.createdAt).getTime()))).toLocaleDateString() : 
          'No audits'
      };
    });
  };

  const regionalData = regionalPerformanceData();

  // Get detailed property data for export and details view - only properties with submitted audits
  const getDetailedPropertyData = () => {
    return (properties as any[])
      .map((property: any) => {
        const propertyAudits = (audits as any[]).filter((audit: any) => audit.propertyId === property.id && audit.status === 'approved');
        const latestAudit = propertyAudits.sort((a: any, b: any) => 
          new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()
        )[0];
        
        return {
          ...property,
          totalAudits: propertyAudits.length,
          latestScore: latestAudit?.overallScore || 0,
          latestCleanliness: latestAudit?.cleanlinessScore || 0,
          latestBranding: latestAudit?.brandingScore || 0,
          latestOperational: latestAudit?.operationalScore || 0,
          complianceZone: latestAudit?.complianceZone || 'unknown',
          lastAuditDate: latestAudit ? new Date(latestAudit.submittedAt || latestAudit.createdAt).toLocaleDateString() : 'No audits',
          findings: latestAudit?.findings || 'No findings available',
          actionPlan: latestAudit?.actionPlan || 'No action plan available',
          hasAudits: propertyAudits.length > 0
        };
      })
      .filter((property: any) => property.hasAudits); // Only show properties with submitted audits
  };

  // Get critical properties from real data
  const criticalProperties = (properties as any[])
    .map((property: any) => {
      const propertyAudits = (audits as any[]).filter((audit: any) => audit.propertyId === property.id);
      const latestAudit = propertyAudits.sort((a: any, b: any) => 
        new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()
      )[0];
      
      return {
        ...property,
        score: latestAudit?.overallScore || 0,
        lastAudit: latestAudit ? new Date(latestAudit.submittedAt || latestAudit.createdAt).toLocaleDateString() : 'No audits',
        issues: latestAudit?.findings ? ['Compliance Issues'] : ['No Issues']
      };
    })
    .filter((property: any) => property.score > 0 && property.score < 80)
    .sort((a: any, b: any) => a.score - b.score);

  // Survey creation mutation
  const createSurvey = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create survey');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Survey Created",
        description: "Survey has been distributed to all properties",
      });
      setSurveyOpen(false);
      setSurveyData({ title: '', description: '', questions: [''] });
    }
  });

  // Recommendation creation mutation
  const createRecommendation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create recommendation');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recommendation Sent",
        description: "Recommendation has been sent to target properties",
      });
      setRecommendationOpen(false);
      setRecommendationData({ title: '', description: '', priority: 'medium', targetProperties: 'all' });
    }
  });

  // Export functionality
  const exportReportData = () => {
    const detailedData = getDetailedPropertyData();
    const filteredData = selectedRegion === 'all' ? detailedData : detailedData.filter(p => p.region === selectedRegion);
    
    const csvContent = [
      ['Property Name', 'Location', 'Region', 'Latest Score', 'Cleanliness', 'Branding', 'Operational', 'Compliance Zone', 'Last Audit Date', 'Total Audits'].join(','),
      ...filteredData.map(property => [
        `"${property.name}"`,
        `"${property.location}"`,
        `"${property.region}"`,
        property.latestScore,
        property.latestCleanliness,
        property.latestBranding,
        property.latestOperational,
        `"${property.complianceZone}"`,
        `"${property.lastAuditDate}"`,
        property.totalAudits
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `hotel-audit-report-${selectedRegion}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Report Exported",
      description: `Regional performance report exported successfully for ${selectedRegion === 'all' ? 'all regions' : selectedRegion}`,
    });
  };

  const viewPropertyDetails = (property: any) => {
    setSelectedProperty(property);
    setReportDetailsOpen(true);
  };

  return (
    <div className="min-h-screen corporate-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Corporate Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor brand compliance and performance across all properties</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Dialog open={surveyOpen} onOpenChange={setSurveyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Property Survey</DialogTitle>
                <DialogDescription>
                  Send a survey to all properties to gather feedback and insights
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="survey-title">Survey Title</Label>
                  <Input
                    id="survey-title"
                    value={surveyData.title}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter survey title"
                  />
                </div>
                <div>
                  <Label htmlFor="survey-description">Description</Label>
                  <Textarea
                    id="survey-description"
                    value={surveyData.description}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose of this survey"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Questions</Label>
                  {surveyData.questions.map((question, index) => (
                    <div key={index} className="flex space-x-2 mt-2">
                      <Input
                        value={question}
                        onChange={(e) => {
                          const newQuestions = [...surveyData.questions];
                          newQuestions[index] = e.target.value;
                          setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                        }}
                        placeholder={`Question ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newQuestions = [...surveyData.questions, ''];
                          setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                        }}
                      >
                        +
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => createSurvey.mutate(surveyData)}
                  disabled={createSurvey.isPending}
                  className="w-full"
                >
                  {createSurvey.isPending ? 'Creating...' : 'Send Survey'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={recommendationOpen} onOpenChange={setRecommendationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <Send className="h-4 w-4 mr-2" />
                Send Recommendation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Recommendation</DialogTitle>
                <DialogDescription>
                  Send improvement recommendations to properties
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rec-title">Recommendation Title</Label>
                  <Input
                    id="rec-title"
                    value={recommendationData.title}
                    onChange={(e) => setRecommendationData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter recommendation title"
                  />
                </div>
                <div>
                  <Label htmlFor="rec-description">Description</Label>
                  <Textarea
                    id="rec-description"
                    value={recommendationData.description}
                    onChange={(e) => setRecommendationData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the recommendation"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={recommendationData.priority}
                    onChange={(e) => setRecommendationData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <Button 
                  onClick={() => createRecommendation.mutate(recommendationData)}
                  disabled={createRecommendation.isPending}
                  className="w-full"
                >
                  {createRecommendation.isPending ? 'Sending...' : 'Send Recommendation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Property Details Modal */}
        <Dialog open={reportDetailsOpen} onOpenChange={setReportDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <img 
                  src={selectedProperty?.image}
                  alt={selectedProperty?.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <div className="text-lg font-bold">{selectedProperty?.name}</div>
                  <div className="text-sm text-gray-600">{selectedProperty?.location}, {selectedProperty?.region}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedProperty && (
              <div className="space-y-6">
                {/* Score Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedProperty.latestScore}%</div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedProperty.latestCleanliness}%</div>
                      <div className="text-sm text-gray-600">Cleanliness</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedProperty.latestBranding}%</div>
                      <div className="text-sm text-gray-600">Branding</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedProperty.latestOperational}%</div>
                      <div className="text-sm text-gray-600">Operations</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Audit Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Audit Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Audits:</span>
                          <span className="font-medium">{selectedProperty.totalAudits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Audit:</span>
                          <span className="font-medium">{selectedProperty.lastAuditDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Compliance Zone:</span>
                          <Badge className={
                            selectedProperty.complianceZone === 'green' ? 'bg-green-100 text-green-800' :
                            selectedProperty.complianceZone === 'amber' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {selectedProperty.complianceZone}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Cleanliness</span>
                            <span className="text-sm font-medium">{selectedProperty.latestCleanliness}%</span>
                          </div>
                          <Progress value={selectedProperty.latestCleanliness} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Branding</span>
                            <span className="text-sm font-medium">{selectedProperty.latestBranding}%</span>
                          </div>
                          <Progress value={selectedProperty.latestBranding} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Operations</span>
                            <span className="text-sm font-medium">{selectedProperty.latestOperational}%</span>
                          </div>
                          <Progress value={selectedProperty.latestOperational} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Findings and Action Plan */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Key Findings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {selectedProperty.findings}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        Action Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {selectedProperty.actionPlan}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* KPI Cards - Real-time Data */}
        <div className="dashboard-section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 dashboard-grid">
          <div className="metric-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Overall Compliance</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{kpiData.overallCompliance}%</p>
                <p className="text-xs text-green-600 mt-1">
                  {approvedAudits.length > 0 
                    ? `From ${approvedAudits.length} approved audit${approvedAudits.length !== 1 ? 's' : ''}`
                    : allAuditsWithScores.length > 0 
                      ? `From ${allAuditsWithScores.length} scored audit${allAuditsWithScores.length !== 1 ? 's' : ''}`
                      : 'No audit data available'
                  }
                </p>
              </div>
              <div className="icon-container-success">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Properties</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{kpiData.totalProperties}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {allAuditsWithScores.length} with completed audits
                </p>
              </div>
              <div className="icon-container-primary">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-danger">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Critical Issues</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{kpiData.criticalIssues}</p>
                <p className="text-xs text-red-600 mt-1">
                  {kpiData.criticalIssues === 0 
                    ? 'No critical issues found' 
                    : `Properties scoring below 70%`
                  }
                </p>
              </div>
              <div className="icon-container-danger">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Audits This Month</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{kpiData.auditsThisMonth}</p>
                <p className="text-xs text-amber-600 mt-1">
                  {kpiData.pendingAudits > 0 
                    ? `${kpiData.pendingAudits} pending completion`
                    : 'All scheduled audits completed'
                  }
                </p>
              </div>
              <div className="icon-container-warning">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Additional Real-time Performance Metrics */}
        <div className="dashboard-section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 dashboard-grid">
            <div className="metric-card-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Excellent Properties</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{kpiData.excellentProperties}</p>
                  <p className="text-xs text-green-600 mt-1">Scoring 90% and above</p>
                </div>
                <div className="icon-container-success">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="metric-card-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Good Performance</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{kpiData.goodProperties}</p>
                  <p className="text-xs text-blue-600 mt-1">Scoring 80-89%</p>
                </div>
                <div className="icon-container-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="metric-card-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Needs Attention</p>
                  <p className="text-3xl font-bold text-amber-900 mt-2">{kpiData.amberProperties}</p>
                  <p className="text-xs text-amber-600 mt-1">Scoring 70-79%</p>
                </div>
                <div className="icon-container-warning">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="metric-card-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Audits</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{kpiData.totalAudits}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {completedAudits.length} completed, {kpiData.pendingAudits} pending
                  </p>
                </div>
                <div className="icon-container-primary">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Compliance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-line text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">Compliance trend chart visualization</p>
                  <p className="text-sm text-gray-500">Shows 6-month compliance trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Properties with Audits</span>
                  <span className="text-2xl font-bold text-blue-600">{getDetailedPropertyData().length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total Audits Completed</span>
                  <span className="text-2xl font-bold text-green-600">{approvedAudits.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Average Score</span>
                  <span className="text-2xl font-bold text-purple-600">{kpiData.overallCompliance}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Regional Performance Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Regional Performance Analysis</h3>
            <div className="flex items-center space-x-4">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {[...new Set((properties as any[]).map((p: any) => p.region))].map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportReportData} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
          
          {/* Regional Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {regionalData.map((region: any, index: number) => (
              <Card key={index} className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{region.region}</h4>
                    <Badge className={region.trend === 'excellent' ? 'bg-green-500' : region.trend === 'good' ? 'bg-yellow-500' : 'bg-red-500'}>
                      {region.trend}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-gray-900">{region.avgScore}%</div>
                    <div className="text-sm text-gray-600">{region.properties} Properties • {region.audits} Audits</div>
                    <Progress value={region.avgScore} className="h-2 bg-gray-100" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Compliance: {region.complianceRate}%</span>
                      <span>{region.lastAudit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Properties Table */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Property Performance Details</span>
                <Badge variant="outline">{getDetailedPropertyData().filter(p => selectedRegion === 'all' || p.region === selectedRegion).length} Properties</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Overall Score</TableHead>
                    <TableHead>Cleanliness</TableHead>
                    <TableHead>Branding</TableHead>
                    <TableHead>Operations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Audit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDetailedPropertyData()
                    .filter(property => selectedRegion === 'all' || property.region === selectedRegion)
                    .map((property: any) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={property.image}
                            alt={property.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{property.name}</div>
                            <div className="text-sm text-gray-500">{property.location}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{property.region}</TableCell>
                      <TableCell>
                        <Badge className={property.latestScore >= 85 ? 'bg-green-100 text-green-800' : property.latestScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {property.latestScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>{property.latestCleanliness}%</TableCell>
                      <TableCell>{property.latestBranding}%</TableCell>
                      <TableCell>{property.latestOperational}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          property.complianceZone === 'green' ? 'border-green-500 text-green-700' :
                          property.complianceZone === 'amber' ? 'border-yellow-500 text-yellow-700' :
                          'border-red-500 text-red-700'
                        }>
                          {property.complianceZone}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{property.lastAuditDate}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewPropertyDetails(property)}
                          className="mr-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
