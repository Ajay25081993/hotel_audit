import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { HOTEL_AUDIT_CHECKLIST } from '@shared/auditChecklist';
import { useAudits, useUpdateAudit, useAuditItems, useProperties } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { CheckCircle, XCircle, AlertTriangle, Clock, Eye, MessageSquare, Brain, Zap } from 'lucide-react';
import MediaDisplay from '@/components/MediaDisplay';

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [scoreOverrides, setScoreOverrides] = useState<Record<string, number>>({});
  const [aiAnalysisResults, setAiAnalysisResults] = useState<Record<string, { score: number; aiAnalysis: string; isOverridden?: boolean }>>({});
  const [analyzingItems, setAnalyzingItems] = useState<Set<number>>(new Set());
  const [isRunningComprehensiveAnalysis, setIsRunningComprehensiveAnalysis] = useState(false);

  // Fetch audits assigned to this reviewer that are submitted
  const { data: allAudits = [], isLoading } = useAudits({ reviewerId: user?.id });
  const { data: properties = [] } = useProperties();
  const updateAudit = useUpdateAudit();
  
  // Filter audits that are submitted and awaiting review, or already approved for viewing
  // Only show audits that have been submitted by auditors
  const pendingAudits = allAudits.filter((audit: any) => audit.status === 'submitted');
  const completedAudits = allAudits.filter((audit: any) => audit.status === 'approved');
  const availableAudits = [...pendingAudits, ...completedAudits];
  const selectedAudit = selectedAuditId ? allAudits.find((audit: any) => audit.id === selectedAuditId) : availableAudits[0];
  
  // Fetch audit items for selected audit
  const { data: auditItems = [] } = useAuditItems(selectedAudit?.id);

  // Helper functions to get property and hotel group names
  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property ? property.name : `Property ${propertyId}`;
  };

  const getHotelGroupName = (hotelGroupId: number) => {
    // For now, return a simple mapping since we don't have hotel groups data
    const hotelGroupMap: { [key: number]: string } = {
      1: 'Taj Hotels',
      2: 'Marriott Hotels',
      3: 'Hilton Hotels'
    };
    return hotelGroupMap[hotelGroupId] || `Hotel Group ${hotelGroupId}`;
  };

  // Check if AI analysis is complete for the audit
  const isAIAnalysisComplete = () => {
    if (!selectedAudit || !auditItems.length) return false;
    
    // Check if overall audit analysis is complete (audit has AI-generated scores)
    const hasOverallAnalysis = selectedAudit.overallScore && 
                              selectedAudit.cleanlinessScore && 
                              selectedAudit.brandingScore && 
                              selectedAudit.operationalScore;
    
    // Check if individual item analysis is complete
    const completedItemsCount = auditItems.filter((item: any) => 
      aiAnalysisResults[item.id] && aiAnalysisResults[item.id].aiAnalysis
    ).length;
    
    const totalItemsWithData = auditItems.filter((item: any) => item.comments || item.photos).length;
    
    // AI analysis is complete if we have overall analysis OR most individual items are analyzed
    return hasOverallAnalysis || (totalItemsWithData > 0 && completedItemsCount >= totalItemsWithData * 0.8);
  };

  const handleApproveAudit = async () => {
    if (!selectedAudit) return;
    
    try {
      // First, save all AI-generated scores to audit items
      const savePromises = auditItems.map(async (item: any) => {
        const aiResult = aiAnalysisResults[item.id];
        if (aiResult && aiResult.score !== undefined) {
          await fetch(`/api/audit-items/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              score: aiResult.score,
              aiAnalysis: aiResult.aiAnalysis 
            })
          });
        }
      });
      
      // Wait for all item scores to be saved
      await Promise.all(savePromises);
      
      // Then approve the audit
      await updateAudit.mutateAsync({
        id: selectedAudit.id,
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        // Add any score overrides or review notes here
        ...(reviewNotes && { findings: reviewNotes })
      });
      
      toast({
        title: "Audit Approved",
        description: "The audit has been approved with AI scores saved to database.",
      });
      
      // Reset selection to next pending audit
      setSelectedAuditId(null);
      setReviewNotes('');
      setScoreOverrides({});
      setAiAnalysisResults({});
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: "Approval Failed",
        description: "Unable to approve audit. Please try again.",
        variant: "destructive"
      });
    }
  };



  // AI Analysis mutation
  const analyzeAudit = useMutation({
    mutationFn: async (auditId: number) => {
      const response = await fetch(`/api/audits/${auditId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "AI Analysis Complete",
        description: "The audit has been analyzed and scored by AI.",
      });
      
      // Sync scores to ensure all dashboards show updated values
      if (selectedAudit?.id) {
        try {
          const syncResponse = await fetch(`/api/audits/${selectedAudit.id}/sync-scores`, {
            method: 'POST',
          });
        } catch (error) {
          console.error('Score sync error:', error);
        }
      }
      
      // Instead of hard refresh, invalidate the cache to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/audits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/audits', selectedAudit?.id, 'items'] });
    },
    onError: (error) => {
      console.error('AI analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "AI analysis could not be completed. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleRunAIAnalysis = () => {
    if (!selectedAudit) return;
    analyzeAudit.mutate(selectedAudit.id);
  };

  // Analyze individual audit item
  const analyzeIndividualItem = async (itemId: number, auditItem: any) => {
    setAnalyzingItems(prev => new Set(Array.from(prev).concat(itemId)));
    
    try {
      const response = await fetch(`/api/audit-items/${itemId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId: selectedAudit?.id,
          checklistDetails: {
            description: auditItem.description || '',
            weight: auditItem.weight || 1,
            maxScore: 5
          }
        })
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      
      setAiAnalysisResults(prev => ({
        ...prev,
        [itemId]: {
          score: result.score,
          aiAnalysis: result.aiAnalysis,
          isOverridden: false
        }
      }));
      
      toast({
        title: "Item Analyzed",
        description: `AI analysis complete for: ${auditItem.item}`,
      });
    } catch (error) {
      console.error('Individual item analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze this item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingItems(prev => new Set(Array.from(prev).filter(id => id !== itemId)));
    }
  };

  // Override AI score
  const handleScoreOverride = async (itemId: number, newScore: number) => {
    try {
      const response = await fetch(`/api/audit-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: newScore, auditId: selectedAudit?.id })
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      setAiAnalysisResults(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          score: newScore,
          isOverridden: true
        }
      }));
      
      // Sync scores to ensure all dashboards show updated values
      if (selectedAudit?.id) {
        await fetch(`/api/audits/${selectedAudit.id}/sync-scores`, {
          method: 'POST',
        });
        
        // Invalidate cache to refresh all dashboard data
        queryClient.invalidateQueries({ queryKey: ['/api/audits'] });
      }
      
      toast({
        title: "Score Updated",
        description: `Score overridden to ${newScore} out of 5`,
      });
    } catch (error) {
      console.error('Score override error:', error);
      toast({
        title: "Update Failed",
        description: "Could not update score. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRunComprehensiveAnalysis = async () => {
    if (!selectedAudit || !auditItems.length) return;
    
    setIsRunningComprehensiveAnalysis(true);
    
    try {
      // Step 1: Analyze all individual items with enhanced media analysis
      const itemAnalysisPromises = auditItems.map((item: any) => analyzeIndividualItem(item.id, item));
      await Promise.all(itemAnalysisPromises);
      
      // Step 2: Run overall audit analysis
      await analyzeAudit.mutateAsync(selectedAudit.id);
      
      // Step 3: Sync scores to ensure all dashboards show updated values
      if (selectedAudit?.id) {
        try {
          await fetch(`/api/audits/${selectedAudit.id}/sync-scores`, {
            method: 'POST',
          });
        } catch (error) {
          console.error('Score sync error:', error);
        }
      }
      
      toast({
        title: "Comprehensive Analysis Complete",
        description: `AI has analyzed all ${auditItems.length} items and generated overall audit scores based on both text descriptions and visual media content.`,
      });
    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete comprehensive analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRunningComprehensiveAnalysis(false);
    }
  };

  // Calculate real-time scores from individual item scores
  const calculateRealTimeScores = () => {
    if (!auditItems.length) return { overall: 0, cleanliness: 0, branding: 0, operational: 0 };
    
    // Get items that have been analyzed (have AI results or existing scores)
    const analyzedItems = auditItems.filter((item: any) => {
      const aiResult = aiAnalysisResults[item.id];
      return aiResult || item.score;
    });
    
    if (analyzedItems.length === 0) return { overall: 0, cleanliness: 0, branding: 0, operational: 0 };
    
    // Group items by category for detailed scoring
    const categoryScores = {
      cleanliness: [] as number[],
      branding: [] as number[],
      operational: [] as number[]
    };
    
    analyzedItems.forEach((item: any) => {
      const aiResult = aiAnalysisResults[item.id];
      const score = aiResult ? aiResult.score : (item.score || 0);
      const category = item.category;
      
      // Match actual database categories
      if (category === 'Cleanliness' || 
          category === 'Room Experience & Amenities' ||
          category.includes('clean') || category.includes('maintenance') || category.includes('hygiene')) {
        categoryScores.cleanliness.push(score);
      } else if (category === 'Branding' || 
                 category === 'Staff Interaction & Service' ||
                 category.includes('brand') || category.includes('signage') || category.includes('logo') || category.includes('uniform')) {
        categoryScores.branding.push(score);
      } else {
        // All other categories: Arrival & Check-In, Dining Experience, Operational
        categoryScores.operational.push(score);
      }
    });
    
    // Calculate category averages (convert 0-5 scale to 0-100)
    const cleanlinessScore = categoryScores.cleanliness.length > 0 
      ? Math.round((categoryScores.cleanliness.reduce((a, b) => a + b, 0) / categoryScores.cleanliness.length) * 20)
      : 0;
      
    const brandingScore = categoryScores.branding.length > 0
      ? Math.round((categoryScores.branding.reduce((a, b) => a + b, 0) / categoryScores.branding.length) * 20)
      : 0;
      
    const operationalScore = categoryScores.operational.length > 0
      ? Math.round((categoryScores.operational.reduce((a, b) => a + b, 0) / categoryScores.operational.length) * 20)
      : 0;
    
    // Calculate overall score as weighted average
    const overallScore = Math.round((cleanlinessScore * 0.4 + brandingScore * 0.3 + operationalScore * 0.3));
    
    return {
      overall: overallScore,
      cleanliness: cleanlinessScore,
      branding: brandingScore,
      operational: operationalScore
    };
  };

  // Calculate overall score for compatibility
  const calculateOverallScore = () => {
    return calculateRealTimeScores().overall;
  };

  // Get count of analyzed items for display
  const getAnalyzedItemsCount = () => {
    return auditItems.filter((item: any) => {
      const aiResult = aiAnalysisResults[item.id];
      return aiResult || item.score;
    }).length;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'needs_revision':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIcon = (audit: any) => {
    // Simple priority logic - can be enhanced with AI analysis
    if (audit.overallScore && audit.overallScore < 70) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (audit.overallScore && audit.overallScore < 85) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where no audits are available
  if (availableAudits.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Review Queue</h1>
            <p className="text-gray-700 text-lg">Validate audit reports and AI-generated scores</p>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Audits to Review</h2>
              <p className="text-gray-600">There are currently no audits assigned to you for review.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen reviewer-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Review Queue</h1>
          <p className="text-gray-700 text-lg">Validate audit reports and AI-generated scores</p>
        </div>

        {/* Statistics Cards */}
        <div className="dashboard-section">
          <div className="grid grid-cols-1 md:grid-cols-4 dashboard-grid">
          <div className="metric-card-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Pending Reviews</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{pendingAudits.length}</p>
                <p className="text-xs text-amber-600 mt-1">Awaiting review</p>
              </div>
              <div className="icon-container-warning">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Approved Today</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{allAudits.filter((a: any) => a.status === 'approved').length}</p>
                <p className="text-xs text-green-600 mt-1">Completed reviews</p>
              </div>
              <div className="icon-container-success">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="metric-card-danger">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Critical Issues</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{allAudits.filter((a: any) => a.overallScore && a.overallScore < 70).length}</p>
                <p className="text-xs text-red-600 mt-1">Score below 70%</p>
              </div>
              <div className="icon-container-danger">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="metric-card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Audits</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{allAudits.length}</p>
                <p className="text-xs text-blue-600 mt-1">All submissions</p>
              </div>
              <div className="icon-container-primary">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 dashboard-grid">
          {/* Review Queue */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingAudits.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No pending reviews</p>
                    <p className="text-sm text-gray-500">All audits are up to date!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAudits.map((audit: any) => (
                      <div
                        key={audit.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAudit?.id === audit.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAuditId(audit.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(audit)}
                            <h4 className="font-semibold text-gray-900">{getPropertyName(audit.propertyId)}</h4>
                          </div>
                          {getStatusBadge(audit.status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Hotel Group: {getHotelGroupName(audit.hotelGroupId)}</p>
                          <p>Auditor: {audit.auditorId === 2 ? 'Sarah Johnson' : 'Unknown Auditor'}</p>
                          <p>Submitted: {audit.submittedAt ? new Date(audit.submittedAt).toLocaleDateString() : 'Recently'}</p>
                          {audit.overallScore && (
                            <p>AI Score: <span className="font-semibold">{audit.overallScore}/100</span></p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Details */}
          <div className="lg:col-span-2">
            {selectedAudit ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Review Details - {getPropertyName(selectedAudit.propertyId)}</CardTitle>
                    {getStatusBadge(selectedAudit.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="checklist" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="checklist">Audit Checklist</TabsTrigger>
                      <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
                      <TabsTrigger value="review">Review & Approve</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="checklist" className="space-y-6 mt-6">
                      <div className="text-sm text-gray-600 mb-4">
                        Review the auditor's observations and evidence collected for each checklist item.
                      </div>
                      
                      {HOTEL_AUDIT_CHECKLIST.map((category) => (
                        <div key={category.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-4">{category.name}</h3>
                          <div className="space-y-4">
                            {category.items.map((item) => {
                              const auditItem = auditItems.find((ai: any) => ai.category === category.name && ai.item.includes(item.item.split(' ')[0]));
                              
                              return (
                                <div key={item.id} className="border-l-4 border-gray-200 pl-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">{item.item}</h4>
                                      <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                    <div className="ml-4 text-right">
                                      <div className="text-sm text-gray-500">Weight: {item.weight}</div>
                                      {auditItem?.score && (
                                        <div className="text-lg font-semibold text-blue-600">
                                          {auditItem.score}/{item.maxScore}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {auditItem?.comments && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded">
                                      <p className="text-sm text-gray-700">
                                        <MessageSquare className="h-4 w-4 inline mr-1" />
                                        <strong>Auditor Notes:</strong> {auditItem.comments}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {!auditItem && (
                                    <div className="mt-2 p-3 bg-yellow-50 rounded">
                                      <p className="text-sm text-yellow-700">No auditor data collected for this item</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="ai-analysis" className="space-y-6 mt-6">
                      <div className="p-6 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg text-blue-800">AI Analysis Results</h3>
                          <Button 
                            onClick={handleRunComprehensiveAnalysis}
                            disabled={isRunningComprehensiveAnalysis || Array.from(analyzingItems).length > 0 || analyzeAudit.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isRunningComprehensiveAnalysis ? (
                              <>
                                <Zap className="h-4 w-4 mr-2 animate-spin" />
                                Running Comprehensive Analysis...
                              </>
                            ) : (
                              <>
                                <Brain className="h-4 w-4 mr-2" />
                                Run AI Analysis
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {(selectedAudit.overallScore || getAnalyzedItemsCount() > 0) ? (
                          <div className="space-y-4">
                            {/* Real-time calculated scores */}
                            {(() => {
                              const realTimeScores = calculateRealTimeScores();
                              const displayScore = getAnalyzedItemsCount() > 0 ? realTimeScores.overall : selectedAudit.overallScore;
                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-blue-700">Overall Score:</span>
                                    <span className="text-2xl font-bold text-blue-800">{displayScore}/100</span>
                                  </div>
                                  
                                  <Progress value={displayScore} className="h-3" />
                                  
                                  <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center">
                                      <div className="text-lg font-semibold text-gray-800">
                                        {getAnalyzedItemsCount() > 0 ? realTimeScores.cleanliness : (selectedAudit.cleanlinessScore || 'N/A')}
                                      </div>
                                      <div className="text-sm text-gray-600">Cleanliness</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-semibold text-gray-800">
                                        {getAnalyzedItemsCount() > 0 ? realTimeScores.branding : (selectedAudit.brandingScore || 'N/A')}
                                      </div>
                                      <div className="text-sm text-gray-600">Branding</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-semibold text-gray-800">
                                        {getAnalyzedItemsCount() > 0 ? realTimeScores.operational : (selectedAudit.operationalScore || 'N/A')}
                                      </div>
                                      <div className="text-sm text-gray-600">Operations</div>
                                    </div>
                                  </div>
                                  
                                  {getAnalyzedItemsCount() > 0 && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                      <p className="text-sm text-green-700 font-medium">
                                        ✓ Real-time scores calculated from {getAnalyzedItemsCount()} analyzed items
                                      </p>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                            <p className="text-blue-700 font-medium">AI Analysis Not Started</p>
                            <p className="text-sm text-blue-600">Click "Run AI Analysis" to analyze both individual items and generate overall audit scores based on visual media content and text descriptions.</p>
                          </div>
                        )}
                        
                        {selectedAudit.findings && (
                          <div className="mt-6 space-y-4">
                            <div className="p-4 bg-white rounded border">
                              <h4 className="font-medium text-gray-900 mb-2">
                                <Brain className="h-4 w-4 inline mr-2" />
                                AI Findings & Insights
                              </h4>
                              <p className="text-gray-700 whitespace-pre-line">{selectedAudit.findings}</p>
                            </div>
                            
                            {selectedAudit.actionPlan && (
                              <div className="p-4 bg-green-50 rounded border border-green-200">
                                <h4 className="font-medium text-green-900 mb-2">
                                  <Zap className="h-4 w-4 inline mr-2" />
                                  Recommended Action Plan
                                </h4>
                                <p className="text-green-800 whitespace-pre-line">{selectedAudit.actionPlan}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Individual Item Analysis */}
                      <div className="space-y-6">
                        <h3 className="font-semibold text-lg text-gray-800">Individual Item Analysis</h3>
                        
                        {HOTEL_AUDIT_CHECKLIST.map((category) => (
                          <div key={category.id} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-4 text-gray-900">{category.name}</h4>
                            <div className="space-y-4">
                              {category.items.map((item) => {
                                const auditItem = auditItems.find((ai: any) => ai.category === category.name && ai.item.includes(item.item.split(' ')[0]));
                                const aiResult = auditItem ? aiAnalysisResults[auditItem.id] : null;
                                const isAnalyzing = auditItem ? analyzingItems.has(auditItem.id) : false;
                                
                                return (
                                  <div key={item.id} className="border rounded-lg p-4 bg-white">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-900">{item.item}</h5>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                      </div>
                                      
                                      <div className="ml-4 flex items-center space-x-3">
                                        {auditItem && (
                                          <Button
                                            onClick={() => analyzeIndividualItem(auditItem.id, auditItem)}
                                            disabled={isAnalyzing}
                                            variant="outline"
                                            size="sm"
                                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                                          >
                                            {isAnalyzing ? (
                                              <Zap className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Brain className="h-4 w-4" />
                                            )}
                                          </Button>
                                        )}
                                        
                                        {aiResult && (
                                          <div className="text-right">
                                            <div className={`text-lg font-bold ${aiResult.isOverridden ? 'text-orange-600' : 'text-blue-600'}`}>
                                              {aiResult.score}/5
                                            </div>
                                            {aiResult.isOverridden && (
                                              <div className="text-xs text-orange-600">Overridden</div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {auditItem?.comments && (
                                      <div className="mb-3 p-3 bg-gray-50 rounded">
                                        <p className="text-sm text-gray-700">
                                          <MessageSquare className="h-4 w-4 inline mr-1" />
                                          <strong>Auditor:</strong> {auditItem.comments}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Display audit evidence using MediaDisplay component */}
                                    <div className="mb-3">
                                      <MediaDisplay 
                                        photos={auditItem?.photos || '[]'} 
                                        title="Audit Evidence"
                                        compact={true}
                                      />
                                    </div>
                                    
                                    {aiResult && (
                                      <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 rounded">
                                          <p className="text-sm text-blue-700">
                                            <Brain className="h-4 w-4 inline mr-1" />
                                            <strong>AI Analysis:</strong> {aiResult.aiAnalysis}
                                          </p>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                          <label className="text-sm font-medium text-gray-700">Override Score:</label>
                                          <Select onValueChange={(value) => handleScoreOverride(auditItem.id, parseInt(value))}>
                                            <SelectTrigger className="w-20">
                                              <SelectValue placeholder={aiResult.score.toString()} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="0">0</SelectItem>
                                              <SelectItem value="1">1</SelectItem>
                                              <SelectItem value="2">2</SelectItem>
                                              <SelectItem value="3">3</SelectItem>
                                              <SelectItem value="4">4</SelectItem>
                                              <SelectItem value="5">5</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {!auditItem && (
                                      <div className="p-3 bg-yellow-50 rounded">
                                        <p className="text-sm text-yellow-700">No auditor data available for this item</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        
                        {auditItems.length > 0 && getAnalyzedItemsCount() > 0 && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Overall Calculated Score</h4>
                            <div className="flex items-center justify-between">
                              <span className="text-green-700">Based on {getAnalyzedItemsCount()} analyzed items:</span>
                              <span className="text-2xl font-bold text-green-800">{calculateOverallScore()}/100</span>
                            </div>
                            <Progress value={calculateOverallScore()} className="h-3 mt-2" />
                            <p className="text-xs text-green-600 mt-1">
                              {getAnalyzedItemsCount()} of {auditItems.length} items analyzed
                            </p>
                          </div>
                        )}
                        
                        {auditItems.length > 0 && getAnalyzedItemsCount() === 0 && (
                          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-medium text-amber-800 mb-2">No Items Analyzed Yet</h4>
                            <p className="text-amber-700 text-sm">
                              Click "Run AI Analysis" to analyze individual items and calculate the overall score.
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="review" className="space-y-6 mt-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reviewer Notes & Comments
                          </label>
                          <Textarea
                            rows={4}
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add your review comments, recommendations, or any additional observations..."
                            className="w-full"
                          />
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Score Override (Optional)</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Only override AI scores if you have specific reasons. Document your reasoning in the notes above.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">Overall Score Override</label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Leave blank to keep AI score"
                                value={scoreOverrides.overall || ''}
                                onChange={(e) => setScoreOverrides(prev => ({ ...prev, overall: parseInt(e.target.value) || 0 }))}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Analysis Status Indicator */}
                        {!isAIAnalysisComplete() && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                            <div className="flex items-center">
                              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                              <div>
                                <h4 className="font-medium text-amber-800">AI Analysis Required</h4>
                                <p className="text-sm text-amber-700">
                                  Please run AI analysis on audit items before approval. 
                                  Go to the "AI Analysis" tab to analyze individual items or run overall audit analysis.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Show approve button only for submitted audits, not already approved ones */}
                        {selectedAudit?.status === 'submitted' && (
                          <div className="flex justify-center pt-6 border-t">
                            <Button
                              onClick={handleApproveAudit}
                              className="px-8 bg-green-600 hover:bg-green-700"
                              disabled={updateAudit.isPending || !isAIAnalysisComplete()}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {updateAudit.isPending ? 'Processing...' : 
                               !isAIAnalysisComplete() ? 'Complete AI Analysis First' : 'Approve Audit'}
                            </Button>
                          </div>
                        )}
                        
                        {/* Show read-only message for approved audits */}
                        {selectedAudit?.status === 'approved' && (
                          <div className="flex justify-center pt-6 border-t">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  This audit has already been approved and is now read-only.
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Audit to Review</h3>
                  <p className="text-gray-600">Choose an audit from the queue to begin your review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}