import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { legalMailto, legalOperator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Podmínky používání",
  description: "Podmínky používání bezplatné aplikace Vehilo.",
  alternates: {
    canonical: "/podminky-pouzivani",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Podmínky používání"
      description="Tyto podmínky popisují základní pravidla bezplatného používání aplikace Vehilo."
    >
      <LegalSection title="Provozovatel služby">
        <p>
          Aplikaci Vehilo provozuje {legalOperator.name}, {legalOperator.location}. Kontakt pro dotazy a podporu je{" "}
          <a className="font-medium underline-offset-4 hover:underline" href={legalMailto("Vehilo - podpora")}>
            {legalOperator.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Popis služby">
        <p>
          Vehilo je webová PWA aplikace pro evidenci vozidel, nákladů, paliva, nabíjení, servisu, příloh a
          připomínek. Uživatel si do aplikace zadává vlastní data a odpovídá za jejich správnost.
        </p>
      </LegalSection>

      <LegalSection title="Cena a registrace">
        <p>
          Aktuální verze aplikace je zdarma. Nejsou aktivní žádné platby ani marketingové e-maily. Registrace
          je veřejná a probíhá přes Google účet.
        </p>
      </LegalSection>

      <LegalSection title="Věk uživatele">
        <p>
          Služba je určena pro uživatele od {legalOperator.minimumAge} let. Mladší uživatel může službu používat
          pouze se souhlasem osoby vykonávající rodičovskou odpovědnost.
        </p>
      </LegalSection>

      <LegalSection title="Dostupnost a změny služby">
        <p>
          Vehilo je poskytováno v aktuálním stavu jako bezplatná služba. Provozovatel může aplikaci upravovat,
          dočasně omezit, opravovat chyby nebo ukončit bezplatný provoz. Při podstatných změnách bude snaha
          uživatele informovat přiměřeným způsobem v aplikaci nebo e-mailem.
        </p>
      </LegalSection>

      <LegalSection title="Povinnosti uživatele">
        <LegalList
          items={[
            "používat aplikaci v souladu s právem a těmito podmínkami,",
            "nezadávat do aplikace údaje, ke kterým nemá právo,",
            "chránit přístup ke svému Google účtu,",
            "nenahrávat škodlivý, protiprávní nebo nepřiměřený obsah,",
            "nepokoušet se obcházet zabezpečení aplikace ani přistupovat k datům jiných uživatelů.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Data uživatele">
        <p>
          Uživatel zůstává odpovědný za obsah, který do aplikace uloží. Provozovatel k datům přistupuje jen v
          rozsahu nutném pro provoz, zabezpečení, podporu, opravy chyb nebo splnění právních povinností.
          Podrobnosti jsou v dokumentu Ochrana osobních údajů.
        </p>
      </LegalSection>

      <LegalSection title="Export a výmaz účtu">
        <p>
          Export dat nebo výmaz účtu lze vyžádat e-mailem na{" "}
          <a className="font-medium underline-offset-4 hover:underline" href={legalMailto("Vehilo - export nebo výmaz účtu")}>
            {legalOperator.email}
          </a>
          . Automatizovaná samoobslužná funkce exportu a výmazu je plánovaná.
        </p>
      </LegalSection>

      <LegalSection title="Omezení odpovědnosti">
        <p>
          Vehilo slouží jako pomocná evidence. Aplikace nenahrazuje účetnictví, právní, daňové, pojistné ani
          technické poradenství. Uživatel by měl důležité termíny, částky a dokumenty ověřovat podle
          originálních podkladů.
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          Dotazy, žádosti o podporu, export nebo výmaz účtu posílejte na{" "}
          <a className="font-medium underline-offset-4 hover:underline" href={legalMailto("Vehilo - dotaz")}>
            {legalOperator.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Účinnost">
        <p>Tyto podmínky jsou účinné od {legalOperator.effectiveDate}.</p>
      </LegalSection>
    </LegalPage>
  );
}
