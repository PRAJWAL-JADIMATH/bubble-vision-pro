import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileImage, X, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  preview?: string;
}

const UploadSection = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [examVersion, setExamVersion] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (fileList: File[]) => {
    if (!examVersion) {
      toast({
        title: "Select Exam Version",
        description: "Please select an exam version before uploading files.",
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = fileList.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and processing
    newFiles.forEach((file) => {
      simulateFileProcessing(file.id);
    });

    toast({
      title: "Files Uploaded",
      description: `${fileList.length} OMR sheet(s) uploaded successfully.`,
    });
  };

  const simulateFileProcessing = (fileId: string) => {
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId && file.status === 'uploading') {
          const newProgress = Math.min(file.progress + Math.random() * 20, 100);
          if (newProgress >= 100) {
            clearInterval(uploadInterval);
            setTimeout(() => {
              setFiles(prev => prev.map(f => 
                f.id === fileId ? { ...f, status: 'processing', progress: 0 } : f
              ));
              simulateProcessing(fileId);
            }, 500);
            return { ...file, progress: 100, status: 'uploading' };
          }
          return { ...file, progress: newProgress };
        }
        return file;
      }));
    }, 200);
  };

  const simulateProcessing = (fileId: string) => {
    const processInterval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId && file.status === 'processing') {
          const newProgress = Math.min(file.progress + Math.random() * 15, 100);
          if (newProgress >= 100) {
            clearInterval(processInterval);
            const isSuccess = Math.random() > 0.1; // 90% success rate
            return { 
              ...file, 
              progress: 100, 
              status: isSuccess ? 'completed' : 'error' 
            };
          }
          return { ...file, progress: newProgress };
        }
        return file;
      }));
    }, 300);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Upload OMR Sheets</CardTitle>
          <CardDescription>
            Upload OMR sheets captured via mobile camera for automated evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exam Version Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Version</label>
            <Select value={examVersion} onValueChange={setExamVersion}>
              <SelectTrigger>
                <SelectValue placeholder="Select exam version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="version-a">Version A - Data Analytics</SelectItem>
                <SelectItem value="version-b">Version B - Data Analytics</SelectItem>
                <SelectItem value="version-c">Version C - AI/ML Assessment</SelectItem>
                <SelectItem value="version-d">Version D - AI/ML Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Drop OMR sheets here</h3>
                <p className="text-muted-foreground">or click to browse files</p>
              </div>
              <Button 
                onClick={() => document.getElementById('file-input')?.click()}
                className="bg-gradient-primary hover:opacity-90"
              >
                Browse Files
              </Button>
              <input
                id="file-input"
                type="file"
                accept="image/*,.pdf"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>

          {/* Upload Guidelines */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Upload Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Supported formats: JPG, PNG, PDF</li>
              <li>• Maximum file size: 10MB per sheet</li>
              <li>• Ensure sheets are well-lit and properly aligned</li>
              <li>• Multiple sheets can be uploaded simultaneously</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileImage className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      {file.status !== 'completed' && file.status !== 'error' && (
                        <Progress value={file.progress} className="flex-1" />
                      )}
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(file.status)}
                        <Badge variant={file.status === 'completed' ? 'default' : 'secondary'}>
                          {getStatusText(file.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadSection;