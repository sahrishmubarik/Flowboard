import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

import AuthBrandBoard from "./AuthBrandBoard";

interface AuthBrandPanelProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function AuthBrandPanel({
  eyebrow,
  title,
  description,
}: AuthBrandPanelProps) {
  return (
    <section className="auth-brand-panel">
      {/* Logo */}
      <div className="auth-brand-header ml-[-460px]">
        <Link href="/" className="brand-logo">
          <BrandLogo
            className="brand-logo"
            markClassName="brand-logo-mark"
            nameClassName="brand-logo-name"
            size={28}
          />
        </Link>
      </div>

      {/* Content */}
      <div className="auth-brand-content">
        <div className="auth-brand-copy">
          <span className="auth-eyebrow">{eyebrow}</span>

          <h1 className="auth-brand-title">{title}</h1>

          <p className="auth-brand-description">{description}</p>

          <AuthBrandBoard />
        </div>
      </div>
    </section>
  );
}
