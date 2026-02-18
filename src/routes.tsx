import { createBrowserRouter } from "react-router";
import HomeScreen from "./pages/App";
import ErrorScreen from "./pages/error";
import RootLayout from "./layout/Rootlayout";
import AuthLayout from "./layout/Authlayout";
import LoginScreen from "./pages/auth/login-form";
import SignupPage from "./pages/auth/sign-up";
import verifyOTPPage from "./pages/auth/verify-otp";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorScreen,
    children: [{ index: true, Component: HomeScreen }],
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

    ],
  }
]);
