import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <Image
          src="/taco_logo.png"
          alt="Taco Domains"
          width={48}
          height={48}
          className="rounded-xl"
        />
        <span className="font-[family-name:var(--font-anybody)] text-2xl font-bold text-text">
          Taco Domains
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
