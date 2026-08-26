export const siteConfig = {
  name: "B&S Veritas",
  legalName: "B&S VERITAS CORRETORA DE SEGUROS LTDA",
  descriptor: "Corretora de Seguros",
  domain: "bsveritas.com.br",
  url: "https://bsveritas.com.br",
  description:
    "Soluções em seguros para pessoas, famílias e empresas, com atendimento próximo, transparente e personalizado.",
} as const;

export const mainNavigation = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Seguros", href: "#seguros" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Seguradoras", href: "#seguradoras" },
] as const;

export const insuranceSolutions = [
  {
    name: "Seguro Auto",
    description: "Proteção para seu veículo com opções de cobertura, assistência e benefícios.",
    icon: "car",
  },
  {
    name: "Seguro Residencial",
    description: "Segurança para sua casa, seu patrimônio e a tranquilidade da sua família.",
    icon: "house",
  },
  {
    name: "Seguro Empresarial",
    description: "Proteção para instalações, equipamentos e a continuidade do seu negócio.",
    icon: "building",
  },
  {
    name: "Seguro de Vida",
    description: "Soluções voltadas à proteção financeira e ao planejamento familiar.",
    icon: "heart",
  },
  {
    name: "Seguro Viagem",
    description: "Proteção e assistência para viagens nacionais e internacionais.",
    icon: "plane",
  },
  {
    name: "Outras Soluções",
    description: "Atendimento consultivo para diferentes necessidades de proteção.",
    icon: "shield",
  },
] as const;

export type InsuranceIcon = (typeof insuranceSolutions)[number]["icon"];
