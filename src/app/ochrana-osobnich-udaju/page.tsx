import type { Metadata } from "next";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { legalMailto, legalOperator } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description: "Informace o zpracování osobních údajů ve službě Vehilo.",
  alternates: {
    canonical: "/ochrana-osobnich-udaju",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Ochrana osobních údajů"
      description="Tato stránka vysvětluje, jaké osobní údaje Vehilo zpracovává, proč je potřebuje a jak může uživatel uplatnit svá práva."
    >
      <LegalSection title="Správce osobních údajů">
        <p>
          Správcem osobních údajů je {legalOperator.name}, {legalOperator.location}. Kontakt pro ochranu
          osobních údajů a podporu je{" "}
          <a className="font-medium underline-offset-4 hover:underline" href={legalMailto("Vehilo - osobni udaje")}>
            {legalOperator.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Jaké údaje zpracováváme">
        <LegalList
          items={[
            "údaje z Google přihlášení, zejména e-mail, jméno a identifikátor účtu,",
            "profilová nastavení v aplikaci, např. měna, jednotky, jazyk a motiv,",
            "údaje o vozidlech, které uživatel zadá, např. název, značka, model, nájezd, typ pohonu, SPZ nebo VIN, pokud je uživatel vyplní,",
            "záznamy o výdajích, tankování, nabíjení, servisu, připomínkách a dokumentech,",
            "přílohy nahrané uživatelem, např. účtenky, faktury, fotografie nebo dokumenty,",
            "technické údaje potřebné pro provoz, zabezpečení a řešení chyb, např. IP adresa, informace o prohlížeči, čas požadavku a přihlašovací cookies.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Proč údaje zpracováváme">
        <LegalList
          items={[
            "aby bylo možné vytvořit a zabezpečit uživatelský účet,",
            "aby aplikace mohla ukládat a zobrazovat data garáže, vozidel, nákladů, servisu a připomínek,",
            "aby bylo možné poskytovat podporu a odpovídat na dotazy,",
            "aby bylo možné chránit aplikaci, předcházet zneužití a řešit technické chyby,",
            "aby bylo možné splnit případné zákonné povinnosti.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Právní základy">
        <p>
          Hlavním právním základem je poskytování bezplatné služby uživateli. Pro zabezpečení, provozní logy
          a ochranu aplikace může být právním základem oprávněný zájem. Pokud by v budoucnu byly přidány
          marketingové e-maily, analytika nebo netechnické cookies, budou spuštěny pouze po samostatném
          souhlasu tam, kde je souhlas vyžadován.
        </p>
      </LegalSection>

      <LegalSection title="Komu mohou být údaje zpřístupněny">
        <p>
          Údaje nejsou prodávány. Pro provoz služby jsou využíváni tito poskytovatelé, kteří mohou zpracovávat
          údaje jako zpracovatelé nebo samostatní poskytovatelé technických služeb:
        </p>
        <LegalList
          items={[
            "Vercel - hosting webové aplikace a technický provoz,",
            "Supabase - databáze, autentizace, úložiště souborů a serverová infrastruktura,",
            "Google - přihlášení přes Google účet.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Platby a marketing">
        <p>
          Vehilo je v aktuální verzi poskytováno zdarma. Aplikace nepoužívá platby ani marketingové e-maily.
          Pokud se to v budoucnu změní, budou podmínky a informace o ochraně osobních údajů aktualizovány
          před spuštěním takové funkce.
        </p>
      </LegalSection>

      <LegalSection title="Cookies a lokalni uloziste">
        <p>
          Vehilo používá technické cookies a podobné technologie potřebné pro přihlášení, zabezpečení,
          nastavení uživatele, PWA funkčnost a základní provoz aplikace. Tyto technologie jsou nezbytné pro
          fungování služby. Marketingové ani analytické cookies nejsou v aktuální verzi používány.
        </p>
      </LegalSection>

      <LegalSection title="Jak dlouho údaje uchováváme">
        <p>
          Údaje uchováváme po dobu existence uživatelského účtu. Pokud uživatel požádá o výmaz účtu nebo
          konkrétních dat, budou data odstraněna bez zbytečného odkladu, pokud není nutné uchovat část údajů
          kvůli právním nárokům, zabezpečení nebo zákonné povinnosti.
        </p>
      </LegalSection>

      <LegalSection title="Práva uživatele">
        <p>Uživatel může požádat zejména o:</p>
        <LegalList
          items={[
            "informaci, jaké údaje jsou zpracovávány,",
            "kopii nebo export svych dat,",
            "opravu nepřesných údajů,",
            "výmaz účtu nebo vybraných dat,",
            "omezení zpracování nebo námitku proti zpracování, pokud to odpovídá GDPR,",
            "přenositelnost dat v rozsahu, ve kterém se uplatní.",
          ]}
        />
        <p>
          Žádosti posílejte na{" "}
          <a className="font-medium underline-offset-4 hover:underline" href={legalMailto("Vehilo - žádost GDPR")}>
            {legalOperator.email}
          </a>
          . Žádosti budou řešeny bez zbytečného odkladu, zpravidla nejpozději do jednoho měsíce.
        </p>
      </LegalSection>

      <LegalSection title="Děti a věk uživatele">
        <p>
          Služba je určena pro uživatele od {legalOperator.minimumAge} let. Pokud je uživatel mladší, musí mít
          souhlas osoby vykonávající rodičovskou odpovědnost. Vehilo není cíleně zaměřeno na děti.
        </p>
      </LegalSection>

      <LegalSection title="Stížnost u dozorového úřadu">
        <p>
          Pokud se uživatel domnívá, že jsou jeho osobní údaje zpracovávány v rozporu s právními předpisy,
          může se obrátit na Úřad pro ochranu osobních údajů, Pplk. Sochora 27, 170 00 Praha 7,
          web uoou.gov.cz.
        </p>
      </LegalSection>

      <LegalSection title="Účinnost">
        <p>Tyto informace jsou účinné od {legalOperator.effectiveDate}.</p>
      </LegalSection>
    </LegalPage>
  );
}
