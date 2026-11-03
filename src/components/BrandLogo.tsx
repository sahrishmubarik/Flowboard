import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  nameClassName?: string;
  size?: number;
};

export default function BrandLogo({
  className,
  markClassName,
  nameClassName,
  size = 32,
}: BrandLogoProps) {
  return (
    <span className={className}>
      <Image
        src="/favicon.svg"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={markClassName}
      />
      <span className={nameClassName}>Flowboard</span>
    </span>
  );
}
