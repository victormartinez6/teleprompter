export interface Template {
  id: string;
  title: string;
  category: string;
  content: string;
  description: string;
}

export const TEMPLATE_CATEGORIES = {
  NEWS: 'Notícias',
  PRESENTATION: 'Apresentação',
  SPEECH: 'Discurso',
  TUTORIAL: 'Tutorial',
  MARKETING: 'Marketing'
} as const;

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'news-intro',
    title: 'Abertura de Noticiário',
    category: TEMPLATE_CATEGORIES.NEWS,
    description: 'Template para abertura de telejornal ou podcast de notícias',
    content: `Boa noite, eu sou [SEU NOME] e você está assistindo ao [NOME DO PROGRAMA].

Hoje, [DATA], trazemos as principais notícias do dia:

• [PRIMEIRA NOTÍCIA]
• [SEGUNDA NOTÍCIA]  
• [TERCEIRA NOTÍCIA]

Vamos começar com nossa primeira matéria...`
  },
  {
    id: 'presentation-intro',
    title: 'Introdução de Apresentação',
    category: TEMPLATE_CATEGORIES.PRESENTATION,
    description: 'Template para início de apresentações corporativas',
    content: `Bom dia a todos!

Meu nome é [SEU NOME] e hoje vou apresentar sobre [TÓPICO DA APRESENTAÇÃO].

Durante os próximos [TEMPO] minutos, vamos abordar:

1. [PRIMEIRO PONTO]
2. [SEGUNDO PONTO]
3. [TERCEIRO PONTO]

Ao final, teremos um tempo para perguntas e discussões.

Vamos começar...`
  },
  {
    id: 'speech-welcome',
    title: 'Discurso de Boas-vindas',
    category: TEMPLATE_CATEGORIES.SPEECH,
    description: 'Template para discursos de abertura de eventos',
    content: `Senhoras e senhores, boa [PERÍODO DO DIA]!

É com grande prazer que dou as boas-vindas a todos vocês ao [NOME DO EVENTO].

Hoje é um dia especial porque [MOTIVO DO EVENTO].

Gostaria de agradecer especialmente:
• [PESSOA/ORGANIZAÇÃO 1]
• [PESSOA/ORGANIZAÇÃO 2]
• [PESSOA/ORGANIZAÇÃO 3]

Sem mais delongas, vamos dar início às nossas atividades...`
  },
  {
    id: 'tutorial-intro',
    title: 'Introdução de Tutorial',
    category: TEMPLATE_CATEGORIES.TUTORIAL,
    description: 'Template para vídeos educativos e tutoriais',
    content: `Olá pessoal, tudo bem?

Eu sou [SEU NOME] e no vídeo de hoje vou ensinar vocês como [TÓPICO DO TUTORIAL].

Este tutorial é perfeito para quem:
• [PÚBLICO ALVO 1]
• [PÚBLICO ALVO 2]
• [PÚBLICO ALVO 3]

Vamos precisar de:
• [MATERIAL 1]
• [MATERIAL 2]
• [MATERIAL 3]

Então vamos começar!`
  },
  {
    id: 'marketing-pitch',
    title: 'Pitch de Vendas',
    category: TEMPLATE_CATEGORIES.MARKETING,
    description: 'Template para apresentações comerciais e vendas',
    content: `Você já se perguntou como [PROBLEMA QUE O PRODUTO RESOLVE]?

Apresento a vocês [NOME DO PRODUTO/SERVIÇO]!

Nossa solução oferece:
✓ [BENEFÍCIO 1]
✓ [BENEFÍCIO 2]
✓ [BENEFÍCIO 3]

Mais de [NÚMERO] clientes já confiam em nós, incluindo:
• [CLIENTE 1]
• [CLIENTE 2]
• [CLIENTE 3]

Entre em contato conosco e descubra como podemos ajudar você também!`
  }
];

export const getTemplatesByCategory = (category: string): Template[] => {
  return DEFAULT_TEMPLATES.filter(template => template.category === category);
};

export const getAllCategories = (): string[] => {
  return Object.values(TEMPLATE_CATEGORIES);
};
