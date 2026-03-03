import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["uk", "ru", "en"],
  defaultLocale: "uk",
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
