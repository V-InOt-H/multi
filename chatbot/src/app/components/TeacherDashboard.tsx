import { AlertTriangle, TrendingUp, Users, Activity, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';

interface ConfusionAlert {
  id: string;
  studentName: string;
  topic: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

interface TeacherDashboardProps {
  confusionAlerts: ConfusionAlert[];
  activeStudents: number;
  totalStudents: number;
  averageEngagement: number;
  topicDifficulty: {
    topic: string;
    difficulty: number;
    confusionCount: number;
  }[];
}

export function TeacherDashboard({
  confusionAlerts,
  activeStudents,
  totalStudents,
  averageEngagement,
  topicDifficulty,
}: TeacherDashboardProps) {
  const engagementColor = 
    averageEngagement >= 0.8 ? 'text-success' :
    averageEngagement >= 0.5 ? 'text-warning' :
    'text-destructive';

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              of {totalStudents} total students
            </p>
            <Progress 
              value={(activeStudents / totalStudents) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${engagementColor}`}>
              {Math.round(averageEngagement * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average class engagement
            </p>
            <Progress 
              value={averageEngagement * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confusion Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {confusionAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active confusion reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecture Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32:45</div>
            <p className="text-xs text-muted-foreground">
              Minutes elapsed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Confusion Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confusion Alerts
            </CardTitle>
            <CardDescription>
              Real-time student confusion reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              {confusionAlerts.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed py-12">
                  <p className="text-sm text-muted-foreground">
                    No confusion alerts at the moment
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {confusionAlerts.map((alert) => {
                    const severityColors = {
                      low: 'bg-info/10 text-info border-info/20',
                      medium: 'bg-warning/10 text-warning border-warning/20',
                      high: 'bg-destructive/10 text-destructive border-destructive/20',
                    };

                    return (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 rounded-lg border bg-card p-3"
                      >
                        <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${severityColors[alert.severity]}`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{alert.studentName}</p>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Topic: {alert.topic}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Topic Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Topic Difficulty Analysis
            </CardTitle>
            <CardDescription>
              Identify challenging concepts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {topicDifficulty.map((topic, index) => {
                  const difficultyColor = 
                    topic.difficulty >= 0.7 ? 'bg-destructive' :
                    topic.difficulty >= 0.4 ? 'bg-warning' :
                    'bg-success';

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{topic.topic}</p>
                          <p className="text-xs text-muted-foreground">
                            {topic.confusionCount} confusion reports
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(topic.difficulty * 100)}%
                        </Badge>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full transition-all ${difficultyColor}`}
                          style={{ width: `${topic.difficulty * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Activity
          </CardTitle>
          <CardDescription>
            Live student interactions and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {[
                { student: 'Priya K.', action: 'answered quiz correctly', time: '2 min ago', type: 'success' },
                { student: 'Raj M.', action: 'marked confusion on Neural Networks', time: '3 min ago', type: 'warning' },
                { student: 'Ananya S.', action: 'joined the session', time: '5 min ago', type: 'info' },
                { student: 'Karthik R.', action: 'downloaded lecture notes', time: '8 min ago', type: 'default' },
                { student: 'Divya P.', action: 'asked a question', time: '10 min ago', type: 'info' },
              ].map((activity, index) => {
                const typeColors = {
                  success: 'text-success',
                  warning: 'text-warning',
                  info: 'text-info',
                  default: 'text-foreground',
                };

                return (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="flex h-2 w-2 shrink-0">
                      <span className={`inline-flex h-2 w-2 rounded-full ${typeColors[activity.type as keyof typeof typeColors]}`}></span>
                    </div>
                    <span className="font-medium">{activity.student}</span>
                    <span className="text-muted-foreground">{activity.action}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
