import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // ---------- Public content (server-rendered) ----------
  layout("routes/layouts/FrontendLayoutRoute.tsx", [
    route("about", "pages/frontend/AboutUs.tsx"),
    route("contact", "pages/frontend/Contact.tsx"),
    route("privacy", "pages/frontend/PrivacyPolicy.tsx"),
    route("terms", "pages/frontend/TermsOfService.tsx"),
    route("privacy-policy", "routes/redirects/toPrivacy.tsx"),
    route("terms-of-service", "routes/redirects/toTerms.tsx"),
    route("cookie-policy", "pages/frontend/CookiePolicy.tsx"),
    route("accessibility-statement", "pages/frontend/AccessibilityStatement.tsx"),
    route("advertise", "pages/frontend/Advertise.tsx"),
    route("careers", "pages/frontend/Careers.tsx"),
    route("newsletter", "pages/frontend/Newsletter.tsx"),
    layout("routes/layouts/MainLayoutRoute.tsx", [
      index("routes/public/HomeRoute.tsx"),
      route("tag/:tagSlug", "pages/frontend/TagArticles.tsx"),
      route("author/:authorSlug", "routes/public/AuthorRoute.tsx"),
      route("news-details/:articleSlug", "routes/public/LegacyArticleRedirect.tsx"),
      route("news-details", "routes/redirects/toHome.tsx"),
      route(":slug", "routes/public/SlugRoute.tsx"),
    ]),
  ]),

  // ---------- Out of scope: client-only, unchanged behavior ----------
  route("admin/*", "routes/shells/AdminApp.tsx"),
  route("user/*", "routes/shells/UserApp.tsx"),

  layout("routes/shells/AuthShell.tsx", [
    route("login", "pages/global/auth/LoginEmail.tsx"),
    route("login/email", "routes/public/LoginEmailAlias.tsx"),
    route("forget-password", "pages/global/auth/ForgetPassword.tsx"),
    route("otp-verification", "pages/global/auth/OTPVerification.tsx"),
    route("reset-password", "pages/global/auth/ResetPassword.tsx"),
    route("register", "pages/global/auth/Register.tsx"),
  ]),

  layout("routes/shells/ClientOnlyShell.tsx", [
    route("dashboard", "routes/redirects/toUserDashboard.tsx"),
    route("unauthorized", "pages/global/Unauthorized.tsx"),
    route("ws-test", "pages/dev/WebSocketTest.tsx"),
    route("newsletter/verify", "pages/newsletter/NewsletterVerifyPage.tsx"),
    route("newsletter/unsubscribe", "pages/newsletter/NewsletterUnsubscribePage.tsx"),
    route("newsletter/preferences", "pages/newsletter/NewsletterPreferencesPage.tsx"),
    route("demo/new", "pages/demo/NewDemo.tsx"),
  ]),

  route("*", "pages/global/NotFound.tsx"),
] satisfies RouteConfig;
