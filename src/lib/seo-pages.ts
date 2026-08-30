import { BarChart3, Bell, Car, FileText, Fuel, Wrench, type LucideIcon } from "lucide-react";

export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  icon: LucideIcon;
  sections: Array<{
    title: string;
    body: string;
  }>;
  highlights: string[];
};

export const seoPages: SeoPage[] = [
  {
    slug: "sprava-auta",
    title: "Správa auta online | Náklady, servis, dokumenty a připomínky",
    description:
      "Spravujte auto online ve Vehilo. Evidence vozidel, nákladů, tankování, nabíjení, servisu, dokumentů a připomínek na jednom místě.",
    h1: "Správa auta online bez tabulek a ztracených dokladů",
    intro:
      "Vehilo pomáhá vést přehled o autě od nákupu přes každodenní provoz až po servis, dokumenty a důležité termíny.",
    icon: Car,
    sections: [
      {
        title: "Jedno místo pro celou garáž",
        body: "Do aplikace můžete uložit jedno vozidlo i více aut. Každé vozidlo má vlastní nájezd, typ pohonu, provozní záznamy, dokumenty a historii nákladů.",
      },
      {
        title: "Reálné náklady na provoz",
        body: "Vehilo propojuje výdaje, palivo, nabíjení a servisní záznamy, aby bylo vidět, kolik auto skutečně stojí měsíčně i za kilometr.",
      },
      {
        title: "Připomínky pro termíny a kilometry",
        body: "Servis, STK/MOT, dokumenty nebo pojištění můžete sledovat podle data, nájezdu nebo kombinace obou hodnot.",
      },
    ],
    highlights: ["evidence vozidel", "náklady na auto", "servisní historie", "dokumenty k vozidlu"],
  },
  {
    slug: "evidence-nakladu-na-auto",
    title: "Evidence nákladů na auto | Výdaje, tankování a cena za kilometr",
    description:
      "Vehilo eviduje náklady na auto, tankování, nabíjení, servis a běžné výdaje. Sledujte měsíční náklady i cenu za kilometr.",
    h1: "Evidence nákladů na auto s cenou za kilometr",
    intro:
      "Místo odhadů uvidíte skutečné provozní náklady auta podle záznamů, které průběžně ukládáte.",
    icon: BarChart3,
    sections: [
      {
        title: "Výdaje, servis a energie dohromady",
        body: "Aplikace počítá náklady z výdajů, servisních záznamů, tankování a nabíjení. Díky tomu nejsou servisní faktury oddělené od běžného provozu.",
      },
      {
        title: "Přehled po měsících a kategoriích",
        body: "Záznamy je možné sledovat podle období, kategorií a vozidla. Hodí se to pro rodinné auto, pracovní vůz i porovnání více vozidel.",
      },
      {
        title: "Dlouhodobý pohled na vlastnictví",
        body: "Vehilo umí pracovat i s pořizovací cenou a aktuální hodnotou vozidla, takže se provozní náklady dají oddělit od celkových nákladů vlastnictví.",
      },
    ],
    highlights: ["výdaje na auto", "cena za kilometr", "měsíční náklady", "tankování a nabíjení"],
  },
  {
    slug: "servisni-historie-vozidla",
    title: "Servisní historie vozidla | Servis, faktury a záruky",
    description:
      "Veďte servisní historii vozidla ve Vehilo. Ukládejte servisní zásahy, poskytovatele, díly, faktury, záruky a poznámky.",
    h1: "Servisní historie vozidla s fakturami a poznámkami",
    intro:
      "Servisní záznamy dávají smysl jen tehdy, když jsou dohledatelné podle vozidla, data, nájezdu a příloh.",
    icon: Wrench,
    sections: [
      {
        title: "Servis podle typu vozidla",
        body: "Formuláře se přizpůsobují spalovacím autům, hybridům i elektromobilům, aby servisní typy odpovídaly konkrétnímu pohonu.",
      },
      {
        title: "Díly, práce, celková cena",
        body: "U servisního záznamu můžete evidovat cenu práce, cenu dílů, celkovou cenu, poskytovatele i seznam vyměněných dílů.",
      },
      {
        title: "Faktury a záruky",
        body: "K servisu lze přiložit fakturu nebo fotku a uložit záruku do data nebo kilometrů.",
      },
    ],
    highlights: ["servis auta", "servisní knížka online", "faktury k servisu", "záruka do km"],
  },
  {
    slug: "pripominky-stk-servisu",
    title: "Připomínky STK, servisu a dokumentů | Datum i kilometry",
    description:
      "Nastavte připomínky STK, servisu, pojištění a dokumentů podle data, kilometrů nebo kombinace obou hodnot.",
    h1: "Připomínky STK, servisu, pojištění a dokumentů",
    intro:
      "Vehilo hlídá důležité termíny a nájezdy tak, aby se servis ani platnost dokumentů neztratily v kalendáři.",
    icon: Bell,
    sections: [
      {
        title: "Datumové a kilometrové připomínky",
        body: "Připomínku můžete nastavit podle data, podle nájezdu nebo podle obou podmínek najednou.",
      },
      {
        title: "Odložení a opakování",
        body: "Když připomínku vyřešíte, lze ji označit jako hotovou a rovnou vytvořit další podle nastaveného intervalu.",
      },
      {
        title: "Dokumenty s platností",
        body: "Dokumenty s vyplněným datem platnosti vytvářejí navázanou připomínku automaticky.",
      },
    ],
    highlights: ["připomínka STK", "připomínka servisu", "platnost dokumentů", "upozornění podle kilometrů"],
  },
  {
    slug: "evidence-tankovani-nabijeni",
    title: "Evidence tankování a nabíjení | Spotřeba paliva i energie",
    description:
      "Evidujte tankování, nabíjení, LPG a CNG. Vehilo pomáhá sledovat spotřebu, cenu paliva a náklady na 100 km.",
    h1: "Evidence tankování a nabíjení pro spalovací auta i elektromobily",
    intro:
      "Vehilo podporuje benzín, naftu, hybridy, elektromobily, LPG i CNG, takže provozní záznamy odpovídají konkrétnímu autu.",
    icon: Fuel,
    sections: [
      {
        title: "Palivo, elektřina, LPG i CNG",
        body: "Záznamy rozlišují typ energie, množství, jednotku, cenu a stav plné nádrže nebo plného nabití.",
      },
      {
        title: "Spotřeba a náklady",
        body: "Při dostatku záznamů aplikace dopočítává spotřebu a cenu provozu mezi jednotlivými záznamy.",
      },
      {
        title: "Přílohy a poznámky",
        body: "K provozním záznamům lze doplnit místo, poskytovatele, poznámky a další souvislosti pro pozdější kontrolu.",
      },
    ],
    highlights: ["evidence tankování", "evidence nabíjení", "spotřeba paliva", "náklady na 100 km"],
  },
  {
    slug: "dokumenty-k-vozidlu",
    title: "Dokumenty k vozidlu | Pojištění, STK, smlouvy a doklady",
    description:
      "Ukládejte dokumenty k vozidlu: pojištění, STK/MOT, emise, kupní smlouvy, dálniční známky a další doklady.",
    h1: "Dokumenty k vozidlu uložené bezpečně u konkrétního auta",
    intro:
      "Důležité doklady mají být dohledatelné podle vozidla, kategorie a platnosti. Vehilo je propojuje i s připomínkami.",
    icon: FileText,
    sections: [
      {
        title: "Soukromé soubory a metadata",
        body: "K dokumentu lze uložit název, kategorii, datum vystavení, datum platnosti, poznámky a přiložený PDF nebo obrázek.",
      },
      {
        title: "Platnost a stav",
        body: "Dokumenty se automaticky řadí podle toho, jestli jsou platné, brzy vyprší nebo už jsou prošlé.",
      },
      {
        title: "Připomínky podle data",
        body: "Po vyplnění data platnosti vznikne připomínka navázaná na daný dokument.",
      },
    ],
    highlights: ["dokumenty k autu", "pojištění vozidla", "STK dokumenty", "kupní smlouva"],
  },
];

export function findSeoPage(slug: string) {
  return seoPages.find((page) => page.slug === slug) ?? null;
}
