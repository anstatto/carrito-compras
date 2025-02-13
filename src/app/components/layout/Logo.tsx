import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex-shrink-0 mt-4">
      <Image
        src="/logo/Logo.svg"
        alt="Arlin Glow Care"
        width={0}
        height={0}
        sizes="(max-width: 748px) 8rem, (min-width: 748px) 10rem"
        className="w-28 sm:w-40 h-auto"
        priority
      />
    </Link>
  );
}
