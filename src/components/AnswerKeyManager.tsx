import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Save } from "lucide-react";

export const AnswerKeyManager = () => {
  const [version, setVersion] = useState("A");
  const [examName, setExamName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateTemplate = () => {
    const template: Record<string, string> = {};
    for (let i = 1; i <= 100; i++) {
      template[i.toString()] = "A";
    }
    setAnswers(template);
    toast({
      title: "Template Generated",
      description: "Answer key template with 100 questions created. Update the answers as needed.",
    });
  };

  const handleAnswerChange = (questionNum: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionNum]: value }));
  };

  const handleSaveAnswerKey = async () => {
    if (!examName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an exam name",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(answers).length !== 100) {
      toast({
        title: "Error",
        description: "Please ensure all 100 answers are provided",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('answer_keys' as any).insert({
        exam_name: examName,
        version,
        answers,
        total_questions: 100,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Answer key saved successfully",
      });

      // Reset form
      setExamName("");
      setAnswers({});
    } catch (error: any) {
      console.error('Error saving answer key:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save answer key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionInputs = (start: number, end: number, subjectName: string) => {
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{subjectName} (Q{start}-{end})</h4>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: end - start + 1 }, (_, i) => {
            const qNum = (start + i).toString();
            return (
              <div key={qNum} className="flex items-center gap-1">
                <Label className="text-xs w-8">{qNum}:</Label>
                <Select
                  value={answers[qNum] || "A"}
                  onValueChange={(value) => handleAnswerChange(qNum, value)}
                >
                  <SelectTrigger className="h-8 w-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Answer Key Manager</h2>
            <p className="text-muted-foreground">Create and manage answer keys for different exam versions</p>
          </div>
          <Button onClick={handleGenerateTemplate} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Generate Template
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="examName">Exam Name</Label>
            <Input
              id="examName"
              placeholder="e.g., Final Exam 2024"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger id="version">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Version A</SelectItem>
                <SelectItem value="B">Version B</SelectItem>
                <SelectItem value="C">Version C</SelectItem>
                <SelectItem value="D">Version D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {Object.keys(answers).length > 0 && (
          <div className="space-y-6 border rounded-lg p-4">
            <h3 className="font-semibold">Answer Key (100 Questions)</h3>
            {renderQuestionInputs(1, 20, "Subject 1")}
            {renderQuestionInputs(21, 40, "Subject 2")}
            {renderQuestionInputs(41, 60, "Subject 3")}
            {renderQuestionInputs(61, 80, "Subject 4")}
            {renderQuestionInputs(81, 100, "Subject 5")}
          </div>
        )}

        <Button 
          onClick={handleSaveAnswerKey} 
          disabled={isLoading || Object.keys(answers).length === 0}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Answer Key
        </Button>
      </div>
    </Card>
  );
};
