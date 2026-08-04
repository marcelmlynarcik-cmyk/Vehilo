export const legalOperator = {
  name: "Marcel Mlynarčík",
  location: "Nezamyslice, Česká republika",
  email: "marcel.mlynarcik@gmail.com",
  serviceName: "Vehilo",
  minimumAge: 15,
  effectiveDate: "4. srpna 2026",
};

export const legalLinks = [
  { href: "/ochrana-osobnich-udaju", label: "Ochrana osobních údajů" },
  { href: "/podminky-pouzivani", label: "Podmínky používání" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export function legalMailto(subject: string) {
  return `mailto:${legalOperator.email}?subject=${encodeURIComponent(subject)}`;
}
