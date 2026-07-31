import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import AppShell from './layouts/AppShell.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import PendingPage from './pages/auth/PendingPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage.jsx';
import AdminPage from './pages/internal/AdminPage.jsx';
import ApprovalPage from './pages/internal/ApprovalPage.jsx';
import BoardPage from './pages/internal/BoardPage.jsx';
import BoardsPage from './pages/internal/BoardsPage.jsx';
import CalendarPage from './pages/internal/CalendarPage.jsx';
import DashboardPage from './pages/internal/DashboardPage.jsx';
import FilesPage from './pages/internal/FilesPage.jsx';
import MailPage from './pages/internal/MailPage.jsx';
import OrganizationPage from './pages/internal/OrganizationPage.jsx';
import MyProfilePage from './pages/internal/MyProfilePage.jsx';
import PostDetailPage from './pages/internal/PostDetailPage.jsx';
import MembershipStatusPage from './pages/status/MembershipStatusPage.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

const PostWritePage = lazy(() => import('./pages/internal/PostWritePage.jsx'));

function EditorRoute() {
  return <Suspense fallback={<p className="gw-empty-state" role="status">게시글 편집기를 불러오고 있습니다.</p>}><PostWritePage /></Suspense>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/groupware">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="pending" element={<PendingPage />} />
            <Route path="rejected" element={<MembershipStatusPage status="rejected" />} />
            <Route path="locked" element={<MembershipStatusPage status="locked" />} />
            <Route path="resigned" element={<MembershipStatusPage status="resigned" />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="reset-password/update" element={<UpdatePasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<MyProfilePage />} />
              <Route path="mypage" element={<Navigate to="/profile" replace />} />
              <Route path="mail" element={<MailPage />} />
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="boards" element={<BoardsPage />} />
              <Route path="boards/:boardSlug" element={<BoardPage />} />
              <Route path="boards/:boardSlug/posts/:postId" element={<PostDetailPage />} />
              <Route path="boards/:boardSlug/posts/:postId/edit" element={<EditorRoute />} />
              <Route path="boards/:boardSlug/write" element={<EditorRoute />} />
              <Route path="approval" element={<ApprovalPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
