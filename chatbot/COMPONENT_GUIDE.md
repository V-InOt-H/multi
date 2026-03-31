# Component Guide

This guide explains the purpose and usage of each component in the EduSense application.

## 📁 Component Structure

```
/src/app/components/
├── Navbar.tsx                  # Main navigation with tabs and theme toggle
├── TranscriptPanel.tsx         # Live speech-to-text transcription display
├── TranslationPanel.tsx        # Real-time translation side-by-side view
├── SummaryCard.tsx            # AI-generated lecture summary with key points
├── QuizCard.tsx               # Interactive quiz with questions and scoring
├── TeacherDashboard.tsx       # Analytics and confusion alerts for teachers
├── StudentDashboard.tsx       # Student preferences and interaction tools
└── ui/                        # Reusable UI components (shadcn/ui)
```

---

## 🧩 Core Components

### Navbar
**Location**: `/src/app/components/Navbar.tsx`

**Purpose**: Main navigation bar with tab switching and theme control

**Props**:
```typescript
interface NavbarProps {
  activeTab: string;           // Current active tab
  onTabChange: (tab: string) => void; // Tab change handler
  isSessionLive: boolean;      // Show/hide live indicator
  onThemeToggle: () => void;   // Theme switch handler
  isDarkMode: boolean;         // Current theme state
}
```

**Features**:
- 5 navigation tabs: Overview, Teacher, Student, Summary, Join
- Live session indicator with pulsing animation
- Theme toggle (light/dark)
- Responsive design with mobile-friendly tabs
- EduSense branding with graduation cap icon

**Usage**:
```tsx
<Navbar
  activeTab="overview"
  onTabChange={(tab) => setActiveTab(tab)}
  isSessionLive={true}
  onThemeToggle={() => toggleTheme()}
  isDarkMode={false}
/>
```

---

### TranscriptPanel
**Location**: `/src/app/components/TranscriptPanel.tsx`

**Purpose**: Display real-time speech-to-text transcription with keyword highlighting

**Props**:
```typescript
interface TranscriptPanelProps {
  transcripts: TranscriptSegment[];  // Array of transcript segments
  isRecording: boolean;               // Recording state
  onToggleRecording: () => void;      // Start/stop handler
  language: string;                   // Current language code
}
```

**Features**:
- Real-time transcript streaming display
- Automatic keyword highlighting
- Confidence score display
- Audio mute/unmute control
- Auto-scroll to latest transcript
- Language badge indicator
- Empty state with instructions

**Transcript Segment Structure**:
```typescript
interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
  language: string;
  keywords?: string[];
}
```

---

### TranslationPanel
**Location**: `/src/app/components/TranslationPanel.tsx`

**Purpose**: Real-time translation with side-by-side or stacked view

**Props**:
```typescript
interface TranslationPanelProps {
  originalTexts: string[];           // Original transcript texts
  translations: Translation[];       // Translated segments
  sourceLanguage: string;            // Source language code
  targetLanguage: string;            // Target language code
  onLanguageChange: (source: string, target: string) => void;
  onTranslate: () => void;
  isLoading?: boolean;
}
```

**Features**:
- Language selection dropdowns
- Swap languages button
- Side-by-side vs. stacked view toggle
- Copy to clipboard functionality
- Timestamp display
- Empty state placeholder
- 9 supported languages

---

### SummaryCard
**Location**: `/src/app/components/SummaryCard.tsx`

**Purpose**: Display AI-generated lecture summary with structured information

**Props**:
```typescript
interface SummaryCardProps {
  summary: Summary | null;
  isLoading?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
}
```

**Features**:
- Comprehensive text summary
- Numbered key points list
- Keyword tags
- Mathematical formula display
- Download summary button
- Share functionality
- Loading state with spinner
- Empty state placeholder

**Summary Structure**:
```typescript
interface Summary {
  id: string;
  text: string;
  keyPoints: string[];
  keywords: string[];
  formulas: string[];
  timestamp: number;
  wordCount: number;
}
```

---

### QuizCard
**Location**: `/src/app/components/QuizCard.tsx`

**Purpose**: Interactive multiple-choice quiz with immediate feedback

**Props**:
```typescript
interface QuizCardProps {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
}
```

**Features**:
- Multiple-choice questions
- Instant feedback on answers
- Explanation after answering
- Progress bar
- Previous/Next navigation
- Score calculation
- Results summary with breakdown
- Topic badges
- Retry functionality

**Quiz Question Structure**:
```typescript
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}
```

---

### TeacherDashboard
**Location**: `/src/app/components/TeacherDashboard.tsx`

**Purpose**: Real-time analytics and student monitoring for teachers

**Props**:
```typescript
interface TeacherDashboardProps {
  confusionAlerts: ConfusionAlert[];
  activeStudents: number;
  totalStudents: number;
  averageEngagement: number;
  topicDifficulty: TopicDifficulty[];
}
```

**Features**:
- Active student count
- Engagement metrics with color coding
- Confusion alerts list with severity levels
- Topic difficulty analysis
- Real-time activity feed
- Session duration timer
- Visual progress bars

**Confusion Alert Structure**:
```typescript
interface ConfusionAlert {
  id: string;
  studentName: string;
  topic: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}
```

---

### StudentDashboard
**Location**: `/src/app/components/StudentDashboard.tsx`

**Purpose**: Student interaction tools and preferences

**Props**:
```typescript
interface StudentDashboardProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onConfusionReport: (topic: string, notes: string) => void;
  onQuestionSubmit: (question: string) => void;
}
```

**Features**:
- Quick action cards (Confused, Ask Question, Notes)
- Confusion reporting form
- Question submission form
- Language preference selection
- Auto-translate toggle
- Audio playback control
- Session information display
- Learning progress tracking
- Attendance, quiz average, engagement metrics

---

## 🎨 UI Components (shadcn/ui)

### Card Components
- `Card`: Base card container
- `CardHeader`: Card header section
- `CardTitle`: Card title text
- `CardDescription`: Subtitle/description
- `CardContent`: Main content area

### Form Components
- `Button`: Action buttons with variants
- `Input`: Text input fields
- `Textarea`: Multi-line text input
- `Select`: Dropdown selection
- `Switch`: Toggle switch
- `Label`: Form labels

### Feedback Components
- `Badge`: Status indicators
- `Progress`: Progress bars
- `Toaster`: Toast notifications
- `ScrollArea`: Scrollable containers

### Layout Components
- `Tabs`: Tab navigation
- `Separator`: Divider lines
- `Dialog`: Modal dialogs
- `Tooltip`: Hover tooltips

---

## 🔧 Component Communication

### State Management
All state is managed in the main `App.tsx` component and passed down via props.

### Event Flow
```
User Action → Component Handler → Parent Handler → State Update → Re-render
```

### Example Flow: Confusion Report
```
1. Student clicks "I'm Confused" in StudentDashboard
2. Shows confusion form
3. Student selects topic and submits
4. onConfusionReport prop called
5. Parent adds to confusionAlerts state
6. TeacherDashboard re-renders with new alert
7. Toast notification shown
```

---

## 📱 Responsive Design

### Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Adaptive Layouts
- Grid layouts adjust column count
- Navigation tabs stack on mobile
- Card sizes adapt to screen width
- Scrollable areas on small screens

---

## ♿ Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Focus indicators visible

### Screen Readers
- Semantic HTML structure
- ARIA labels on buttons
- Alt text on icons
- Status announcements

### Color Contrast
- WCAG AA compliant
- High contrast mode support
- Color-blind friendly indicators

---

## 🎯 Best Practices

### Component Design
- Single Responsibility Principle
- Props over state when possible
- Composition over inheritance
- Reusable and modular

### Performance
- Memoization for expensive calculations
- Lazy loading for large components
- Virtualization for long lists
- Debouncing for frequent updates

### Error Handling
- Graceful degradation
- Error boundaries
- Loading states
- Empty states

---

## 🔄 Real-Time Updates

### Simulated Real-Time
Components receive new data via props and automatically re-render:
- TranscriptPanel: New transcript segments appear every 3-5 seconds
- TranslationPanel: Translations added as transcripts finalize
- TeacherDashboard: Analytics update every 10 seconds
- StudentDashboard: Progress metrics update on actions

### WebSocket Integration (Future)
Ready for WebSocket integration via `websocketService`:
```typescript
websocketService.on('transcript', (data) => {
  setTranscripts(prev => [...prev, data]);
});
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   App.tsx   │ ◄─── Main state management
└─────┬───────┘
      │
      ├──► Navbar ◄───────── Navigation & Theme
      │
      ├──► Overview Tab
      │    ├─► TranscriptPanel ◄─── STT Service
      │    ├─► TranslationPanel ◄─── Translate Service
      │    ├─► SummaryCard ◄─── Summary Service
      │    └─► QuizCard
      │
      ├──► Teacher Tab
      │    └─► TeacherDashboard ◄─── Analytics
      │
      ├──► Student Tab
      │    └─► StudentDashboard ◄─── Interactions
      │
      ├──► Summary Tab
      │    ├─► SummaryCard (expanded)
      │    └─► QuizCard
      │
      └──► Join Tab
           └─► Join Form
```

---

For implementation details, refer to the source code in `/src/app/components/`.
