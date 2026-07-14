import { redirect } from "react-router";

export const loader = () => redirect("/user/dashboard");

export default function RedirectToUserDashboard() {
  return null;
}
