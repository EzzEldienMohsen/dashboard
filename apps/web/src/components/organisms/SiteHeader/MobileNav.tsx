"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { NavLink } from "@/components/molecules/NavLink";
import { NAV_LINKS } from "@/lib/config/nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        className="btn btn-ghost btn-sm p-2"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <XIcon /> : <HamburgerIcon />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-14 bg-base-100 border-b border-base-300 shadow-md z-50"
          >
            <nav className="flex flex-col gap-2 px-[5%] py-4" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  {t(link.labelKey as Parameters<typeof t>[0])}
                </NavLink>
              ))}
              <div className="border-t border-base-300 mt-2 pt-3">
                <Link
                  href="/register"
                  className="btn btn-primary btn-sm w-full"
                  onClick={() => setOpen(false)}
                >
                  {t("getStarted")}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
