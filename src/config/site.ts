export const siteConfig = {
  name: "B&S Veritas",
  legalName: "B&S VERITAS CORRETORA DE SEGUROS LTDA",
  descriptor: "Corretora de Seguros",
  domain: "bsveritas.com.br",
  url: "https://bsveritas.com.br",
  cnpj: "68.711.730/0001-34",
  location: "São Paulo - SP",
  address: {
    locality: "São Paulo",
    region: "SP",
    country: "BR",
  },
  contact: {
    email: "contato@bsveritas.com.br",
    phone: "+55 11 92506-5022",
    phoneHref: "tel:+5511925065022",
    whatsappHref: "https://wa.me/5511925065022",
  },
  description:
    "Soluções em seguros para pessoas, famílias e empresas, com atendimento próximo, transparente e personalizado.",
} as const;

export const mainNavigation = [
  { label: "Início", href: "/#inicio" },
  { label: "Sobre", href: "/sobre" },
  { label: "Seguros", href: "/seguros" },
  { label: "Sinistros", href: "/sinistros" },
  { label: "Contato", href: "/contato" },
] as const;
