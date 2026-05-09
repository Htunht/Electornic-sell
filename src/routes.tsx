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
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TeacherStudentsYear from "./pages/dashboard/TeacherStudentsYear";
import TeacherClassManagement from "./pages/dashboard/TeacherClassManagement";

import { useSession } from "./lib/auth-client";

function RoleRedirect() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  
  if (session.user.role === "TEACHER" || session.user.role === "MAJOR_HEAD" || session.user.role === "MINOR_HEAD") {
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
      { path: "teacher", Component: TeacherDashboard },
      { path: "teacher/students/:year", Component: TeacherStudentsYear },
      { path: "teacher/classes/:subjectId/manage", Component: TeacherClassManagement },
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


