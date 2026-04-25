import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, TrendingUp, AlertCircle, Building, FileText, Bot, Eye, History, Plus, Clock, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { SOPFileUpload } from '@/components/SOPFileUpload';
import MediaDisplay from '@/components/MediaDisplay';
import { useProperties, useAudits, useHealthCheck, useCreateAudit } from '@/hooks/use-api';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const scheduleAuditSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  auditorId: z.string().min(1, "Auditor is required"),
  reviewerId: z.string().min(1, "Reviewer is required"),
  hotelGroupId: z.string().min(1, "Hotel group is required"),
  sop: z.string().optional(),
  sopFiles: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string(),
    uploadedAt: z.string(),
  })).min(1, "At least one SOP document is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
});

type ScheduleAuditForm = z.infer<typeof scheduleAuditSchema>;

// Component for displaying approved audit overview
function ApprovedAuditsOverview({ audits, properties }: { audits: any[], properties: any[] }) {
  const approvedAudits = audits.filter((audit: any) => audit.status === 'approved');

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property ? property.name : `Property ${propertyId}`;
  };

  if (approvedAudits.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No approved audits yet</p>
        <p className="text-sm text-gray-500">Approved audits will appear here with detailed information</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {approvedAudits.map((audit: any) => (
          <Card key={audit.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{getPropertyName(audit.propertyId)}</h3>
                <Badge className="bg-green-100 text-green-800">Approved</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Score:</span>
                  <span className="font-medium">{audit.overallScore !== null && audit.overallScore !== undefined ? audit.overallScore : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cleanliness:</span>
                  <span className="font-medium">{audit.cleanlinessScore !== null && audit.cleanlinessScore !== undefined ? audit.cleanlinessScore : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branding:</span>
                  <span className="font-medium">{audit.brandingScore !== null && audit.brandingScore !== undefined ? audit.brandingScore : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Operational:</span>
                  <span className="font-medium">{audit.operationalScore !== null && audit.operationalScore !== undefined ? audit.operationalScore : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviewed:</span>
                  <span className="font-medium">
                    {audit.reviewedAt ? new Date(audit.reviewedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Component for displaying detailed audit information
function ApprovedAuditDetails({ auditId, audits, properties }: { auditId: number, audits: any[], properties: any[] }) {
  
  // Fetch audit items for the selected audit
  const { data: auditItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/audits', auditId, 'items'],
    queryFn: () => fetch(`/api/audits/${auditId}/items`).then(res => res.json()),
    enabled: !!auditId,
  });

  const audit = audits.find((a: any) => a.id === auditId);
  const property = properties.find((p: any) => p.id === audit?.propertyId);

  if (!audit) {
    return <div className="text-center py-8 text-gray-600">Audit not found</div>;
  }

  if (itemsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audit Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{property?.name || 'Unknown Property'}</h2>
            <p className="text-gray-600">{property?.location || 'Unknown Location'}</p>
          </div>
          <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">Approved</Badge>
        </div>
      </div>

      {/* Audit Scores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{audit.overallScore || 'N/A'}</div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{audit.cleanlinessScore || 'N/A'}</div>
            <div className="text-sm text-gray-600">Cleanliness</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{audit.brandingScore || 'N/A'}</div>
            <div className="text-sm text-gray-600">Branding</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{audit.operationalScore || 'N/A'}</div>
            <div className="text-sm text-gray-600">Operational</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Items */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Checklist Details</CardTitle>
        </CardHeader>
        <CardContent>
          {auditItems.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No audit items found for this audit
            </div>
          ) : (
            <div className="space-y-4">
              {auditItems.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={
                            item.category === 'Cleanliness' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            item.category === 'Branding' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            item.category === 'Operational' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        >
                          {item.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={item.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900">{item.item}</h4>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${
                        item.score !== null && item.score !== undefined ? (
                          item.score >= 4 ? 'text-green-600' : 
                          item.score >= 3 ? 'text-yellow-600' : 
                          'text-red-600'
                        ) : 'text-gray-400'
                      }`}>
                        {item.score !== null && item.score !== undefined ? `${item.score}/5` : 'Not Scored'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.score !== null && item.score !== undefined ? 'AI Score' : 'Pending Analysis'}
                      </div>
                    </div>
                  </div>
                  {item.comments && (
                    <div className="mt-3 space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Auditor Comments:</h5>
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-sm text-gray-800 whitespace-pre-line">{item.comments}</p>
                      </div>
                    </div>
                  )}
                  {item.aiAnalysis && (
                    <div className="mt-3 space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">AI Analysis:</h5>
                      <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                        <p className="text-sm text-gray-800">
                          {item.aiAnalysis.length > 200 
                            ? `${item.aiAnalysis.substring(0, 200)}...` 
                            : item.aiAnalysis}
                        </p>
                        {item.aiAnalysis.length > 200 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 p-0 h-auto text-purple-600 hover:text-purple-800"
                            onClick={() => {
                              // Toggle full text display
                              const fullTextElement = document.getElementById(`analysis-${item.id}`);
                              if (fullTextElement) {
                                fullTextElement.style.display = fullTextElement.style.display === 'none' ? 'block' : 'none';
                              }
                            }}
                          >
                            Show full analysis
                          </Button>
                        )}
                        {item.aiAnalysis.length > 200 && (
                          <div id={`analysis-${item.id}`} style={{ display: 'none' }} className="mt-2 pt-2 border-t border-purple-200">
                            <p className="text-sm text-gray-800 whitespace-pre-line">{item.aiAnalysis}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {!item.comments && !item.aiAnalysis && (
                    <div className="mt-3 p-3 bg-gray-50 border-l-4 border-gray-300 rounded">
                      <p className="text-sm text-gray-600 italic">No details available for this audit item</p>
                    </div>
                  )}
                  {/* Display audit evidence using MediaDisplay component */}
                  <div className="mt-3">
                    <MediaDisplay 
                      photos={item.photos || '[]'} 
                      title="Audit Evidence"
                      className="border-t pt-3"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Meta Information */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Audit ID:</span>
              <span className="ml-2">{audit.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Created:</span>
              <span className="ml-2">{new Date(audit.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Submitted:</span>
              <span className="ml-2">
                {audit.submittedAt ? new Date(audit.submittedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Reviewed:</span>
              <span className="ml-2">
                {audit.reviewedAt ? new Date(audit.reviewedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Compliance Zone:</span>
              <span className="ml-2">
                <Badge 
                  variant="outline" 
                  className={audit.complianceZone === 'green' ? 'bg-green-50 text-green-700' : 
                             audit.complianceZone === 'amber' ? 'bg-yellow-50 text-yellow-700' : 
                             'bg-red-50 text-red-700'}
                >
                  {audit.complianceZone || 'N/A'}
                </Badge>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('audits');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);

  // Data fetching hooks
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  const { data: audits = [], isLoading: auditsLoading } = useAudits();
  const { data: healthStatus } = useHealthCheck();
  const createAudit = useCreateAudit();

  // Fetch users for auditor and reviewer selection
  const { data: auditors = [] } = useQuery({
    queryKey: ['/api/users', 'auditor'],
    queryFn: () => fetch('/api/users?role=auditor').then(res => res.json()),
  });

  const { data: reviewers = [] } = useQuery({
    queryKey: ['/api/users', 'reviewer'],
    queryFn: () => fetch('/api/users?role=reviewer').then(res => res.json()),
  });

  // Fetch hotel groups for SOP selection
  const { data: hotelGroups = [] } = useQuery({
    queryKey: ['/api/hotel-groups'],
    queryFn: () => fetch('/api/hotel-groups').then(res => res.json()),
  });

  const [selectedHotelGroup, setSelectedHotelGroup] = useState<any>(null);
  const [sopFiles, setSopFiles] = useState<any[]>([]);

  // Form setup
  const form = useForm<ScheduleAuditForm>({
    resolver: zodResolver(scheduleAuditSchema),
    defaultValues: {
      propertyId: '',
      auditorId: '',
      reviewerId: '',
      hotelGroupId: '',
      sop: '',
      sopFiles: [],
      scheduledDate: '',
      priority: 'medium',
      notes: '',
    },
  });

  // Handle audit scheduling
  const handleScheduleAudit = async (data: ScheduleAuditForm) => {
    try {
      await createAudit.mutateAsync({
        propertyId: parseInt(data.propertyId),
        auditorId: parseInt(data.auditorId),
        reviewerId: parseInt(data.reviewerId),
        hotelGroupId: parseInt(data.hotelGroupId),
        sop: data.sop || '',
        sopFiles: JSON.stringify(data.sopFiles),
        status: 'scheduled',
        priority: data.priority,
        notes: data.notes,
        scheduledDate: new Date(data.scheduledDate).toISOString(),
      });

      toast({
        title: "Audit Scheduled",
        description: "The audit has been successfully scheduled and assigned.",
      });

      setShowScheduleModal(false);
      form.reset();
      setSopFiles([]);
      setSelectedHotelGroup(null);
    } catch (error) {
      console.error('Schedule audit error:', error);
      toast({
        title: "Scheduling Failed",
        description: "Unable to schedule audit. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (propertiesLoading || auditsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalProperties = properties.length;
  const totalAudits = audits.length;
  const pendingAudits = audits.filter((audit: any) => audit.status === 'scheduled' || audit.status === 'in_progress').length;
  const submittedAudits = audits.filter((audit: any) => audit.status === 'submitted').length;
  const completedAudits = audits.filter((audit: any) => audit.status === 'approved').length;


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

      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p: any) => p.id === propertyId);
    return property ? property.name : `Property ${propertyId}`;
  };

  const getAuditorName = (auditorId: number) => {
    const auditor = auditors.find((a: any) => a.id === auditorId);
    return auditor ? auditor.name : 'Unknown Auditor';
  };

  const getReviewerName = (reviewerId: number) => {
    const reviewer = reviewers.find((r: any) => r.id === reviewerId);
    return reviewer ? reviewer.name : 'Unknown Reviewer';
  };

  // Handle tile clicks to filter data
  const handleTileClick = (filterType: string) => {
    setAuditFilter(filterType);
    setActiveTab('audits');
  };

  // Filter audits based on current filter
  const getFilteredAudits = () => {
    switch (auditFilter) {
      case 'pending':
        return audits.filter((audit: any) => audit.status === 'scheduled' || audit.status === 'in_progress');
      case 'submitted':
        return audits.filter((audit: any) => audit.status === 'submitted');
      case 'completed':
        return audits.filter((audit: any) => audit.status === 'approved');

      default:
        return audits;
    }
  };

  return (
    <div className="min-h-screen admin-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="dashboard-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
              <p className="text-gray-700 text-lg">Manage properties, schedules, and audit workflow</p>
            </div>
            
            <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Audit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-6">
                <DialogHeader className="pb-4">
                  <DialogTitle>Schedule New Audit</DialogTitle>
                  <DialogDescription>
                    Create and assign a new audit to an auditor and reviewer
                  </DialogDescription>
                </DialogHeader>
                
                <div className="overflow-y-auto max-h-[70vh] px-2 pb-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleScheduleAudit)} className="space-y-6">
                      {/* 1. Hotel Group */}
                      <FormField
                        control={form.control}
                        name="hotelGroupId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hotel Group</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                const group = hotelGroups.find((g: any) => g.id.toString() === value);
                                setSelectedHotelGroup(group);
                                
                                // Clear the property selection when hotel group changes
                                form.setValue('propertyId', '');
                                
                                // Load default SOP files if available
                                if (group?.sopFiles) {
                                  try {
                                    const files = JSON.parse(group.sopFiles);
                                    setSopFiles(files);
                                    form.setValue('sopFiles', files);
                                  } catch (e) {
                                    // Handle parsing error
                                    setSopFiles([]);
                                  }
                                } else {
                                  setSopFiles([]);
                                }
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select hotel group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {hotelGroups.map((group: any) => (
                                  <SelectItem key={group.id} value={group.id.toString()}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 2. Hotel Name (Property) */}
                      <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => {
                          // Filter properties based on selected hotel group
                          const selectedHotelGroupId = form.watch('hotelGroupId');
                          const filteredProperties = selectedHotelGroupId 
                            ? properties.filter((property: any) => 
                                (property.hotel_group_id ?? property.hotelGroupId)?.toString() === selectedHotelGroupId
                              )
                            : [];

                          return (
                            <FormItem>
                              <FormLabel>Hotel Name</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!selectedHotelGroupId}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue 
                                      placeholder={
                                        selectedHotelGroupId 
                                          ? "Select hotel property to audit" 
                                          : "Please select a hotel group first"
                                      } 
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredProperties.map((property: any) => (
                                    <SelectItem key={property.id} value={property.id.toString()}>
                                      {property.name} - {property.location}
                                    </SelectItem>
                                  ))}
                                  {filteredProperties.length === 0 && selectedHotelGroupId && (
                                    <SelectItem value="no-properties" disabled>
                                      No properties available for this hotel group
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {/* 3. SOP */}
                      <FormField
                        control={form.control}
                        name="sopFiles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Standard Operating Procedures (SOPs)</FormLabel>
                            <FormControl>
                              <SOPFileUpload
                                files={sopFiles}
                                onFilesChange={(files) => {
                                  setSopFiles(files);
                                  field.onChange(files);
                                }}
                                maxFiles={5}
                                acceptedTypes={['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg']}
                              />
                            </FormControl>
                            <div className="text-sm text-gray-500">
                              Upload SOP documents that will guide AI analysis and scoring during the audit process.
                              {selectedHotelGroup && (
                                <div className="mt-2 p-2 bg-blue-50 rounded border">
                                  <strong>Selected Group:</strong> {selectedHotelGroup.name}
                                  {selectedHotelGroup.sopFiles && (
                                    <div className="mt-1 text-xs">
                                      <em>Default SOP files have been loaded. You can add more or remove existing ones.</em>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 4. Auditor */}
                      <FormField
                        control={form.control}
                        name="auditorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign Auditor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select auditor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {auditors.map((auditor: any) => (
                                  <SelectItem key={auditor.id} value={auditor.id.toString()}>
                                    {auditor.name} - {auditor.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 5. Reviewer */}
                      <FormField
                        control={form.control}
                        name="reviewerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign Reviewer</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reviewer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {reviewers.map((reviewer: any) => (
                                  <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                                    {reviewer.name} - {reviewer.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Additional Fields */}
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Date</FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                min={new Date().toISOString().slice(0, 16)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low Priority</SelectItem>
                                <SelectItem value="medium">Medium Priority</SelectItem>
                                <SelectItem value="high">High Priority</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special instructions or notes for the auditor..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowScheduleModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={createAudit.isPending}
                        >
                          {createAudit.isPending ? 'Scheduling...' : 'Schedule Audit'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* System Status */}
          {healthStatus && (
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                AI Ready
              </Badge>
              <Badge variant="outline" className="text-xs">
                Database Connected
              </Badge>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="dashboard-section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 dashboard-grid">
          <div
            className="metric-card-primary cursor-pointer"
            onClick={() => setActiveTab('properties')}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide truncate">Total Properties</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{totalProperties}</p>
                <p className="text-xs text-blue-600 mt-0.5 truncate">View all properties →</p>
              </div>
              <div className="icon-container-primary flex-shrink-0">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className="metric-card-warning cursor-pointer"
            onClick={() => handleTileClick('pending')}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide truncate">Pending Audits</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">{pendingAudits}</p>
                <p className="text-xs text-amber-600 mt-0.5 truncate">View pending →</p>
              </div>
              <div className="icon-container-warning flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className="metric-card-purple cursor-pointer"
            onClick={() => handleTileClick('submitted')}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide truncate">Awaiting Review</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{submittedAudits}</p>
                <p className="text-xs text-purple-600 mt-0.5 truncate">View submitted →</p>
              </div>
              <div className="icon-container-purple flex-shrink-0">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className="metric-card-success cursor-pointer"
            onClick={() => handleTileClick('completed')}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide truncate">Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{completedAudits}</p>
                <p className="text-xs text-green-600 mt-0.5 truncate">View completed →</p>
              </div>
              <div className="icon-container-success flex-shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>


          <div
            className="metric-card cursor-pointer border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: '#2DB5DA', background: '#f0fbfe' }}
            onClick={() => setLocation('/add-user')}
          >
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-8 w-8" style={{ color: '#2DB5DA' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#2DB5DA' }}>Add New User</p>
              <p className="text-xs mt-0.5" style={{ color: '#939598' }}>Create user account</p>
            </div>
          </div>

          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="audits">Audit Management</TabsTrigger>
            <TabsTrigger value="approved">Approved Audits</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="audits" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {auditFilter === 'all' ? 'All Audits' : 
                     auditFilter === 'pending' ? 'Pending Audits' :
                     auditFilter === 'submitted' ? 'Submitted Audits' :
                     auditFilter === 'completed' ? 'Completed Audits' :
                     'Recent Audits'}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant={auditFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAuditFilter('all')}
                    >
                      All ({audits.length})
                    </Button>
                    <Button
                      variant={auditFilter === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAuditFilter('pending')}
                    >
                      Pending ({pendingAudits})
                    </Button>
                    <Button
                      variant={auditFilter === 'submitted' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAuditFilter('submitted')}
                    >
                      Submitted ({submittedAudits})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {getFilteredAudits().length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {auditFilter === 'all' ? 'No audits scheduled yet' : 
                       `No ${auditFilter} audits`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {auditFilter === 'all' ? 'Create your first audit using the "Schedule Audit" button' :
                       'Try changing the filter or create new audits'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Property</th>
                          <th className="text-left p-3">Auditor</th>
                          <th className="text-left p-3">Reviewer</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Created</th>
                          <th className="text-left p-3">Last Updated</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredAudits().slice(0, 10).map((audit: any) => (
                          <tr key={audit.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{getPropertyName(audit.propertyId)}</td>
                            <td className="p-3">{getAuditorName(audit.auditorId)}</td>
                            <td className="p-3">{getReviewerName(audit.reviewerId)}</td>
                            <td className="p-3">{getStatusBadge(audit.status)}</td>
                            <td className="p-3 text-gray-600">
                              {new Date(audit.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-gray-600">
                              {audit.submittedAt 
                                ? new Date(audit.submittedAt).toLocaleDateString()
                                : audit.reviewedAt 
                                  ? new Date(audit.reviewedAt).toLocaleDateString()
                                  : new Date(audit.createdAt).toLocaleDateString()
                              }
                            </td>
                            <td className="p-3">
                              {audit.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAuditId(audit.id);
                                    setActiveTab('approved');
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Approved Audits - Detailed View
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAuditId ? <ApprovedAuditDetails auditId={selectedAuditId} properties={properties} audits={audits} /> : <ApprovedAuditsOverview audits={audits} properties={properties} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property: any) => {
                    const propertyAudits = audits.filter((audit: any) => audit.propertyId === property.id);
                    const lastAudit = propertyAudits.sort((a: any, b: any) => 
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0];

                    return (
                      <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {property.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                              <Badge variant="outline" className="text-xs">
                                {property.region}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Audits:</span>
                              <span className="font-medium">{propertyAudits.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Audit:</span>
                              <span className="font-medium">
                                {lastAudit ? new Date(lastAudit.createdAt).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className="font-medium">
                                {lastAudit ? getStatusBadge(lastAudit.status) : 
                                 <Badge variant="outline" className="text-xs">No Audits</Badge>}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAuditFilter('all');
                                setActiveTab('audits');
                                // You could add more specific filtering for this property here
                              }}
                            >
                              View Audits ({propertyAudits.length})
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                form.setValue('propertyId', property.id.toString());
                                setShowScheduleModal(true);
                              }}
                            >
                              Schedule Audit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Scheduled</span>
                      <span className="font-semibold">{audits.filter((a: any) => a.status === 'scheduled').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="font-semibold">{audits.filter((a: any) => a.status === 'in_progress').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Submitted</span>
                      <span className="font-semibold">{submittedAudits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="font-semibold">{completedAudits}</span>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Auditors Active</span>
                        <span className="font-semibold">{auditors.length}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {auditors.map((auditor: any) => auditor.name).join(', ')}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Reviewers Active</span>
                        <span className="font-semibold">{reviewers.length}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {reviewers.map((reviewer: any) => reviewer.name).join(', ')}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total System Users</span>
                        <span className="font-semibold">{auditors.length + reviewers.length + 1}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}