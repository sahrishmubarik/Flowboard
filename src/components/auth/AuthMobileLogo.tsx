import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

// The brand panel (and its logo) is hidden at 900px and below; this shows
// the logo above the form at those sizes instead.
export default function AuthMobileLogo() {
  return (
    <Link href="/" className="mb-8 inline-flex min-[901px]:hidden">
      <BrandLogo
        className="flex items-center gap-2"
        markClassName="h-8 w-8 rounded-[7px]"
        nameClassName="text-[19px] font-semibold tracking-tight text-[var(--color-text-primary)]"
        size={32}
      />
    </Link>
  );
}
