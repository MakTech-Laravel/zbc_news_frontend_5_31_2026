import { redirect } from "react-router";

export const loader = () => redirect("/");

export default function RedirectToHome() {
  return null;
}
