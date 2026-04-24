import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Camera, Video, FileText, ZoomIn } from 'lucide-react';

interface MediaItem {
  type: 'photo' | 'video' | 'text';
  content: string;
  description?: string;
  timestamp?: string;
}

interface MediaDisplayProps {
  photos: string;
  title?: string;
  className?: string;
  compact?: boolean;
}

export function MediaDisplay({ photos, title = "Evidence Provided", className = "", compact = false }: MediaDisplayProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  if (!photos || photos === '[]' || photos === 'null') {
    return (
      <div className={`p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Eye className="h-4 w-4" />
          <span className="text-sm">No evidence provided</span>
        </div>
      </div>
    );
  }

  let mediaItems: MediaItem[] = [];
  try {
    mediaItems = JSON.parse(photos);
  } catch (e) {
    console.error('Error parsing media items:', e);
    return (
      <div className={`p-3 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-700">Unable to display evidence</p>
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className={`p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Eye className="h-4 w-4" />
          <span className="text-sm">No evidence provided</span>
        </div>
      </div>
    );
  }

  const photoCount = mediaItems.filter(item => item.type === 'photo').length;
  const videoCount = mediaItems.filter(item => item.type === 'video').length;
  const textCount = mediaItems.filter(item => item.type === 'text').length;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">{title}</span>
        <div className="flex gap-1 text-xs text-gray-600">
          {photoCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Camera className="h-3 w-3 mr-1" />
              {photoCount}
            </Badge>
          )}
          {videoCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <Video className="h-3 w-3 mr-1" />
              {videoCount}
            </Badge>
          )}
          {textCount > 0 && (
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {textCount}
            </Badge>
          )}
        </div>
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
        {mediaItems.map((item: MediaItem, index: number) => (
          <div key={index} className="border rounded-lg p-2 bg-white hover:shadow-md transition-shadow">
            <div className="text-xs text-gray-600 mb-2 flex items-center justify-between">
              <span>
                {item.type === 'photo' && '📷 Photo'}
                {item.type === 'video' && '📹 Video'}
                {item.type === 'text' && '📝 Text Note'}
              </span>
              {item.timestamp && (
                <span className="text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>

            {item.type === 'photo' && (
              <div className="relative group">
                <img 
                  src={item.content} 
                  alt="Audit Evidence" 
                  className={`w-full object-cover rounded cursor-pointer hover:opacity-75 ${compact ? 'h-16' : 'h-24'}`}
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/30"
                      onClick={() => setSelectedMedia(item)}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Audit Evidence Photo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <img 
                        src={item.content} 
                        alt="Audit Evidence" 
                        className="w-full max-h-[70vh] object-contain rounded"
                      />
                      {item.description && (
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{item.description}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {item.type === 'video' && (
              <video 
                src={item.content} 
                className={`w-full object-cover rounded ${compact ? 'h-16' : 'h-24'}`}
                controls 
                preload="metadata"
              />
            )}

            {item.type === 'text' && (
              <div className={`p-2 bg-gray-50 rounded overflow-hidden ${compact ? 'h-16' : 'h-24'}`}>
                <p className="text-sm text-gray-800 line-clamp-3">
                  {item.content}
                </p>
              </div>
            )}

            {item.description && item.type !== 'text' && (
              <div className="mt-2 p-1 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaDisplay;