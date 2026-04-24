import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, FileImage, FileVideo, File, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'document';
}

interface DragDropUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSizeInMB?: number;
  className?: string;
}

export function DragDropUpload({
  onFilesChange,
  acceptedTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx'],
  maxFiles = 10,
  maxSizeInMB = 50,
  className
}: DragDropUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    const currentFileCount = files.length;

    for (let i = 0; i < fileList.length && currentFileCount + newFiles.length < maxFiles; i++) {
      const file = fileList[i];
      
      // Check file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxSizeInMB}MB.`);
        continue;
      }

      const preview = await createFilePreview(file);
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${i}`,
        file,
        preview,
        type: getFileType(file)
      };
      
      newFiles.push(uploadedFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, maxFiles, maxSizeInMB, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCameraDialog = () => {
    cameraInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <FileVideo className="h-6 w-6 text-purple-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card 
        className={cn(
          "transition-all duration-200 cursor-pointer",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-300 hover:border-gray-400"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="p-8 text-center">
          <Upload className={cn(
            "h-12 w-12 mx-auto mb-4 transition-colors",
            isDragOver ? "text-blue-500" : "text-gray-400"
          )} />
          <h3 className="text-lg font-medium mb-2">
            {isDragOver ? "Drop files here" : "Upload Files"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openFileDialog(); }}>
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openCameraDialog(); }}>
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Supports images, videos, and documents. Max {maxSizeInMB}MB per file.
          </p>
        </CardContent>
      </Card>

      {/* File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            <div className="space-y-3">
              {files.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {uploadedFile.preview ? (
                    <div className="flex-shrink-0">
                      {uploadedFile.type === 'image' ? (
                        <img 
                          src={uploadedFile.preview} 
                          alt={uploadedFile.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <video 
                          src={uploadedFile.preview}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex-shrink-0 p-2">
                      {getFileIcon(uploadedFile.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)} • {uploadedFile.type}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}