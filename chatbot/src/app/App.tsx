import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TranscriptPanel } from './components/TranscriptPanel';
import { TranslationPanel } from './components/TranslationPanel';
import { SummaryCard } from './components/SummaryCard';
import { QuizCard } from './components/QuizCard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { Users, Calendar, Globe, BookOpen } from 'lucide-react';
import { sttService, TranscriptSegment } from './services/sttService';
import { translateService, Translation } from './services/translateService';
import { summaryService, Summary, QuizQuestion } from './services/summaryService';
import { toast } from 'sonner';

type TabType = 'overview' | 'teacher' | 'student' | 'summary' | 'join';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSessionLive, setIsSessionLive] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  // Transcript state
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  
  // Translation state
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [targetLanguage, setTargetLanguage] = useState('ta');
  
  // Summary state
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Teacher dashboard state
  const [confusionAlerts, setConfusionAlerts] = useState([
    {
      id: '1',
      studentName: 'Priya Sharma',
      topic: 'Neural Networks',
      timestamp: Date.now() - 120000,
      severity: 'high' as const,
    },
    {
      id: '2',
      studentName: 'Raj Malhotra',
      topic: 'Gradient Descent',
      timestamp: Date.now() - 300000,
      severity: 'medium' as const,
    },
  ]);
  const [activeStudents] = useState(24);
  const [totalStudents] = useState(30);
  const [averageEngagement] = useState(0.78);
  const [topicDifficulty] = useState([
    { topic: 'Neural Networks', difficulty: 0.72, confusionCount: 8 },
    { topic: 'Gradient Descent', difficulty: 0.58, confusionCount: 5 },
    { topic: 'Linear Regression', difficulty: 0.35, confusionCount: 2 },
    { topic: 'Backpropagation', difficulty: 0.81, confusionCount: 12 },
  ]);

  // Student dashboard state
  const [studentLanguage, setStudentLanguage] = useState('ta');

  // Theme toggle
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Toggle recording
  const handleToggleRecording = async () => {
    if (isRecording) {
      sttService.stopTranscription();
      setIsRecording(false);
      toast.success('Transcription stopped');
      
      // Generate summary and quiz when stopping
      await generateSummary();
      await generateQuiz();
    } else {
      try {
        await sttService.startTranscription(handleNewTranscript, sourceLanguage);
        setIsRecording(true);
        setIsSessionLive(true);
        toast.success('Transcription started');
      } catch (error) {
        toast.error('Failed to start transcription. Please check microphone permissions.');
      }
    }
  };

  // Handle new transcript
  const handleNewTranscript = async (segment: TranscriptSegment) => {
    setTranscripts(prev => [...prev, segment]);
    
    // Auto-translate
    if (segment.isFinal) {
      try {
        const translation = await translateService.translate(
          segment.text,
          sourceLanguage,
          targetLanguage
        );
        setTranslations(prev => [...prev, translation]);
      } catch (error) {
        console.error('Translation failed:', error);
      }
    }
  };

  // Language change handlers
  const handleLanguageChange = (source: string, target: string) => {
    setSourceLanguage(source);
    setTargetLanguage(target);
  };

  const handleTranslate = async () => {
    const lastTranscript = transcripts[transcripts.length - 1];
    if (lastTranscript) {
      try {
        const translation = await translateService.translate(
          lastTranscript.text,
          sourceLanguage,
          targetLanguage
        );
        setTranslations(prev => [...prev, translation]);
      } catch (error) {
        toast.error('Translation failed');
      }
    }
  };

  // Generate summary
  const generateSummary = async () => {
    if (transcripts.length === 0) return;
    
    setIsSummaryLoading(true);
    try {
      const texts = transcripts.map(t => t.text);
      const newSummary = await summaryService.generateSummary(texts);
      setSummary(newSummary);
      toast.success('Summary generated successfully');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Generate quiz
  const generateQuiz = async () => {
    if (transcripts.length === 0) return;
    
    try {
      const texts = transcripts.map(t => t.text);
      const questions = await summaryService.generateQuiz(texts);
      setQuizQuestions(questions);
      toast.success('Quiz questions generated');
    } catch (error) {
      toast.error('Failed to generate quiz');
    }
  };

  // Student actions
  const handleConfusionReport = (topic: string, notes: string) => {
    const newAlert = {
      id: Date.now().toString(),
      studentName: 'You',
      topic,
      timestamp: Date.now(),
      severity: 'medium' as const,
    };
    setConfusionAlerts(prev => [...prev, newAlert]);
    toast.success('Confusion reported to teacher');
  };

  const handleQuestionSubmit = (question: string) => {
    toast.success('Question submitted to teacher');
  };

  const handleDownloadSummary = () => {
    if (!summary) return;
    
    const content = `
LECTURE SUMMARY
===============

${summary.text}

KEY POINTS:
${summary.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

KEYWORDS:
${summary.keywords.join(', ')}

FORMULAS:
${summary.formulas.join('\n')}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lecture-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded');
  };

  const handleShareSummary = () => {
    toast.info('Share functionality would be implemented here');
  };

  const handleQuizComplete = (score: number) => {
    toast.success(`Quiz completed! Score: ${score}/${quizQuestions.length}`);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    in this session
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Languages</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">9</div>
                  <p className="text-xs text-muted-foreground">
                    supported languages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Words Transcribed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transcripts.reduce((sum, t) => sum + t.text.split(' ').length, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    total words
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Session Time</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32:45</div>
                  <p className="text-xs text-muted-foreground">
                    minutes elapsed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-[600px]">
                <TranscriptPanel
                  transcripts={transcripts}
                  isRecording={isRecording}
                  onToggleRecording={handleToggleRecording}
                  language={sourceLanguage}
                />
              </div>

              <div className="h-[600px]">
                <TranslationPanel
                  originalTexts={transcripts.map(t => t.text)}
                  translations={translations}
                  sourceLanguage={sourceLanguage}
                  targetLanguage={targetLanguage}
                  onLanguageChange={handleLanguageChange}
                  onTranslate={handleTranslate}
                />
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SummaryCard
                summary={summary}
                isLoading={isSummaryLoading}
                onDownload={handleDownloadSummary}
                onShare={handleShareSummary}
              />

              <QuizCard
                questions={quizQuestions}
                onComplete={handleQuizComplete}
              />
            </div>
          </div>
        );

      case 'teacher':
        return (
          <TeacherDashboard
            confusionAlerts={confusionAlerts}
            activeStudents={activeStudents}
            totalStudents={totalStudents}
            averageEngagement={averageEngagement}
            topicDifficulty={topicDifficulty}
          />
        );

      case 'student':
        return (
          <StudentDashboard
            selectedLanguage={studentLanguage}
            onLanguageChange={setStudentLanguage}
            onConfusionReport={handleConfusionReport}
            onQuestionSubmit={handleQuestionSubmit}
          />
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Lecture Summary & Analytics</h2>
                <p className="text-muted-foreground">
                  AI-generated insights from the lecture
                </p>
              </div>
              <Button onClick={generateSummary} disabled={transcripts.length === 0}>
                Regenerate Summary
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SummaryCard
                  summary={summary}
                  isLoading={isSummaryLoading}
                  onDownload={handleDownloadSummary}
                  onShare={handleShareSummary}
                />
              </div>

              <div>
                <QuizCard
                  questions={quizQuestions}
                  onComplete={handleQuizComplete}
                />
              </div>
            </div>
          </div>
        );

      case 'join':
        return (
          <div className="flex min-h-[600px] items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Join Lecture Session</CardTitle>
                <CardDescription>
                  Enter the session code to join the lecture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Code</label>
                  <Input
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <Input placeholder="Enter your name" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Join as</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline">Student</Button>
                    <Button variant="outline">Observer</Button>
                  </div>
                </div>

                <Button className="w-full">Join Session</Button>

                <div className="pt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Currently active session:
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    ML-2024-03-30
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        isSessionLive={isSessionLive}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
      />

      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {renderTabContent()}
      </main>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}