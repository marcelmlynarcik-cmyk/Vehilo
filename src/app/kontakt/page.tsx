import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { legalMailto, legalOperator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakt na podporu a správce aplikace Vehilo.",
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Kontakt"
      description="Kontakt pro podporu, dotazy k aplikaci a žádosti týkající se osobních údajů."
    >
      <LegalSection title="Provozovatel">
        <p>{legalOperator.name}</p>
        <p>{legalOperator.location}</p>
        <p>
          E-mail:{" "}
          <a className="font-medium underline-offset-4 hover:underline" href={legalMailto("Vehilo - kontakt")}>
            {legalOperator.email}
          </a>
        </p>
        <Button asChild className="mt-2">
          <a href={legalMailto("Vehilo - kontakt")}>
            <Mail className="mr-2 size-4" aria-hidden="true" />
            Napsat e-mail
          </a>
        </Button>
      </LegalSection>

      <LegalSection title="S cim muzete napsat">
        <p>
          Na tento kontakt můžete posílat dotazy k aplikaci, hlášení chyb, žádosti o export dat, žádosti o
          výmaz účtu a žádosti týkající se ochrany osobních údajů.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
