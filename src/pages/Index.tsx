import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Users, BarChart3, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import UploadSection from "@/components/UploadSection";
import ResultsTable from "@/components/ResultsTable";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { AnswerKeyManager } from "@/components/AnswerKeyManager";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data for dashboard
  const stats = {
    totalSheets: 2847,
    processed: 2654,
    pending: 193,
    flagged: 12,
    averageScore: 67.8,
    completionRate: 93.2
  };

  const recentExams = [
    { id: "EXAM001", name: "Data Analytics Assessment", date: "2024-01-15", sheets: 1200, status: "completed" },
    { id: "EXAM002", name: "AI/ML Placement Test", date: "2024-01-10", sheets: 856, status: "processing" },
    { id: "EXAM003", name: "Python Fundamentals", date: "2024-01-08", sheets: 342, status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">OMR Evaluation System</h1>
                <p className="text-sm text-muted-foreground">Innomatics Research Labs</p>
              </div>
            </div>
            <Button 
              className="bg-gradient-primary hover:opacity-90 transition-smooth"
              onClick={() => setActiveTab("upload")}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Sheets
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              Upload
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              Results
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="answer-keys" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              Answer Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-card hover:shadow-elevated transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sheets</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSheets.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last exam
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-elevated transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.processed.toLocaleString()}</div>
                  <Progress value={(stats.processed / stats.totalSheets) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-elevated transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg processing: 2.3 min
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-elevated transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flagged</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.flagged}</div>
                  <p className="text-xs text-muted-foreground">
                    Requires manual review
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Exams
                  </CardTitle>
                  <CardDescription>Latest evaluation activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentExams.map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                        <div>
                          <h4 className="font-medium">{exam.name}</h4>
                          <p className="text-sm text-muted-foreground">{exam.date} • {exam.sheets} sheets</p>
                        </div>
                        <Badge variant={exam.status === "completed" ? "default" : "secondary"}>
                          {exam.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Score</span>
                      <span className="font-medium">{stats.averageScore}%</span>
                    </div>
                    <Progress value={stats.averageScore} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Rate</span>
                      <span className="font-medium">{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">System accuracy maintained at <span className="font-medium text-success">99.8%</span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <UploadSection />
          </TabsContent>

          <TabsContent value="results">
            <ResultsTable />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="answer-keys">
            <AnswerKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;