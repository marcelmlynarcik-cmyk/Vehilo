import Link from "next/link";
import { legalLinks, legalOperator } from "@/lib/legal";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#f4f1ea] text-[#101418]">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 md:px-8">
        <header className="mb-10 flex flex-col gap-5 border-b border-[#101418]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            Vehilo
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#4b535b]">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="underline-offset-4 hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5d656d]">
            {legalOperator.serviceName}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
          <p className="max-w-3xl text-base leading-7 text-[#4b535b]">{description}</p>
        </section>

        <article className="mt-10 space-y-8 text-base leading-7 text-[#303942]">
          {children}
        </article>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#101418]/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-[#101418]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
