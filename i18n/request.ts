import { getRequestConfig } from "next-intl/server";

const locales = ["uk", "ru", "en"] as const;
const defaultLocale = "uk";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const resolvedLocale =
    requested && locales.includes(requested as (typeof locales)[number])
      ? requested
      : defaultLocale;
  const messages = (await import(`../messages/${resolvedLocale}.json`)).default;
  return {
    messages,
    locale: resolvedLocale,
    timeZone: "Europe/Kyiv",
  };
});
