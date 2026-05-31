import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

import { AuthLayout } from "@/layouts/auth/AuthLayout";
import { GuestGate } from "@/routes/GuestGate";
import { suspensePage } from "@/routes/routeUtils";

const LoginEmail = lazy(() => import("@/pages/global/auth/LoginEmail"));
const ForgetPassword = lazy(() => import("@/pages/global/auth/ForgetPassword"));
const OTPVerification = lazy(() => import("@/pages/global/auth/OTPVerification"));
const ResetPassword = lazy(() => import("@/pages/global/auth/ResetPassword"));
const Register = lazy(() => import("@/pages/global/auth/Register"));
const AdminLogin = lazy(() => import("@/pages/global/auth/AdminLogin"));

/** Guest-only auth screens (wrapped with GuestGate). */
export const authRoutes: RouteObject = {
  element: <AuthLayout />,
  children: [
    {
      path: "/login",
      element: <GuestGate>{suspensePage(LoginEmail)}</GuestGate>,
    },
    {
      path: "/login/email",
      element: <GuestGate>{suspensePage(LoginEmail)}</GuestGate>,
    },
    {
      path: "/forget-password",
      element: <GuestGate>{suspensePage(ForgetPassword)}</GuestGate>,
    },
    {
      path: "/otp-verification",
      element: <GuestGate>{suspensePage(OTPVerification)}</GuestGate>,
    },
    {
      path: "/reset-password",
      element: <GuestGate>{suspensePage(ResetPassword)}</GuestGate>,
    },
    {
      path: "/register",
      element: <GuestGate>{suspensePage(Register)}</GuestGate>,
    },
    {
      path: "/admin/login",
      element: <GuestGate>{suspensePage(AdminLogin)}</GuestGate>,
    },
  ],
};
