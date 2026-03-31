import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Toaster } from "sonner";

// Public pages
import Landing from "./pages/Landing";
import Unauthorized from "./pages/Unauthorized";
import TeacherLogin from "./pages/auth/TeacherLogin";
import StudentLogin from "./pages/auth/StudentLogin";
import StudentRegister from "./pages/auth/StudentRegister";

// Layouts
import TeacherLayout from "./layouts/TeacherLayout";
import StudentLayout from "./layouts/StudentLayout";

// Teacher pages
import Dashboard from "./pages/teacher/Dashboard";
import StartLecture from "./pages/teacher/StartLecture";
import LiveControl from "./pages/teacher/LiveControl";
import Analytics from "./pages/teacher/Analytics";
import PostSummary from "./pages/teacher/PostSummary";
import TeacherVideo from "./pages/teacher/TeacherVideo";
import AttendanceTracker from "./pages/teacher/AttendanceTracker";
import StudentVideo from "./pages/student/StudentVideo";

// Student pages
import JoinSession from "./pages/student/JoinSession";
import LiveLecture from "./pages/student/LiveLecture";
import Notes from "./pages/student/Notes";
import Quiz from "./pages/student/Quiz";
import Progress from "./pages/student/Progress";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/teacher-login" element={<TeacherLogin />} />
            <Route path="/auth/student-login" element={<StudentLogin />} />
            <Route path="/auth/student-register" element={<StudentRegister />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Teacher — protected */}
            <Route path="/teacher" element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"  element={<Dashboard />} />
              <Route path="start"      element={<StartLecture />} />
              <Route path="live"       element={<LiveControl />} />
              <Route path="analytics"  element={<Analytics />} />
              <Route path="summary"    element={<PostSummary />} />
              <Route path="video"      element={<TeacherVideo />} />
              <Route path="attendance" element={<AttendanceTracker />} />
            </Route>

            {/* Student — protected */}
            <Route path="/student" element={
              <ProtectedRoute allowedRole="student">
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="lecture" replace />} />
              <Route path="join"      element={<JoinSession />} />
              <Route path="lecture"   element={<LiveLecture />} />
              <Route path="notes"     element={<Notes />} />
              <Route path="quiz"      element={<Quiz />} />
              <Route path="progress"  element={<Progress />} />
              <Route path="video"     element={<StudentVideo />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
