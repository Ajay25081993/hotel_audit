import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HOTEL_AUDIT_CHECKLIST, ChecklistItem } from '@shared/auditChecklist';
import MediaDisplay from '@/components/MediaDisplay';
import { useAudits, useUpdateAudit, useProperties, useAuditItems } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Save, Send, Camera, Video, MessageSquare, Clock, CheckCircle, Calendar, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuditorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [draftNotes, setDraftNotes] = useState('');
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<ChecklistItem | null>(null);
  const [showAuditChecklist, setShowAuditChecklist] = useState(false);
  const [activeAudit, setActiveAudit] = useState<any>(null);
  const [itemData, setItemData] = useState<Record<string, { comments: string; media: any[] }>>({});
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState<'photo' | 'video' | 'text'>('photo');

  const { data: audits = [], isLoading } = useAudits({ auditorId: user?.id });
  const { data: properties = [] } = useProperties();
  const { data: auditItems = [] } = useAuditItems(activeAudit?.id || 0);
  const updateAudit = useUpdateAudit();
  const currentAudit = audits.find((audit: any) => audit.status === 'in_progress') || audits[0];
  
  // Filter audits by status
  const pendingAudits = audits.filter((audit: any) => 
    audit.status === 'scheduled' || audit.status === 'in_progress'
  );
  const completedAudits = audits.filter((audit: any) => 
    audit.status === 'submitted' || audit.status === 'approved' || audit.status === 'needs_revision'
  );
  
  // Helper function to get property name
  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property ? property.name : `Property ${propertyId}`;
  };
  
  // Helper function to get property location
  const getPropertyLocation = (propertyId: number) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property ? property.location : 'Unknown Location';
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Submitted</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'needs_revision':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSaveDraft = async () => {
    if (!activeAudit) return;
    
    try {
      await updateAudit.mutateAsync({
        id: activeAudit.id,
        status: 'in_progress'
      });
      
      toast({
        title: "Draft Saved",
        description: "Your audit progress has been saved successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitForReview = async () => {
    if (!activeAudit) return;
    
    console.log('Starting audit submission with itemData:', itemData);
    
    // Save current audit data to audit items before submitting
    const auditItemPromises = Object.entries(itemData).map(async ([itemId, data]) => {
      const checklistItem = HOTEL_AUDIT_CHECKLIST
        .flatMap(cat => cat.items)
        .find(item => item.id === itemId);
      
      if (checklistItem && (data.comments.trim() !== '' || data.media.length > 0)) {
        console.log(`Saving audit item ${itemId}:`, {
          comments: data.comments.substring(0, 50) + '...',
          mediaCount: data.media.length,
          mediaTypes: data.media.map(m => m.type)
        });
        
        // Create or update audit item
        const response = await fetch(`/api/audits/${activeAudit.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: HOTEL_AUDIT_CHECKLIST.find(cat => cat.items.some(i => i.id === itemId))?.name || 'General',
            item: checklistItem.item,
            description: checklistItem.description,
            comments: data.comments,
            mediaAttachments: data.media,
            weight: checklistItem.weight,
            maxScore: checklistItem.maxScore
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to save audit item ${itemId}:`, errorText);
          throw new Error(`Failed to save audit item: ${errorText}`);
        }
        
        const savedItem = await response.json();
        console.log(`Successfully saved audit item ${itemId}:`, savedItem.id);
        return response;
      }
    });
    
    try {
      // Wait for all audit items to be saved
      const results = await Promise.all(auditItemPromises.filter(Boolean));
      console.log(`Successfully saved ${results.length} audit items`);
      
      // Then submit the audit for review
      await updateAudit.mutateAsync({
        id: activeAudit.id,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      });
      
      console.log('Audit submitted successfully');
      
      toast({
        title: "Submitted for Review",
        description: "Your audit has been submitted for review successfully.",
      });
      
      // Reset state and go back to audit list
      setActiveAudit(null);
      setShowAuditChecklist(false);
      setItemData({});
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: `Unable to submit audit: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleMediaCapture = (itemId: string, mediaType: 'photo' | 'video' | 'text', content: any) => {
    setItemData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        comments: prev[itemId]?.comments || '',
        media: [
          ...(prev[itemId]?.media || []),
          { type: mediaType, content, timestamp: new Date().toISOString() }
        ]
      }
    }));
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCommentsChange = (itemId: string, comments: string) => {
    setItemData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        comments,
        media: prev[itemId]?.media || []
      }
    }));
  };

  const getItemData = (itemId: string) => itemData[itemId] || { comments: '', media: [] };
  
  const getCompletedItemsCount = () => {
    return Object.values(itemData).filter(item => item.comments.trim() !== '' || item.media.length > 0).length;
  };

  const getTotalItemsCount = () => {
    return HOTEL_AUDIT_CHECKLIST.reduce((total, category) => total + category.items.length, 0);
  };

  const getOverallProgress = () => {
    const completed = getCompletedItemsCount();
    const total = getTotalItemsCount();
    return total > 0 ? (completed / total) * 100 : 0;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50">
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

  if (audits.length === 0) {
    return (
      <div className="min-h-screen bg-yellow-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">My Assigned Audits</h1>
            <p className="text-gray-700 text-lg">Conduct audits, record observations, and upload evidence</p>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assigned Audits</h2>
              <p className="text-gray-600">You don't have any audits assigned to you at the moment.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render audit card
  const renderAuditCard = (audit: any) => (
    <div key={audit.id} className="audit-card">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-blue-600" />
              {getPropertyName(audit.propertyId)}
            </h3>
            <p className="text-sm text-gray-600">{getPropertyLocation(audit.propertyId)}</p>
          </div>
          {getStatusBadge(audit.status)}
        </div>
      </div>
      <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Audit ID:</span>
            <span className="font-medium">#{audit.id}</span>
          </div>
          
          {audit.createdAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(audit.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {audit.submittedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Submitted:</span>
              <span className="font-medium">{new Date(audit.submittedAt).toLocaleDateString()}</span>
            </div>
          )}
          
          {audit.overallScore && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Score:</span>
              <span className={`font-bold ${
                audit.overallScore >= 80 ? 'text-green-600' : 
                audit.overallScore >= 60 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {audit.overallScore}%
              </span>
            </div>
          )}
          
          <div className="pt-3 border-t">
            {audit.status === 'scheduled' || audit.status === 'in_progress' ? (
              <Button 
                onClick={() => handleStartAudit(audit)} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {audit.status === 'scheduled' ? 'Start Audit' : 'Continue Audit'}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleViewAudit(audit)}
                className="w-full"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
    </div>
  );

  const handleStartAudit = (audit: any) => {
    setActiveAudit(audit);
    setShowAuditChecklist(true);
    setSelectedChecklistItem(null);
    toast({
      title: "Audit Started",
      description: `Started audit for ${getPropertyName(audit.propertyId)}`,
    });
  };

  const handleViewAudit = (audit: any) => {
    setActiveAudit(audit);
    setShowAuditChecklist(true);
    toast({
      title: "Viewing Audit",
      description: `Viewing details for ${getPropertyName(audit.propertyId)}`,
    });
  };

  const handleBackToAuditList = () => {
    setShowAuditChecklist(false);
    setActiveAudit(null);
    setSelectedChecklistItem(null);
  };

  // Helper function to get audit item data for completed audits
  const getAuditItemData = (checklistItemId: string): { comments: string; media: any[]; score?: number; status?: string } => {
    if (activeAudit?.status === 'submitted' || activeAudit?.status === 'approved' || activeAudit?.status === 'needs_revision') {
      // For completed audits, get data from database
      const auditItem = auditItems.find((item: any) => 
        item.item === HOTEL_AUDIT_CHECKLIST
          .flatMap(cat => cat.items)
          .find(ci => ci.id === checklistItemId)?.item
      );
      
      let media = [];
      if (auditItem?.photos) {
        try {
          // Parse the photos JSON which contains our base64 images and other media
          media = JSON.parse(auditItem.photos);
        } catch (e) {
          console.error('Error parsing audit item photos:', e);
          media = [];
        }
      }
      
      return auditItem ? {
        comments: auditItem.comments || '',
        media: media,
        score: auditItem.score,
        status: auditItem.status
      } : { comments: '', media: [], score: undefined, status: 'pending' };
    } else {
      // For in-progress audits, get from local state
      return { ...getItemData(checklistItemId), score: undefined, status: undefined };
    }
  };

  // If showing checklist view
  if (showAuditChecklist && activeAudit) {
    return (
      <div className="min-h-screen bg-yellow-50">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={handleBackToAuditList}
              className="mb-4"
            >
              ← Back to Audit List
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Audit: {getPropertyName(activeAudit.propertyId)}
            </h1>
            <p className="text-gray-700 text-lg">{getPropertyLocation(activeAudit.propertyId)}</p>
          </div>

          {/* Current Audit Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Audit Progress</CardTitle>
                {getStatusBadge(activeAudit.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Progress</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {getCompletedItemsCount()}/{getTotalItemsCount()} items completed
                        </span>
                      </div>
                      <Progress value={getOverallProgress()} className="h-3" />
                    </div>
                    
                    {HOTEL_AUDIT_CHECKLIST.map((category) => {
                      const categoryCompleted = category.items.filter(item => {
                        const data = getAuditItemData(item.id);
                        return data.comments.trim() !== '' || data.media.length > 0;
                      }).length;
                      const categoryProgress = category.items.length > 0 ? (categoryCompleted / category.items.length) * 100 : 0;
                      
                      return (
                        <div key={category.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">{category.name}</span>
                            <span className="text-sm font-semibold text-gray-700">
                              {categoryCompleted}/{category.items.length}
                            </span>
                          </div>
                          <Progress value={categoryProgress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Hotel Audit Checklist */}
          <div className="space-y-6">
            {HOTEL_AUDIT_CHECKLIST.map((category) => (
              <Card key={category.id} className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {category.items.filter(item => {
                        const data = getAuditItemData(item.id);
                        return data.comments.trim() !== '' || data.media.length > 0;
                      }).length}/{category.items.length} completed
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.items.map((item) => {
                      const currentItemData = getAuditItemData(item.id);
                      return (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{item.item}</h3>
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Weight: {item.weight}</span>
                                <span className="text-xs text-gray-500">AI will score this item during review</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Media Upload Options - Only show for in-progress audits */}
                          {(activeAudit?.status === 'scheduled' || activeAudit?.status === 'in_progress') && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Collection</label>
                              <div className="flex gap-2 mb-3">
                                {item.mediaTypes.includes('photo') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = async (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) {
                                        try {
                                          // Convert file to base64 for persistent storage
                                          const base64 = await fileToBase64(file);
                                          handleMediaCapture(item.id, 'photo', base64);
                                          toast({
                                            title: "Photo Captured",
                                            description: "Photo has been saved to the audit.",
                                          });
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description: "Failed to process the image.",
                                            variant: "destructive"
                                          });
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Camera className="h-4 w-4" />
                                  Photo
                                  {item.requiredMedia?.includes('photo') && <span className="text-red-500">*</span>}
                                </Button>
                              )}
                              {item.mediaTypes.includes('video') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'video/*';
                                    input.onchange = async (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) {
                                        try {
                                          // Convert file to base64 for persistent storage
                                          const base64 = await fileToBase64(file);
                                          handleMediaCapture(item.id, 'video', base64);
                                          toast({
                                            title: "Video Captured",
                                            description: "Video has been saved to the audit.",
                                          });
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description: "Failed to process the video.",
                                            variant: "destructive"
                                          });
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Video className="h-4 w-4" />
                                  Video
                                  {item.requiredMedia?.includes('video') && <span className="text-red-500">*</span>}
                                </Button>
                              )}
                              {item.mediaTypes.includes('text') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const textNote = prompt('Enter your text note:');
                                    if (textNote) {
                                      handleMediaCapture(item.id, 'text', textNote);
                                    }
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  Text Notes
                                  {item.requiredMedia?.includes('text') && <span className="text-red-500">*</span>}
                                </Button>
                              )}
                            </div>
                            
                            {/* Display collected media */}
                            {currentItemData.media.length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mb-4">
                                {currentItemData.media.map((media: any, index: number) => (
                                  <div key={index} className="border rounded p-2 bg-gray-50">
                                    <div className="text-xs text-gray-600 mb-1">
                                      {media.type === 'photo' && '📷 Photo'}
                                      {media.type === 'video' && '📹 Video'}
                                      {media.type === 'text' && '📝 Text Note'}
                                    </div>
                                    {media.type === 'text' && (
                                      <p className="text-sm text-gray-800 truncate">{media.content}</p>
                                    )}
                                    {media.type === 'photo' && (
                                      <img src={media.content} alt="Evidence" className="w-full h-16 object-cover rounded" />
                                    )}
                                    {media.type === 'video' && (
                                      <video src={media.content} className="w-full h-16 object-cover rounded" controls />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          )}

                          {/* Comments */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Auditor Observations & Comments
                              <span className="text-xs text-blue-600 ml-2">(Required for AI scoring)</span>
                            </label>
                            {activeAudit?.status === 'submitted' || activeAudit?.status === 'approved' || activeAudit?.status === 'needs_revision' ? (
                              <div className="p-3 bg-gray-50 border rounded-md min-h-[80px]">
                                {currentItemData.comments ? (
                                  <p className="text-gray-700">{currentItemData.comments}</p>
                                ) : (
                                  <p className="text-gray-500 italic">No comments provided</p>
                                )}
                                {currentItemData.score && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm font-semibold text-blue-600">Score: {currentItemData.score}/5</span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      currentItemData.score >= 4 ? 'bg-green-100 text-green-700' :
                                      currentItemData.score >= 3 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {currentItemData.score >= 4 ? 'Good' : currentItemData.score >= 3 ? 'Fair' : 'Poor'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Textarea 
                                rows={3} 
                                value={currentItemData.comments}
                                onChange={(e) => handleCommentsChange(item.id, e.target.value)}
                                placeholder="Describe what you observed for this item. Be specific about compliance, cleanliness, staff behavior, etc. The AI will use these observations to generate an accurate score."
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Additional Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Audit Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="Add any additional observations, recommendations, or overall assessment notes..."
                  className="min-h-24"
                />
                
                {/* Submit Actions - Only show for audits that can be edited */}
                {(activeAudit?.status === 'scheduled' || activeAudit?.status === 'in_progress') && (
                  <div className="flex space-x-4 mt-6">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleSaveDraft}
                      disabled={updateAudit.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateAudit.isPending ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button 
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={handleSubmitForReview}
                      disabled={updateAudit.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {updateAudit.isPending ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  </div>
                )}
                
                {/* Show read-only message for completed audits */}
                {(activeAudit?.status === 'submitted' || activeAudit?.status === 'approved' || activeAudit?.status === 'completed' || activeAudit?.status === 'needs_revision') && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {activeAudit?.status === 'submitted' && 'This audit has been submitted for review and cannot be modified.'}
                        {activeAudit?.status === 'approved' && 'This audit has been approved and is now read-only.'}
                        {activeAudit?.status === 'completed' && 'This audit has been completed and is now read-only.'}
                        {activeAudit?.status === 'needs_revision' && 'This audit needs revision. Please contact your supervisor for next steps.'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Default audit list view
  return (
    <div 
      className="min-h-screen bg-yellow-50 relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-yellow-50/80"></div>
      <div className="relative z-10">
        <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">My Assigned Audits</h1>
          <p className="text-gray-700 text-lg">Conduct audits, record observations, and upload evidence</p>
        </div>

        {/* Summary Stats */}
        <div className="dashboard-section">
          <div className="grid grid-cols-1 md:grid-cols-3 dashboard-grid">
          <div className="metric-card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Pending Audits</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{pendingAudits.length}</p>
                <p className="text-xs text-blue-600 mt-1">Ready to start</p>
              </div>
              <div className="icon-container-primary">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Completed Audits</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{completedAudits.length}</p>
                <p className="text-xs text-green-600 mt-1">Successfully submitted</p>
              </div>
              <div className="icon-container-success">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-purple">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Total Audits</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{audits.length}</p>
                <p className="text-xs text-purple-600 mt-1">All assignments</p>
              </div>
              <div className="icon-container-purple">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Audits Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Audits ({pendingAudits.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed Audits ({completedAudits.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {pendingAudits.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Audits</h3>
                  <p className="text-gray-600">All your audits are completed or you have no assignments.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingAudits.map(renderAuditCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {completedAudits.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Audits</h3>
                  <p className="text-gray-600">You haven't completed any audits yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAudits.map(renderAuditCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>


      </div>
      </div>
    </div>
  );
}