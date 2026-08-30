import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findSeoPage, seoPages } from "@/lib/seo-pages";
import { publicSiteLogoUrl, publicSiteUrl } from "@/lib/site";

type SeoLandingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return seoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: SeoLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = findSeoPage(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${page.slug}`,
    },
  };
}

export default async function SeoLandingPage({ params }: SeoLandingPageProps) {
  const { slug } = await params;
  const page = findSeoPage(slug);

  if (!page) {
    notFound();
  }

  const Icon = page.icon;

  return (
    <main className="min-h-dvh bg-[#f4f1ea] text-[#101418]">
      <section className="border-b border-[#101418]/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:px-8 lg:py-14">
          <Button asChild variant="outline" className="w-fit border-[#101418]/15 bg-white text-[#101418] hover:bg-[#f4f1ea]">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Zpět na Vehilo
            </Link>
          </Button>
          <div className="max-w-4xl">
            <Badge variant="outline" className="border-[#101418]/15 bg-[#f4f1ea] text-[#101418]">
              <Icon className="size-3.5" aria-hidden="true" />
              Vehilo
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#4b535b]">{page.intro}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {page.highlights.map((highlight) => (
                <Badge key={highlight} variant="secondary" className="bg-[#101418] text-white">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 sm:px-6 md:px-8 lg:grid-cols-3 lg:py-14">
        {page.sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-[#101418]/10 bg-white p-5 shadow-sm">
            <CheckCircle2 className="size-5 text-emerald-700" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5d656d]">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 md:px-8">
        <div className="rounded-2xl bg-[#101418] p-6 text-white sm:p-8">
          <h2 className="text-2xl font-semibold">Vyzkoušet Vehilo</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Vehilo je webová PWA aplikace pro správu auta, nákladů, servisu, dokumentů a připomínek.
            Funguje v prohlížeči a po přihlášení ukládá data pod vaším účtem.
          </p>
          <Button asChild className="mt-5 bg-white text-[#101418] hover:bg-white/90">
            <Link href="/">Otevřít aplikaci</Link>
          </Button>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: page.title,
            description: page.description,
            url: `${publicSiteUrl}/${page.slug}`,
            isPartOf: {
              "@type": "WebSite",
              name: "Vehilo",
              url: publicSiteUrl,
              publisher: {
                "@type": "Organization",
                "@id": `${publicSiteUrl}/#organization`,
                name: "Vehilo",
                url: publicSiteUrl,
                logo: {
                  "@type": "ImageObject",
                  url: publicSiteLogoUrl,
                  contentUrl: publicSiteLogoUrl,
                  width: 512,
                  height: 512,
                },
              },
            },
            inLanguage: "cs-CZ",
          }),
        }}
      />
    </main>
  );
}
