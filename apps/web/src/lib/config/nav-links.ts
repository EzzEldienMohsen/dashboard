export interface NavLinkConfig {
  href: string;
  labelKey: string;
}

export const NAV_LINKS: NavLinkConfig[] = [
  { href: "/", labelKey: "home" },
  { href: "/features", labelKey: "features" },
  { href: "/about", labelKey: "about" },
  { href: "/announcements", labelKey: "announcements" },
];

export const FOOTER_LINKS: NavLinkConfig[] = [
  { href: "/",              labelKey: "links.home"          },
  { href: "/features",      labelKey: "links.features"      },
  { href: "/about",         labelKey: "links.about"         },
  { href: "/announcements", labelKey: "links.announcements" },
  { href: "/login",         labelKey: "links.login"         },
  { href: "/register",      labelKey: "links.register"      },
];
