"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function NavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative text-sm font-medium text-base-content/80 hover:text-base-content transition-colors py-1"
      aria-current={isActive ? "page" : undefined}
    >
      {children}
      <motion.span
        className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary rounded-full"
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0 }}
      />
    </Link>
  );
}
