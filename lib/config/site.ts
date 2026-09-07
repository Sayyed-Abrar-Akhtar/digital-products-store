export const SITE_CONFIG = {
  name: "Sayyed Digital Store",
  shortName: "Digital Store",
  description:
    "Premium digital products, developer tools, design systems, and free learning resources for modern builders.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://store.sayyedabrarakhtar.com.np",
  ogImage: "https://store.sayyedabrarakhtar.com.np/og-image.png",
  author: {
    name: "Sayyed Abrar Akhtar",
    url: "https://sayyedabrarakhtar.com.np",
  },
  links: {
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
  mainNav: [
    { title: "Products", href: "/products" },
    { title: "Categories", href: "/categories" },
    { title: "Bundles", href: "/bundles" },
    { title: "Free Resources", href: "/free" },
    { title: "Blog", href: "/blog" },
  ],
  footerNav: {
    store: [
      { title: "All Products", href: "/products" },
      { title: "Categories", href: "/categories" },
      { title: "Bundles", href: "/bundles" },
      { title: "Free Resources", href: "/free" },
    ],
    company: [
      { title: "About", href: "/about" },
      { title: "Blog", href: "/blog" },
      { title: "FAQ", href: "/faq" },
      { title: "Contact", href: "/contact" },
    ],
    legal: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Refund Policy", href: "/refunds" },
    ],
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
