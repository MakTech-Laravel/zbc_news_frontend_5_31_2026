import { redirect } from "react-router";

export const loader = () => redirect("/terms");

export default function RedirectToTerms() {
  return null;
}
