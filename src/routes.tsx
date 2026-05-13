import { createBrowserRouter, Navigate } from "react-router";
import ErrorScreen from "./pages/error";
import RootLayout from "./layout/Rootlayout";
import AuthLayout from "./layout/Authlayout";
import LoginScreen from "./pages/auth/login-form";
import SignupPage from "./pages/auth/sign-up";
import verifyOTPPage from "./pages/auth/verify-otp";
import ForgetPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./components/auth/reset-password";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import HeadTeacherDashboard from "./pages/dashboard/HeadTeacherDashboard";
import HeadTeacherStudentsYear from "./pages/dashboard/HeadTeacherStudentsYear";
import HeadTeacherClassManagement from "./pages/dashboard/HeadTeacherClassManagement";
import RegularTeacherDashboard from "./pages/dashboard/RegularTeacherDashboard";
import TeacherStudentsYear from "./pages/dashboard/TeacherStudentsYear";
import TeacherClassManagement from "./pages/dashboard/TeacherClassManagement";

import { useSession } from "./lib/auth-client";

function RoleRedirect() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  
  if (session.user.role === "HEAD_TEACHER") {
    return <Navigate to="/head-teacher" replace />;
  }
  
  if (session.user.role === "TEACHER") {
    return <Navigate to="/teacher" replace />;
  }
  
  return <Navigate to="/student" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorScreen,
    children: [
      { index: true, element: <RoleRedirect /> },
      { path: "student", Component: StudentDashboard },
      { path: "teacher", Component: RegularTeacherDashboard },
      { path: "teacher/students/:year", Component: TeacherStudentsYear },
      { path: "teacher/classes/:subjectId/manage", Component: TeacherClassManagement },
      { path: "head-teacher", Component: HeadTeacherDashboard },
      { path: "head-teacher/students/:year", Component: HeadTeacherStudentsYear },
      { path: "head-teacher/classes/:subjectId/manage", Component: HeadTeacherClassManagement },
    ],
  },
  {
    path: "/forgot-password",
    Component: AuthLayout,
    ErrorBoundary: ErrorScreen,
    children: [{ index: true, Component: ForgetPasswordPage }],
  },
  {
    path: "/reset-password",
    Component: AuthLayout,
    ErrorBoundary: ErrorScreen,
    children: [{ index: true, Component: ResetPasswordPage }],
  },
  {
    path: "/login",
    Component: AuthLayout,
    ErrorBoundary: ErrorScreen,
    children: [{ index: true, Component: LoginScreen }],
  },
  {
    path: "/signup",
    Component: AuthLayout,
    ErrorBoundary: ErrorScreen,
    children: [
      { index: true, Component: SignupPage },
      { path: "verify-email", Component: verifyOTPPage },
      { path: "verify-otp", Component: verifyOTPPage },
    ],
  }
]);


