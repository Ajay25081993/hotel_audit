import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HOTEL_AUDIT_CHECKLIST, ChecklistItem, ChecklistCategory } from '@shared/auditChecklist';
import { Camera, Video, FileText, Upload, Trash2, Save, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  type: 'photo' | 'video' | 'text';
  file?: File;
  content: string;
  description: string;
}

interface ChecklistResponse {
  itemId: string;
  score?: number;
  notes: string;
  media: MediaFile[];
  completed: boolean;
}

interface AuditChecklistFormProps {
  auditId: string;
  onSave: (responses: ChecklistResponse[]) => void;
  onSubmit: (responses: ChecklistResponse[]) => void;
  initialData?: ChecklistResponse[];
}

export function AuditChecklistForm({ auditId, onSave, onSubmit, initialData = [] }: AuditChecklistFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [responses, setResponses] = useState<Record<string, ChecklistResponse>>(() => {
    const initial: Record<string, ChecklistResponse> = {};
    initialData.forEach(response => {
      initial[response.itemId] = response;
    });
    return initial;
  });
  const [activeCategory, setActiveCategory] = useState(HOTEL_AUDIT_CHECKLIST[0].id);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const updateResponse = (itemId: string, updates: Partial<ChecklistResponse>) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        itemId,
        score: undefined,
        notes: '',
        media: [],
        completed: false,
        ...prev[itemId],
        ...updates
      }
    }));
  };

  const addMedia = async (itemId: string, type: 'photo' | 'video' | 'text', file?: File) => {
    const mediaId = `${itemId}-${type}-${Date.now()}`;
    let content = '';

    if (file) {
      // Convert file to base64 for storage
      content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const newMedia: MediaFile = {
      id: mediaId,
      type,
      file,
      content,
      description: ''
    };

    updateResponse(itemId, {
      media: [...(responses[itemId]?.media || []), newMedia]
    });

    toast({
      title: "Media Added",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} evidence added successfully.`
    });
  };

  const removeMedia = (itemId: string, mediaId: string) => {
    updateResponse(itemId, {
      media: responses[itemId]?.media.filter(m => m.id !== mediaId) || []
    });
  };

  const updateMediaDescription = (itemId: string, mediaId: string, description: string) => {
    updateResponse(itemId, {
      media: responses[itemId]?.media.map(m => 
        m.id === mediaId ? { ...m, description } : m
      ) || []
    });
  };

  const handleFileUpload = (itemId: string, type: 'photo' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'photo' ? 'image/*' : 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        addMedia(itemId, type, file);
      }
    };
    input.click();
  };

  const markItemComplete = (itemId: string) => {
    const response = responses[itemId];
    const item = getItemById(itemId);
    
    if (!item) return;

    // Check if required media is provided
    const missingRequiredMedia = item.requiredMedia?.filter(mediaType => 
      !response?.media.some(m => m.type === mediaType)
    ) || [];

    if (missingRequiredMedia.length > 0) {
      toast({
        title: "Required Evidence Missing",
        description: `Please provide: ${missingRequiredMedia.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    updateResponse(itemId, { completed: true });
    toast({
      title: "Item Completed",
      description: "Checklist item marked as complete."
    });
  };

  const getItemById = (itemId: string): ChecklistItem | undefined => {
    for (const category of HOTEL_AUDIT_CHECKLIST) {
      const item = category.items.find(item => item.id === itemId);
      if (item) return item;
    }
    return undefined;
  };

  const getCompletionStats = () => {
    const totalItems = HOTEL_AUDIT_CHECKLIST.reduce((acc, cat) => acc + cat.items.length, 0);
    const completedItems = Object.values(responses).filter(r => r.completed).length;
    return { completed: completedItems, total: totalItems, percentage: (completedItems / totalItems) * 100 };
  };

  const handleSave = () => {
    onSave(Object.values(responses));
    toast({
      title: "Progress Saved",
      description: "Your audit progress has been saved as draft."
    });
  };

  const handleSubmit = () => {
    const stats = getCompletionStats();
    if (stats.percentage < 100) {
      toast({
        title: "Incomplete Audit",
        description: `Please complete all ${stats.total} checklist items before submitting.`,
        variant: "destructive"
      });
      return;
    }

    onSubmit(Object.values(responses));
    toast({
      title: "Audit Submitted",
      description: "Your audit has been submitted for AI analysis and review."
    });
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Checklist Progress</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {stats.completed} of {stats.total} items completed
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={stats.percentage < 100}>
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </div>
          <Progress value={stats.percentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {HOTEL_AUDIT_CHECKLIST.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {HOTEL_AUDIT_CHECKLIST.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.items.map(item => {
                  const response = responses[item.id];
                  const isCompleted = response?.completed || false;

                  return (
                    <Card key={item.id} className={`transition-all ${
                      isCompleted ? 'border-green-200 bg-green-50' : 
                      activeItem === item.id ? 'border-blue-200 bg-blue-50' : ''
                    }`}>
                      <CardHeader 
                        className="cursor-pointer"
                        onClick={() => setActiveItem(activeItem === item.id ? null : item.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{item.item}</h4>
                              {isCompleted && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">Max Score: {item.maxScore}</Badge>
                              <div className="flex gap-1">
                                {item.mediaTypes.map(type => (
                                  <Badge key={type} variant="outline" className="text-xs">
                                    {type === 'photo' ? '📷' : type === 'video' ? '🎥' : '📝'} {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      {activeItem === item.id && (
                        <CardContent className="border-t">
                          {/* Notes Section */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Observations & Notes {item.requiredMedia?.includes('text') && <span className="text-red-500">*</span>}
                              </label>
                              <Textarea
                                placeholder="Document your observations, findings, and any relevant details..."
                                value={response?.notes || ''}
                                onChange={(e) => updateResponse(item.id, { notes: e.target.value })}
                                className="min-h-[100px]"
                              />
                            </div>

                            {/* Media Upload Section */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">Evidence Collection</label>
                              <div className="flex gap-2 mb-4">
                                {item.mediaTypes.includes('photo') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleFileUpload(item.id, 'photo')}
                                  >
                                    <Camera className="h-4 w-4 mr-2" />
                                    Add Photo
                                    {item.requiredMedia?.includes('photo') && <span className="text-red-500 ml-1">*</span>}
                                  </Button>
                                )}
                                {item.mediaTypes.includes('video') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleFileUpload(item.id, 'video')}
                                  >
                                    <Video className="h-4 w-4 mr-2" />
                                    Add Video
                                    {item.requiredMedia?.includes('video') && <span className="text-red-500 ml-1">*</span>}
                                  </Button>
                                )}
                                {item.mediaTypes.includes('text') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => addMedia(item.id, 'text')}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Add Text Note
                                  </Button>
                                )}
                              </div>

                              {/* Media List */}
                              {response?.media && response.media.length > 0 && (
                                <div className="space-y-2">
                                  {response.media.map(media => (
                                    <div key={media.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                      <div className="flex-shrink-0">
                                        {media.type === 'photo' && <Camera className="h-5 w-5 text-blue-500" />}
                                        {media.type === 'video' && <Video className="h-5 w-5 text-purple-500" />}
                                        {media.type === 'text' && <FileText className="h-5 w-5 text-green-500" />}
                                      </div>
                                      <div className="flex-1">
                                        <Input
                                          placeholder="Add description for this evidence..."
                                          value={media.description}
                                          onChange={(e) => updateMediaDescription(item.id, media.id, e.target.value)}
                                          className="text-sm"
                                        />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMedia(item.id, media.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Complete Item Button */}
                            <div className="pt-4 border-t">
                              <Button
                                onClick={() => markItemComplete(item.id)}
                                disabled={isCompleted}
                                className="w-full"
                                variant={isCompleted ? "secondary" : "default"}
                              >
                                {isCompleted ? "Item Completed ✓" : "Mark as Complete"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}