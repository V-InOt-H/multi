import { useState } from 'react';
import { Volume2, VolumeX, MessageCircle, AlertCircle, Languages, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { API_CONFIG } from '../config/apiConfig';

interface StudentDashboardProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onConfusionReport: (topic: string, notes: string) => void;
  onQuestionSubmit: (question: string) => void;
}

export function StudentDashboard({
  selectedLanguage,
  onLanguageChange,
  onConfusionReport,
  onQuestionSubmit,
}: StudentDashboardProps) {
  const [confusionTopic, setConfusionTopic] = useState('');
  const [confusionNotes, setConfusionNotes] = useState('');
  const [question, setQuestion] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showConfusionForm, setShowConfusionForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);

  const handleSubmitConfusion = () => {
    if (confusionTopic.trim()) {
      onConfusionReport(confusionTopic, confusionNotes);
      setConfusionTopic('');
      setConfusionNotes('');
      setShowConfusionForm(false);
    }
  };

  const handleSubmitQuestion = () => {
    if (question.trim()) {
      onQuestionSubmit(question);
      setQuestion('');
      setShowQuestionForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={() => setShowConfusionForm(!showConfusionForm)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <CardTitle className="text-base">I'm Confused</CardTitle>
                <CardDescription className="text-xs">
                  Report confusion instantly
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
          onClick={() => setShowQuestionForm(!showQuestionForm)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                <MessageCircle className="h-6 w-6 text-info" />
              </div>
              <div>
                <CardTitle className="text-base">Ask Question</CardTitle>
                <CardDescription className="text-xs">
                  Submit your questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-base">Lecture Notes</CardTitle>
                <CardDescription className="text-xs">
                  Download materials
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Confusion Report Form */}
      {showConfusionForm && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Report Confusion
            </CardTitle>
            <CardDescription>
              Let your teacher know which topic you're struggling with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Concept</Label>
              <Select value={confusionTopic} onValueChange={setConfusionTopic}>
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Machine Learning Basics">Machine Learning Basics</SelectItem>
                  <SelectItem value="Neural Networks">Neural Networks</SelectItem>
                  <SelectItem value="Linear Regression">Linear Regression</SelectItem>
                  <SelectItem value="Gradient Descent">Gradient Descent</SelectItem>
                  <SelectItem value="Backpropagation">Backpropagation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Describe what you're confused about..."
                value={confusionNotes}
                onChange={(e) => setConfusionNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitConfusion} className="flex-1">
                Submit Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConfusionForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Form */}
      {showQuestionForm && (
        <Card className="border-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-info" />
              Ask a Question
            </CardTitle>
            <CardDescription>
              Submit your question to the teacher
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitQuestion} className="flex-1">
                Submit Question
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowQuestionForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Language Preferences
            </CardTitle>
            <CardDescription>
              Customize your learning experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="preferred-language">Preferred Language</Label>
              <Select value={selectedLanguage} onValueChange={onLanguageChange}>
                <SelectTrigger id="preferred-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {API_CONFIG.languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-translate">Auto-translate</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically translate to your preferred language
                </p>
              </div>
              <Switch
                id="auto-translate"
                checked={autoTranslate}
                onCheckedChange={setAutoTranslate}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="audio">Audio Playback</Label>
                <p className="text-xs text-muted-foreground">
                  Enable text-to-speech for translations
                </p>
              </div>
              <Switch
                id="audio"
                checked={isAudioEnabled}
                onCheckedChange={setIsAudioEnabled}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>
              Current lecture details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lecture</span>
                <span className="font-medium">Machine Learning Fundamentals</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Instructor</span>
                <span className="font-medium">Dr. Rajesh Kumar</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <Badge variant="secondary">32:45 / 60:00</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Students</span>
                <Badge variant="secondary">24 active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className="bg-success">Live</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
          <CardDescription>
            Track your understanding and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Attendance</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-success" style={{ width: '95%' }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Quiz Average</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-info" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Engagement Score</span>
                <span className="font-medium">82%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-accent" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
