import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileImage, X, CheckCircle, AlertCircle, Award, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  preview?: string;
}

interface OMRResult {
  fileId: string;
  fileName: string;
  studentId: string;
  studentName: string;
  examVersion: string;
  subjects: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
  }[];
  totalScore: number;
  totalMaxScore: number;
  overallPercentage: number;
  evaluatedAt: string;
}

const UploadSection = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [omrResults, setOmrResults] = useState<OMRResult[]>([]);
  const { toast } = useToast();

  const handleFiles = useCallback((fileList: File[]) => {
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
  }, [toast]);

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
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
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

  const simulateOMREvaluation = (fileId: string, fileName: string): OMRResult => {
    // Generate mock student data
    const studentNames = ["Aarav Singh", "Priya Sharma", "Rahul Kumar", "Sneha Patel", "Arjun Reddy"];
    const studentName = studentNames[Math.floor(Math.random() * studentNames.length)];
    const studentId = `STU${Math.floor(Math.random() * 9000) + 1000}`;
    
    // Default subjects for OMR evaluation
    const subjects = ["Python", "SQL", "Statistics", "Excel", "Business Analytics"];
    
    // Generate realistic scores
    const subjectResults = subjects.map(subject => {
      const score = Math.floor(Math.random() * 5) + 15; // 15-20 range for realistic scores
      return {
        name: subject,
        score,
        maxScore: 20,
        percentage: (score / 20) * 100
      };
    });
    
    const totalScore = subjectResults.reduce((sum, subject) => sum + subject.score, 0);
    const totalMaxScore = 100;
    
    return {
      fileId,
      fileName,
      studentId,
      studentName,
      examVersion: "Data Analytics Assessment",
      subjects: subjectResults,
      totalScore,
      totalMaxScore,
      overallPercentage: (totalScore / totalMaxScore) * 100,
      evaluatedAt: new Date().toISOString()
    };
  };

  const simulateProcessing = (fileId: string) => {
    const processInterval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId && file.status === 'processing') {
          const newProgress = Math.min(file.progress + Math.random() * 15, 100);
          if (newProgress >= 100) {
            clearInterval(processInterval);
            const isSuccess = Math.random() > 0.1; // 90% success rate
            
            if (isSuccess) {
              // Generate OMR evaluation result
              const result = simulateOMREvaluation(fileId, file.name);
              setOmrResults(prev => [...prev, result]);
              
              toast({
                title: "OMR Evaluation Complete",
                description: `${result.studentName} scored ${result.totalScore}/100 (${result.overallPercentage.toFixed(1)}%)`,
              });
            }
            
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
    setOmrResults(prev => prev.filter(result => result.fileId !== fileId));
  };

  const clearAllResults = () => {
    setFiles([]);
    setOmrResults([]);
    toast({
      title: "Results Cleared",
      description: "All files and evaluation results have been cleared.",
    });
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

      {/* OMR Evaluation Results */}
      {omrResults.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>OMR Evaluation Results ({omrResults.length})</CardTitle>
                  <CardDescription>
                    Automated evaluation results for uploaded OMR sheets
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={clearAllResults}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {omrResults.map((result) => (
                <div key={result.fileId} className="border rounded-lg p-4 space-y-4">
                  {/* Student Header */}
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h3 className="font-semibold text-lg">{result.studentName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Student ID: {result.studentId} | File: {result.fileName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-2xl font-bold text-primary">
                          {result.totalScore}/{result.totalMaxScore}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.overallPercentage.toFixed(1)}% Overall
                      </p>
                    </div>
                  </div>

                  {/* Subject-wise Scores */}
                  <div>
                    <h4 className="font-medium mb-3">Subject-wise Performance</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center">Max Score</TableHead>
                          <TableHead className="text-center">Percentage</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.subjects.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{subject.name}</TableCell>
                            <TableCell className="text-center font-semibold">
                              {subject.score}
                            </TableCell>
                            <TableCell className="text-center">{subject.maxScore}</TableCell>
                            <TableCell className="text-center">
                              <span className={`font-medium ${
                                subject.percentage >= 80 ? 'text-success' :
                                subject.percentage >= 60 ? 'text-warning' : 'text-destructive'
                              }`}>
                                {subject.percentage.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={
                                subject.percentage >= 90 ? 'default' :
                                subject.percentage >= 80 ? 'secondary' :
                                subject.percentage >= 60 ? 'outline' : 'destructive'
                              }>
                                {subject.percentage >= 90 ? 'A+' :
                                 subject.percentage >= 80 ? 'A' :
                                 subject.percentage >= 70 ? 'B+' :
                                 subject.percentage >= 60 ? 'B' : 'C'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{result.totalScore}</p>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">
                        {result.subjects.filter(s => s.percentage >= 60).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Subjects Passed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {result.overallPercentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Overall %</p>
                    </div>
                    <div className="text-center">
                      <Badge className="text-base px-3 py-1" variant={
                        result.overallPercentage >= 80 ? 'default' : 'secondary'
                      }>
                        {result.overallPercentage >= 80 ? 'PASS' : 'NEEDS IMPROVEMENT'}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Evaluated on: {new Date(result.evaluatedAt).toLocaleString()}
                  </div>
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