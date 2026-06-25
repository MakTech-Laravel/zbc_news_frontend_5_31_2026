import { lazyWithRetry } from "@/routes/lazyWithRetry";
import type { RouteObject } from "react-router-dom";

import { AuthLayout } from "@/layouts/auth/AuthLayout";
import { GuestGate } from "@/routes/GuestGate";
import { suspensePage } from "@/routes/routeUtils";

const LoginEmail = lazyWithRetry(() => import("@/pages/global/auth/LoginEmail"));
const ForgetPassword = lazyWithRetry(() => import("@/pages/global/auth/ForgetPassword"));
const OTPVerification = lazyWithRetry(() => import("@/pages/global/auth/OTPVerification"));
const ResetPassword = lazyWithRetry(() => import("@/pages/global/auth/ResetPassword"));
const Register = lazyWithRetry(() => import("@/pages/global/auth/Register"));

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
  ],
};
