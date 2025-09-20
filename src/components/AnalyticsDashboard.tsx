import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Target, BookOpen, Award } from "lucide-react";

const AnalyticsDashboard = () => {
  // Mock data for charts
  const subjectPerformance = [
    { subject: "Data Structures", average: 78, students: 245 },
    { subject: "Algorithms", average: 72, students: 245 },
    { subject: "Python", average: 85, students: 245 },
    { subject: "Statistics", average: 68, students: 245 },
    { subject: "Machine Learning", average: 75, students: 245 }
  ];

  const scoreDistribution = [
    { range: "90-100", count: 32, percentage: 13 },
    { range: "80-89", count: 67, percentage: 27 },
    { range: "70-79", count: 89, percentage: 36 },
    { range: "60-69", count: 45, percentage: 18 },
    { range: "Below 60", count: 12, percentage: 5 }
  ];

  const examTrends = [
    { exam: "Jan 2024", average: 72, participants: 245 },
    { exam: "Dec 2023", average: 68, participants: 198 },
    { exam: "Nov 2023", average: 74, participants: 234 },
    { exam: "Oct 2023", average: 71, participants: 267 },
    { exam: "Sep 2023", average: 69, participants: 189 }
  ];

  const difficultyAnalysis = [
    { name: "Easy", value: 45, color: "#22c55e" },
    { name: "Medium", value: 35, color: "#f59e0b" },
    { name: "Hard", value: 20, color: "#ef4444" }
  ];

  const topPerformers = [
    { rank: 1, name: "Sneha Reddy", score: 94, improvement: "+8%" },
    { rank: 2, name: "Rahul Sharma", score: 91, improvement: "+5%" },
    { rank: 3, name: "Ankit Verma", score: 89, improvement: "+12%" },
    { rank: 4, name: "Priya Patel", score: 87, improvement: "+3%" },
    { rank: 5, name: "Deepak Kumar", score: 86, improvement: "+7%" }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Evaluated</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> from last exam
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2.3%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">
              Above 60% threshold
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">Within</span> error tolerance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
            <CardDescription>Average scores across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of student scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Trends */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Average scores over recent exams</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={examTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest scoring students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((student) => (
                <div key={student.rank} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {student.rank}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.score}%</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {student.improvement}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Deep Dive */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Subject Analysis</CardTitle>
          <CardDescription>Detailed breakdown of performance by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {subjectPerformance.map((subject) => (
              <div key={subject.subject} className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{subject.subject}</h4>
                    <span className="text-sm font-bold">{subject.average}%</span>
                  </div>
                  <Progress value={subject.average} className="h-2" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {subject.students} students
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Excellent (90+)</span>
                    <span>15%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Good (70-89)</span>
                    <span>45%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Needs Work (&lt;70)</span>
                    <span>40%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;