import { asset } from "@/lib/base-path";

type LogoProps = { className?: string };

/** Stacey Leahy | Compass logo (white, on transparent). */
export default function Logo({ className = "" }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset("/images/stacey-logo.png")}
      alt="Stacey Leahy | Compass"
      width={320}
      height={63}
      className={`h-9 w-auto sm:h-11 lg:h-12 ${className}`}
    />
  );
}
