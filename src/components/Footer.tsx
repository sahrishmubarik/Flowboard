"use client";

import Link from "next/link";

const footerLinks = [
  { label: "Product", href: "#board" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Link href="/" className="brand">
            <span className="brand-mark">F</span>
            <span className="brand-name">Flowboard</span>
          </Link>

          <p className="footer-description">
            A simple place to catch ideas and turn them into shipped work.
          </p>
        </div>

        <nav className="footer-nav">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="footer-link">
              {link.label}
            </Link>
          ))}

          <Link href="/auth/login" className="footer-link">
            Sign in
          </Link>

          <Link href="/auth/register" className="footer-link">
            Start free
          </Link>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <p>© {new Date().getFullYear()} Flowboard. All rights reserved.</p>

        <div className="footer-meta">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
