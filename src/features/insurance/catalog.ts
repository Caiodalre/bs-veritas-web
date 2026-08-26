export type InsuranceIconName = "building" | "car" | "heart" | "house" | "plane" | "shield";

export type InsuranceSolution = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  introduction: string;
  icon: InsuranceIconName;
  audiences: readonly string[];
  analysisPoints: readonly string[];
};

export const insuranceCatalog = [
  {
    slug: "auto",
    name: "Seguro Auto",
    shortName: "Auto",
    description: "Proteção para seu veículo com opções de cobertura, assistência e benefícios.",
    introduction:
      "A análise considera o veículo, a forma de uso e as prioridades de quem dirige para comparar alternativas compatíveis com cada contexto.",
    icon: "car",
    audiences: [
      "Quem utiliza o veículo no dia a dia",
      "Famílias que dependem do automóvel",
      "Profissionais que usam o veículo para trabalhar",
    ],
    analysisPoints: [
      "Perfil de uso e características do veículo",
      "Coberturas e limites previstos na proposta",
      "Franquias, assistências e condições de atendimento",
      "Exclusões e responsabilidades do segurado",
    ],
  },
  {
    slug: "residencial",
    name: "Seguro Residencial",
    shortName: "Residencial",
    description: "Segurança para sua casa, seu patrimônio e a tranquilidade da sua família.",
    introduction:
      "A proteção residencial pode reunir coberturas patrimoniais e serviços de assistência, sempre de acordo com as condições da opção contratada.",
    icon: "house",
    audiences: [
      "Proprietários de imóveis de uso habitual ou temporada",
      "Inquilinos que desejam proteger seus bens",
      "Famílias que valorizam assistência para imprevistos domésticos",
    ],
    analysisPoints: [
      "Características, uso e localização do imóvel",
      "Bens e situações que precisam de proteção",
      "Limites, franquias e assistências disponíveis",
      "Condições, riscos excluídos e responsabilidades",
    ],
  },
  {
    slug: "empresarial",
    name: "Seguro Empresarial",
    shortName: "Empresarial",
    description: "Proteção para instalações, equipamentos e a continuidade do seu negócio.",
    introduction:
      "Cada empresa possui atividades, instalações e exposições diferentes. A avaliação começa pelo entendimento da operação antes da comparação das opções.",
    icon: "building",
    audiences: [
      "Comércios e prestadores de serviços",
      "Escritórios, clínicas e pequenas empresas",
      "Negócios que dependem de instalações e equipamentos",
    ],
    analysisPoints: [
      "Atividade, estrutura e localização da empresa",
      "Bens, equipamentos e responsabilidades relevantes",
      "Limites, franquias e proteções compatíveis",
      "Exigências, exclusões e continuidade operacional",
    ],
  },
  {
    slug: "vida",
    name: "Seguro de Vida",
    shortName: "Vida",
    description: "Soluções voltadas à proteção financeira e ao planejamento familiar.",
    introduction:
      "A conversa considera responsabilidades financeiras e objetivos de proteção para orientar uma escolha compreensível e adequada ao momento de vida.",
    icon: "heart",
    audiences: [
      "Pessoas com dependentes financeiros",
      "Famílias em fase de construção de patrimônio",
      "Profissionais que buscam planejamento de proteção",
    ],
    analysisPoints: [
      "Objetivos e responsabilidades financeiras",
      "Coberturas, capitais e beneficiários indicados",
      "Prazos, carências e critérios de elegibilidade",
      "Exclusões e informações exigidas na proposta",
    ],
  },
  {
    slug: "viagem",
    name: "Seguro Viagem",
    shortName: "Viagem",
    description: "Proteção e assistência para viagens nacionais e internacionais.",
    introduction:
      "Destino, duração e perfil da viagem ajudam a definir quais assistências e limites devem ser considerados antes do embarque.",
    icon: "plane",
    audiences: [
      "Viajantes a lazer ou a trabalho",
      "Famílias em viagens nacionais ou internacionais",
      "Pessoas com roteiros que exigem condições específicas",
    ],
    analysisPoints: [
      "Destino, duração e finalidade da viagem",
      "Assistências e limites previstos no plano",
      "Requisitos do destino e perfil dos viajantes",
      "Exclusões, procedimentos e canais de atendimento",
    ],
  },
  {
    slug: "outras-solucoes",
    name: "Outras Soluções",
    shortName: "Outras soluções",
    description: "Atendimento consultivo para diferentes necessidades de proteção.",
    introduction:
      "Quando a necessidade não se encaixa nas modalidades principais, o atendimento ajuda a organizar o contexto e identificar caminhos possíveis no mercado.",
    icon: "shield",
    audiences: [
      "Pessoas com necessidades específicas de proteção",
      "Profissionais e empresas com riscos particulares",
      "Clientes que precisam entender qual modalidade procurar",
    ],
    analysisPoints: [
      "Natureza do bem, atividade ou responsabilidade",
      "Prioridades e limites desejados",
      "Disponibilidade e condições das opções de mercado",
      "Documentação e critérios exigidos na proposta",
    ],
  },
] as const satisfies readonly InsuranceSolution[];

export type InsuranceSlug = (typeof insuranceCatalog)[number]["slug"];

export function getInsuranceBySlug(slug: string) {
  return insuranceCatalog.find((insurance) => insurance.slug === slug);
}
