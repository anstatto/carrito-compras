import Link from "next/link";
import Image from "next/image";

export default function FooterLogo() {
  return (
    <Link href="/" className="block hover:opacity-80 transition-opacity">
      {/* Contenedor circular con fondo y sombra */}
      <div
        className="inline-flex items-center justify-center 
                      w-48 h-48 sm:w-42 sm:h-42
                      bg-white rounded-full shadow-md"
      >
        <Image
          src="/logo/Logo.svg"
          alt="Arlin Glow Care"
          width={0}
          height={0}
          sizes="(max-width: 948px) 8rem, (min-width: 948px) 11rem"
          className="w-48 sm:w-48 h-auto"
          priority
        />
      </div>
    </Link>
  );
}
