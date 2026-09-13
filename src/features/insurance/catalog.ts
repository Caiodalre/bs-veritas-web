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
  practicalQuestions: readonly string[];
  faqs: readonly {
    question: string;
    answer: string;
  }[];
  referenceUrl: string;
  whatsappMessage: string;
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
    practicalQuestions: [
      "Como o veículo é usado e quem costuma conduzi-lo?",
      "Você busca proteção para o próprio veículo, para terceiros ou para ambos?",
      "Quais franquias, assistências e limites fazem sentido para sua rotina?",
    ],
    faqs: [
      {
        question: "Todo dano ao veículo está coberto?",
        answer:
          "Não. A proteção depende das coberturas contratadas, dos limites e das exclusões descritas na proposta e nas condições contratuais.",
      },
      {
        question: "A franquia é sempre igual?",
        answer:
          "Não. Valores e formas de aplicação podem variar por cobertura, produto e seguradora. Esses pontos devem ser comparados na documentação da proposta.",
      },
      {
        question: "Assistências e cobertura de vidros são automáticas?",
        answer:
          "Não necessariamente. Serviços, peças atendidas, limites e regras de uso variam conforme o plano escolhido.",
      },
    ],
    referenceUrl:
      "https://www.gov.br/susep/pt-br/assuntos/meu-futuro-seguro/seguros-previdencia-e-capitalizacao/seguros/seguro-de-automoveis",
    whatsappMessage: "Olá! Gostaria de receber orientação para uma cotação de Seguro Auto.",
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
    practicalQuestions: [
      "O imóvel é casa ou apartamento, habitual, alugado ou de temporada?",
      "A proteção deve considerar apenas a edificação ou também o conteúdo?",
      "Quais riscos e serviços de assistência são mais relevantes para o imóvel?",
    ],
    faqs: [
      {
        question: "Os bens dentro da residência ficam sempre cobertos?",
        answer:
          "Não. A cobertura do conteúdo, os bens aceitos e os limites dependem do produto e do que estiver indicado na apólice.",
      },
      {
        question: "Seguro residencial e seguro do condomínio são a mesma coisa?",
        answer:
          "Não. O residencial protege a unidade e, quando contratado, seu conteúdo; o seguro condominial trata a edificação e as áreas comuns conforme suas condições.",
      },
      {
        question: "Danos elétricos, roubo e vendaval estão sempre incluídos?",
        answer:
          "Essas coberturas podem ser oferecidas, mas precisam constar da contratação. Limites, franquias e exclusões variam.",
      },
    ],
    referenceUrl:
      "https://www.gov.br/susep/pt-br/assuntos/meu-futuro-seguro/seguros-previdencia-e-capitalizacao/seguros/seguro-residencial",
    whatsappMessage: "Olá! Gostaria de receber orientação para uma cotação de Seguro Residencial.",
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
    practicalQuestions: [
      "Qual é a atividade da empresa e como o imóvel é utilizado?",
      "Quais instalações, estoques e equipamentos são essenciais à operação?",
      "Há responsabilidades perante clientes, vizinhos ou prestadores que precisam ser avaliadas?",
    ],
    faqs: [
      {
        question: "Uma mesma apólice serve para qualquer empresa?",
        answer:
          "Não. Atividade, localização, estrutura, valores expostos e critérios de aceitação influenciam as opções disponíveis.",
      },
      {
        question: "Interrupção da operação está automaticamente coberta?",
        answer:
          "Não necessariamente. Proteções relacionadas à paralisação ou perda de receita dependem de cobertura específica e de suas condições.",
      },
      {
        question: "Danos a terceiros estão sempre incluídos?",
        answer:
          "Não. Responsabilidade civil é uma cobertura que precisa ser analisada e contratada com limites adequados ao negócio.",
      },
    ],
    referenceUrl:
      "https://www.gov.br/susep/pt-br/copy_of_planos-e-produtos/seguros/seguro-compreensivo",
    whatsappMessage: "Olá! Gostaria de receber orientação para uma cotação de Seguro Empresarial.",
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
    practicalQuestions: [
      "Quem depende financeiramente de você e por quanto tempo?",
      "Quais compromissos financeiros devem ser considerados no capital segurado?",
      "Quais eventos, carências e critérios de elegibilidade precisam ser comparados?",
    ],
    faqs: [
      {
        question: "Seguro de vida cobre somente falecimento?",
        answer:
          "Não necessariamente. Produtos podem oferecer coberturas para outros eventos, como invalidez ou doenças, conforme as condições contratadas.",
      },
      {
        question: "A declaração pessoal de saúde é importante?",
        answer:
          "Sim. Quando solicitada, deve ser respondida de forma correta e completa. O conteúdo e os critérios variam conforme a proposta.",
      },
      {
        question: "Capitais, carências e exclusões são iguais entre seguradoras?",
        answer:
          "Não. Esses elementos fazem parte da comparação e devem ser conferidos na proposta, no certificado e nas condições contratuais.",
      },
    ],
    referenceUrl:
      "https://www.gov.br/susep/pt-br/assuntos/meu-futuro-seguro/seguros-previdencia-e-capitalizacao/seguros/seguro-de-vida-e-acidentes-pessoais",
    whatsappMessage: "Olá! Gostaria de receber orientação para uma cotação de Seguro de Vida.",
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
    practicalQuestions: [
      "Qual é o destino, o período e o objetivo da viagem?",
      "Quem vai viajar e há atividades ou necessidades que exigem atenção?",
      "Quais limites de despesas médicas e demais assistências serão necessários?",
    ],
    faqs: [
      {
        question: "Bagagem e cancelamento estão sempre cobertos?",
        answer:
          "Não. Essas proteções dependem do plano contratado, dos eventos previstos e dos limites indicados nas condições.",
      },
      {
        question: "O seguro internacional inclui despesas médicas?",
        answer:
          "Segundo a SUSEP, o seguro viagem internacional deve oferecer ao menos cobertura de despesas médicas, hospitalares e odontológicas em viagem, observadas as condições do plano.",
      },
      {
        question: "É importante levar os canais da assistência?",
        answer:
          "Sim. Antes do embarque, confira certificado, vigência, contatos e procedimento de acionamento da assistência.",
      },
    ],
    referenceUrl:
      "https://www.gov.br/susep/pt-br/assuntos/meu-futuro-seguro/seguros-previdencia-e-capitalizacao/seguros/seguro-viagem",
    whatsappMessage: "Olá! Gostaria de receber orientação para uma cotação de Seguro Viagem.",
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
    practicalQuestions: [
      "Qual bem, atividade, responsabilidade ou pessoa precisa de proteção?",
      "Que tipo de impacto você pretende reduzir ou evitar?",
      "Já existe alguma apólice ou exigência contratual relacionada a essa necessidade?",
    ],
    faqs: [
      {
        question: "Como descobrir qual modalidade procurar?",
        answer:
          "Comece descrevendo o que precisa ser protegido e o risco que preocupa. A partir disso, a corretora pode identificar categorias possíveis para análise.",
      },
      {
        question: "Toda necessidade possui um produto disponível?",
        answer:
          "Não. A disponibilidade depende do mercado, das regras de aceitação e das condições oferecidas por cada seguradora.",
      },
      {
        question: "O preço é suficiente para comparar propostas?",
        answer:
          "Não. A SUSEP orienta comparar propostas com coberturas e capitais equivalentes, além de conferir franquias, carências e exclusões.",
      },
    ],
    referenceUrl:
      "https://www.gov.br/susep/pt-br/assuntos/meu-futuro-seguro/seguros-previdencia-e-capitalizacao/seguros/informacoes-importantes",
    whatsappMessage: "Olá! Gostaria de orientação sobre uma necessidade específica de seguro.",
  },
] as const satisfies readonly InsuranceSolution[];

export type InsuranceSlug = (typeof insuranceCatalog)[number]["slug"];

export function getInsuranceBySlug(slug: string) {
  return insuranceCatalog.find((insurance) => insurance.slug === slug);
}
