# EduSense - Real-Time Multilingual Lecture Assistant

A production-ready web application for real-time lecture transcription, translation, and AI-powered analysis. Built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

### Core Functionality
- **🎤 Live Speech-to-Text Transcription**: Real-time audio transcription with keyword highlighting
- **🌐 Multi-Language Translation**: Support for 9 languages including Tamil, English, Hindi, Spanish, French, German, Chinese, Japanese, and Arabic
- **📝 AI-Generated Summaries**: Automatic lecture summarization with key points extraction
- **📐 Formula Detection**: Identifies and extracts mathematical formulas
- **❓ Interactive Quizzes**: Auto-generated quiz questions with explanations
- **👨‍🏫 Teacher Dashboard**: Real-time analytics, confusion alerts, and engagement metrics
- **👨‍🎓 Student Dashboard**: Language preferences, confusion reporting, and progress tracking

### UI/UX Features
- **🎨 Dual Theme Support**: Light (warm palette) and Dark (Spotify-inspired) themes
- **📱 Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **♿ Accessibility**: WCAG-compliant with high contrast ratios
- **🔄 Real-Time Updates**: Live streaming of transcripts and translations
- **💾 Export Functionality**: Download summaries as text files

## 🎨 Design System

### Color Palettes
The application uses two distinct color themes extracted from the provided palette images:

**Light Theme** (Warm Palette)
- Background: `#FFF9E6` (Cream)
- Card: `#FFFFFF` (White)
- Accent: `#FFB84D` (Warm Orange/Gold)
- Muted: `#E8DCC4` (Light Beige)

**Dark Theme** (Spotify-inspired)
- Background: `#0a0a0a` (Near Black)
- Card: `#121212` (Dark Gray)
- Accent: `#1DB954` (Spotify Green)
- Muted: `#282828` (Medium Gray)

### Typography & Spacing
- Base font size: 16px
- Spacing system: 8px grid
- Font weights: 400 (normal), 500 (medium)
- Tamil + English font support

## 🏗️ Architecture

### Project Structure
```
/src
├── app
│   ├── components
│   │   ├── Navbar.tsx
│   │   ├── TranscriptPanel.tsx
│   │   ├── TranslationPanel.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── QuizCard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── ui/ (Reusable UI components)
│   ├── config
│   │   └── apiConfig.ts
│   ├── services
│   │   ├── sttService.ts
│   │   ├── translateService.ts
│   │   ├── summaryService.ts
│   │   └── websocketService.ts
│   └── App.tsx
└── styles
    ├── index.css
    ├── tailwind.css
    ├── theme.css
    └── fonts.css
```

### Service Layer
- **STT Service**: Handles speech-to-text transcription with mock real-time simulation
- **Translation Service**: Manages multi-language translation with caching
- **Summary Service**: AI-powered summarization and quiz generation
- **WebSocket Service**: Real-time bidirectional communication (prepared for backend integration)

## 🔧 Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:

```env
# Speech-to-Text API
NEXT_PUBLIC_STT_API_KEY=your_stt_api_key_here

# Translation API
NEXT_PUBLIC_TRANSLATE_API_KEY=your_translate_api_key_here

# AI Summarization (LLM)
NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key_here

# Text-to-Speech (Optional)
NEXT_PUBLIC_TTS_API_KEY=your_tts_api_key_here

# Backend API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### Supported Languages
- 🇬🇧 English (en)
- 🇮🇳 தமிழ் Tamil (ta)
- 🇮🇳 हिन्दी Hindi (hi)
- 🇪🇸 Español Spanish (es)
- 🇫🇷 Français French (fr)
- 🇩🇪 Deutsch German (de)
- 🇨🇳 中文 Chinese (zh)
- 🇯🇵 日本語 Japanese (ja)
- 🇸🇦 العربية Arabic (ar)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📊 Features by Tab

### Overview Tab
- Live transcript panel with keyword highlighting
- Real-time translation side-by-side view
- AI-generated summary with key points
- Interactive quiz questions
- Session statistics dashboard

### Teacher Dashboard
- Active student count and engagement metrics
- Real-time confusion alerts from students
- Topic difficulty analysis
- Live activity feed
- Confusion report severity indicators (low/medium/high)

### Student Dashboard
- Language preference settings
- "I'm Confused" instant reporting
- Question submission to teacher
- Progress tracking (attendance, quiz average, engagement)
- Auto-translate toggle
- Audio playback controls

### Summary Tab
- Comprehensive lecture summary
- Numbered key points list
- Keywords extraction
- Mathematical formulas display
- Download and share functionality

### Join Tab
- Session code entry
- Student/Observer role selection
- Active session display

## 🎯 Key Interactions

### Real-Time Transcription
1. Click "Start" button in Transcript Panel
2. Grant microphone permissions
3. Speak to see real-time transcription
4. Keywords are automatically highlighted
5. Confidence scores displayed for each segment

### Translation
1. Select source and target languages
2. Toggle between side-by-side and stacked view
3. Copy translations with one click
4. Swap languages instantly

### Teacher Analytics
- Monitor confusion alerts in real-time
- View topic difficulty rankings
- Track student engagement metrics
- See live activity feed

### Student Features
- Report confusion on specific topics
- Submit questions privately
- Adjust language preferences
- View personal progress metrics

## 🔐 Security

- API keys stored in environment variables
- Frontend-safe variables use `NEXT_PUBLIC_` prefix
- Sensitive logic abstracted in service layer
- No hardcoded credentials

## 🎨 Customization

### Changing Themes
Toggle between light and dark themes using the theme switcher in the navbar.

### Adding New Languages
Add languages in `/src/app/config/apiConfig.ts`:
```typescript
languages: [
  { code: 'xx', name: 'Language Name', nativeName: 'Native Name' },
  // ...
]
```

## 📱 Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Mock Data
The application includes mock data for demonstration:
- Simulated real-time transcription
- Pre-defined translations
- Sample confusion alerts
- Mock analytics data
- Generated quiz questions

## 🔄 Real-Time Simulation
Without a backend, the app simulates real-time functionality:
- Transcript segments appear every 3-5 seconds
- Auto-translation triggers on final transcripts
- Analytics update periodically
- Live indicators show active status

## 📚 Tech Stack
- **Framework**: React 18.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Build Tool**: Vite

## 🤝 API Integration Ready
All services are structured for easy backend integration:
- RESTful API endpoints defined
- WebSocket connection handlers ready
- Error handling implemented
- Mock responses match expected API structure

## 📝 License
This project is for educational and demonstration purposes.

## 🙏 Credits
- UI Design inspired by modern educational platforms
- Color palettes extracted from provided Spotify theme references
- Tamil language support for multilingual accessibility

---

**Built with ❤️ for accessible, multilingual education**
