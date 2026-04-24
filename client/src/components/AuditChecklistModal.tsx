import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuditItems, useUpdateAuditItem } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle, Clock, Star } from 'lucide-react';

interface AuditChecklistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  auditId: number;
  propertyName: string;
}

export function AuditChecklistModal({ isOpen, onOpenChange, auditId, propertyName }: AuditChecklistModalProps) {
  const { data: auditItems = [], isLoading } = useAuditItems(auditId);
  const updateAuditItem = useUpdateAuditItem();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleScoreChange = async (itemId: number, score: number, comments: string) => {
    try {
      await updateAuditItem.mutateAsync({
        id: itemId,
        score,
        comments,
        status: 'completed'
      });
      
      toast({
        title: "Item Updated",
        description: "Audit item score and comments saved successfully.",
      });
      
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update audit item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completedItems = auditItems.filter((item: any) => item.status === 'completed').length;
  const progress = auditItems.length > 0 ? (completedItems / auditItems.length) * 100 : 0;

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'gray';
    if (score >= 4) return 'green';
    if (score >= 3) return 'yellow';
    return 'red';
  };

  const getScoreText = (score: number | null) => {
    if (score === null) return 'Not Scored';
    if (score === 5) return 'Excellent';
    if (score === 4) return 'Good';
    if (score === 3) return 'Satisfactory';
    if (score === 2) return 'Needs Improvement';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Audit Checklist...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Audit Checklist - {propertyName}</DialogTitle>
          <DialogDescription>
            Complete the audit checklist by scoring each item and adding comments
          </DialogDescription>
        </DialogHeader>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{completedItems}/{auditItems.length} items completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Checklist Items */}
        <div className="space-y-4">
          {auditItems.map((item: any) => (
            <Card key={item.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${item.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.item}</CardTitle>
                      <Badge variant="outline" className="mt-1">{item.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.score !== null && (
                      <div className="flex items-center space-x-1">
                        <Star className={`h-4 w-4 text-${getScoreColor(item.score)}-500`} />
                        <span className={`text-sm font-semibold text-${getScoreColor(item.score)}-600`}>
                          {item.score}/5
                        </span>
                      </div>
                    )}
                    <Badge 
                      variant={item.score !== null ? "default" : "secondary"}
                      className={item.score !== null ? `bg-${getScoreColor(item.score)}-100 text-${getScoreColor(item.score)}-800` : ''}
                    >
                      {getScoreText(item.score)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.comments && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{item.comments}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.status === 'completed' ? 'Edit Score' : 'Add Score'}
                  </Button>
                  
                  {item.photos && item.photos.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Camera className="h-4 w-4" />
                      <span>{item.photos.length} photo(s)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Score Item Modal */}
        {selectedItem && (
          <ScoreItemModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onSave={handleScoreChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ScoreItemModalProps {
  item: any;
  onClose: () => void;
  onSave: (itemId: number, score: number, comments: string) => void;
}

function ScoreItemModal({ item, onClose, onSave }: ScoreItemModalProps) {
  const [score, setScore] = useState(item.score?.toString() || '');
  const [comments, setComments] = useState(item.comments || '');

  const handleSave = () => {
    if (!score) return;
    onSave(item.id, parseInt(score), comments);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Score Audit Item</DialogTitle>
          <DialogDescription>{item.item}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Score (1-5)</label>
            <Select value={score} onValueChange={setScore}>
              <SelectTrigger>
                <SelectValue placeholder="Select a score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 - Excellent</SelectItem>
                <SelectItem value="4">4 - Good</SelectItem>
                <SelectItem value="3">3 - Satisfactory</SelectItem>
                <SelectItem value="2">2 - Needs Improvement</SelectItem>
                <SelectItem value="1">1 - Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Comments</label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add your observations and comments..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!score}>
              Save Score
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}