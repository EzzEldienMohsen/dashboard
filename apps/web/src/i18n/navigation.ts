import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and next/navigation — these
 * automatically prefix/strip the locale segment so component code never
 * has to know about it explicitly.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
