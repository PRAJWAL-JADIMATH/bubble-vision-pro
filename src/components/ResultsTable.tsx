import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, Download, Eye, Filter, ChevronDown } from "lucide-react";

interface StudentResult {
  id: string;
  studentId: string;
  name: string;
  examDate: string;
  examVersion: string;
  subjects: {
    dataStructures: number;
    algorithms: number;
    python: number;
    statistics: number;
    machineLearning: number;
  };
  totalScore: number;
  percentage: number;
  status: 'completed' | 'flagged' | 'pending';
}

const ResultsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [examFilter, setExamFilter] = useState<string>("all");

  // Mock student results data
  const results: StudentResult[] = [
    {
      id: "1",
      studentId: "STU001",
      name: "Rahul Sharma",
      examDate: "2024-01-15",
      examVersion: "Version A",
      subjects: { dataStructures: 18, algorithms: 16, python: 19, statistics: 14, machineLearning: 17 },
      totalScore: 84,
      percentage: 84,
      status: 'completed'
    },
    {
      id: "2",
      studentId: "STU002", 
      name: "Priya Patel",
      examDate: "2024-01-15",
      examVersion: "Version B",
      subjects: { dataStructures: 15, algorithms: 18, python: 17, statistics: 16, machineLearning: 15 },
      totalScore: 81,
      percentage: 81,
      status: 'completed'
    },
    {
      id: "3",
      studentId: "STU003",
      name: "Amit Kumar",
      examDate: "2024-01-15", 
      examVersion: "Version A",
      subjects: { dataStructures: 12, algorithms: 14, python: 16, statistics: 18, machineLearning: 13 },
      totalScore: 73,
      percentage: 73,
      status: 'flagged'
    },
    {
      id: "4",
      studentId: "STU004",
      name: "Sneha Reddy",
      examDate: "2024-01-15",
      examVersion: "Version C",
      subjects: { dataStructures: 19, algorithms: 17, python: 18, statistics: 15, machineLearning: 19 },
      totalScore: 88,
      percentage: 88,
      status: 'completed'
    },
    {
      id: "5",
      studentId: "STU005",
      name: "Vikash Singh",
      examDate: "2024-01-15",
      examVersion: "Version B",
      subjects: { dataStructures: 14, algorithms: 15, python: 13, statistics: 17, machineLearning: 16 },
      totalScore: 75,
      percentage: 75,
      status: 'pending'
    }
  ];

  const filteredResults = results.filter(result => {
    const matchesSearch = result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || result.status === statusFilter;
    const matchesExam = examFilter === "all" || result.examVersion === examFilter;
    
    return matchesSearch && matchesStatus && matchesExam;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
      case 'flagged':
        return <Badge variant="destructive">Flagged</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 75) return "text-primary";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Evaluation Results</CardTitle>
          <CardDescription>
            View and manage student evaluation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={examFilter} onValueChange={setExamFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Exam Version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Versions</SelectItem>
                <SelectItem value="Version A">Version A</SelectItem>
                <SelectItem value="Version B">Version B</SelectItem>
                <SelectItem value="Version C">Version C</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-subtle rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Results</h3>
              <p className="text-2xl font-bold">{filteredResults.length}</p>
            </div>
            <div className="bg-gradient-subtle rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
              <p className="text-2xl font-bold">
                {Math.round(filteredResults.reduce((acc, result) => acc + result.percentage, 0) / filteredResults.length)}%
              </p>
            </div>
            <div className="bg-gradient-subtle rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              <p className="text-2xl font-bold text-success">
                {filteredResults.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <div className="bg-gradient-subtle rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Flagged</h3>
              <p className="text-2xl font-bold text-destructive">
                {filteredResults.filter(r => r.status === 'flagged').length}
              </p>
            </div>
          </div>

          {/* Results Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam Details</TableHead>
                  <TableHead>Subject Scores</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">{result.studentId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{result.examVersion}</p>
                        <p className="text-sm text-muted-foreground">{result.examDate}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="grid grid-cols-5 gap-1 text-xs">
                          <span className="text-center font-medium">DS</span>
                          <span className="text-center font-medium">AL</span>
                          <span className="text-center font-medium">PY</span>
                          <span className="text-center font-medium">ST</span>
                          <span className="text-center font-medium">ML</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-xs">
                          <span className="text-center">{result.subjects.dataStructures}/20</span>
                          <span className="text-center">{result.subjects.algorithms}/20</span>
                          <span className="text-center">{result.subjects.python}/20</span>
                          <span className="text-center">{result.subjects.statistics}/20</span>
                          <span className="text-center">{result.subjects.machineLearning}/20</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className={`text-lg font-bold ${getScoreColor(result.percentage)}`}>
                          {result.totalScore}/100
                        </div>
                        <Progress value={result.percentage} className="w-16" />
                        <p className="text-xs text-muted-foreground">{result.percentage}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(result.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsTable;