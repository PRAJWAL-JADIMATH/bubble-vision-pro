import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle2, XCircle, Clock, Trash2, Award } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
  status: "ready" | "processing" | "completed" | "error";
  progress: number;
  studentName?: string;
  rollNumber?: string;
  examVersion?: string;
}

interface OMRResult {
  fileId: string;
  studentName: string;
  rollNumber: string;
  examVersion: string;
  totalScore: number;
  percentage: number;
  subjectScores: {
    subject1: number;
    subject2: number;
    subject3: number;
    subject4: number;
    subject5: number;
  };
}

export const UploadSection = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [omrResults, setOmrResults] = useState<OMRResult[]>([]);

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      file: file,
      status: "ready",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    toast({
      title: "Files Added",
      description: `${fileList.length} file(s) added. Please fill in student details to process.`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const processFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || !file.studentName || !file.rollNumber || !file.examVersion) {
      toast({
        title: "Missing Information",
        description: "Please fill in all student details",
        variant: "destructive",
      });
      return;
    }

    try {
      setFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "processing", progress: 0 } : f)
      );

      // Convert image to base64
      const base64 = await fileToBase64(file.file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => f.id === fileId ? { ...f, progress: Math.min(f.progress + 10, 90) } : f)
        );
      }, 300);

      const { data, error } = await supabase.functions.invoke('process-omr', {
        body: {
          imageBase64: base64,
          studentName: file.studentName,
          rollNumber: file.rollNumber,
          examVersion: file.examVersion,
        },
      });

      clearInterval(progressInterval);

      if (error) throw error;

      setFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "completed", progress: 100 } : f)
      );

      const result: OMRResult = {
        fileId,
        studentName: file.studentName,
        rollNumber: file.rollNumber,
        examVersion: file.examVersion,
        totalScore: data.evaluation.totalScore,
        percentage: data.evaluation.percentage,
        subjectScores: data.evaluation.subjectScores,
      };

      setOmrResults((prev) => [...prev, result]);

      toast({
        title: "Success",
        description: `OMR sheet processed successfully. Score: ${data.evaluation.totalScore}/100`,
      });
    } catch (error: any) {
      console.error('Error processing OMR:', error);
      setFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, status: "error", progress: 0 } : f)
      );
      toast({
        title: "Error",
        description: error.message || "Failed to process OMR sheet",
        variant: "destructive",
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

  const updateFileDetails = (fileId: string, field: string, value: string) => {
    setFiles((prev) =>
      prev.map((f) => f.id === fileId ? { ...f, [field]: value } : f)
    );
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setOmrResults((prev) => prev.filter((r) => r.fileId !== fileId));
  };

  const clearAllResults = () => {
    setFiles([]);
    setOmrResults([]);
    toast({
      title: "Results Cleared",
      description: "All files and results have been cleared.",
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
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-primary animate-pulse" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Ready to process';
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
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Upload OMR Sheets</h2>
            <p className="text-muted-foreground">
              Upload images captured via mobile camera for automated evaluation
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Drop OMR sheets here</h3>
                <p className="text-muted-foreground">or click to browse files</p>
              </div>
              <Button onClick={() => document.getElementById('file-input')?.click()}>
                Browse Files
              </Button>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Upload Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Supported formats: JPG, PNG</li>
              <li>• Ensure sheets are well-lit and properly aligned</li>
              <li>• Multiple sheets can be uploaded simultaneously</li>
              <li>• Supports versions A, B, C, and D</li>
            </ul>
          </div>
        </div>
      </Card>

      {files.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Uploaded Files ({files.length})</h3>
              {omrResults.length > 0 && (
                <Button variant="outline" onClick={clearAllResults}>
                  Clear All
                </Button>
              )}
            </div>

            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-4 p-4 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">{getStatusIcon(file.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {getStatusText(file.status)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                        className="flex-shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {file.status === "processing" && (
                      <Progress value={file.progress} className="h-2" />
                    )}
                  </div>
                </div>

                {file.status !== "completed" && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t">
                    <div className="space-y-1">
                      <Label htmlFor={`student-${file.id}`} className="text-xs">Student Name</Label>
                      <Input
                        id={`student-${file.id}`}
                        placeholder="Enter name"
                        value={file.studentName || ""}
                        onChange={(e) => updateFileDetails(file.id, "studentName", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`roll-${file.id}`} className="text-xs">Roll Number</Label>
                      <Input
                        id={`roll-${file.id}`}
                        placeholder="Enter roll no"
                        value={file.rollNumber || ""}
                        onChange={(e) => updateFileDetails(file.id, "rollNumber", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`version-${file.id}`} className="text-xs">Exam Version</Label>
                      <Select
                        value={file.examVersion || ""}
                        onValueChange={(value) => updateFileDetails(file.id, "examVersion", value)}
                      >
                        <SelectTrigger id={`version-${file.id}`} className="h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Version A</SelectItem>
                          <SelectItem value="B">Version B</SelectItem>
                          <SelectItem value="C">Version C</SelectItem>
                          <SelectItem value="D">Version D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => processFile(file.id)}
                        disabled={!file.studentName || !file.rollNumber || !file.examVersion || file.status === "processing"}
                        className="h-8 w-full"
                        size="sm"
                      >
                        Process
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {omrResults.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Evaluation Results ({omrResults.length})</h3>
            </div>

            <div className="space-y-4">
              {omrResults.map((result) => (
                <div key={result.fileId} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h4 className="font-semibold text-lg">{result.studentName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Roll: {result.rollNumber} | Version: {result.examVersion}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {result.totalScore}/100
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3">Subject-wise Scores</h5>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(result.subjectScores).map(([subject, score], index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              Subject {index + 1}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {score}/20
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={
                                ((score / 20) * 100) >= 80 ? 'default' :
                                ((score / 20) * 100) >= 60 ? 'secondary' : 'outline'
                              }>
                                {((score / 20) * 100).toFixed(0)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UploadSection;
