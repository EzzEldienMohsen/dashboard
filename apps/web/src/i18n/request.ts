import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/locale/locale-cookie";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
