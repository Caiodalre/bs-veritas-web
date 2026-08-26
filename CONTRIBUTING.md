# Contribuindo com o B&S Veritas Web

Este projeto prioriza segurança, clareza e mudanças pequenas que possam ser verificadas antes de avançar.

Leia também:

- [`AGENTS.md`](./AGENTS.md): regras obrigatórias do repositório;
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): arquitetura e limites do V1;
- [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md): preparação e ambientes;
- [`docs/SECURITY.md`](./docs/SECURITY.md): controles de segurança;
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md): publicação e rollback planejados.

## Princípio de trabalho

Cada alteração deve ter um objetivo claro, escopo limitado e forma objetiva de validação.

Evite combinar na mesma mudança:

- refatoração ampla e funcionalidade nova;
- atualização de dependências e alteração visual sem relação;
- migration de banco e limpeza de código não relacionada;
- documentação de uma decisão ainda não aprovada como se ela estivesse concluída.

## Preparação

Use as versões indicadas em [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) e instale as dependências com pnpm:

```powershell
pnpm install --frozen-lockfile
```

Confirme que o repositório está no estado esperado antes de editar:

```powershell
git status --short --branch
```

Mudanças existentes podem pertencer a outra pessoa. Não as descarte, sobrescreva ou inclua em um commit sem entender sua origem.

## Branches

A `main` representa a linha integrada e não deverá receber trabalho experimental diretamente.

Use branches curtas e descritivas, por exemplo:

```text
codex/documentation
codex/design-system
feature/quote-form
fix/mobile-navigation
```

Regras:

- criar a branch a partir da revisão aprovada;
- manter um único objetivo principal por branch;
- não fazer push direto na `main`;
- revisar o diff completo antes da integração;
- preservar o histórico existente;
- não reescrever histórico compartilhado sem autorização explícita.

## Commits

Use mensagens curtas no imperativo, com um tipo que descreva a mudança:

```text
docs: document deployment process
feat: add insurance navigation
fix: validate quote phone number
test: cover quote submission failure
chore: configure project tooling
```

Tipos usuais:

- `feat`: funcionalidade nova;
- `fix`: correção;
- `docs`: documentação;
- `test`: testes;
- `refactor`: reorganização sem mudança intencional de comportamento;
- `chore`: manutenção de ferramentas ou configuração.

Um commit deve conter somente arquivos relacionados à sua mensagem.

## TypeScript e React

- manter TypeScript em modo estrito;
- não usar `any` para contornar erros de tipo;
- preferir tipos derivados de schemas ou fontes centrais;
- usar Server Components por padrão;
- adicionar `"use client"` somente quando houver necessidade de estado, efeitos ou APIs do navegador;
- não executar lógica de negócio em componentes visuais;
- não expor segredos ou acesso ao banco no código do cliente;
- manter componentes pequenos, nomeados e com responsabilidade clara.

## Organização do código

Respeite o fluxo arquitetural:

```text
Interface
   -> Action ou Route Handler
      -> Validação e segurança
         -> Serviço
            -> Repositório
               -> Banco
```

Novas pastas só devem ser criadas quando houver código real. Não adicione diretórios vazios para simular uma arquitetura futura.

Configurações institucionais, como navegação, contatos e modalidades de seguro, deverão possuir uma fonte central quando forem implementadas.

## Interface e identidade visual

- reutilizar componentes antes de criar variações locais;
- centralizar cores, tipografia, espaçamentos e estados em tokens;
- não espalhar valores de marca arbitrários pelo código;
- manter o visual aprovado: azul-marinho, verde-água e superfícies claras;
- preservar boa leitura em dispositivos móveis;
- evitar animações que prejudiquem desempenho ou acessibilidade;
- usar ícones de uma única biblioteca aprovada;
- não adicionar uma biblioteca visual pesada sem necessidade demonstrada.

## Acessibilidade

Toda interface nova deverá considerar:

- HTML semântico;
- navegação por teclado;
- foco visível;
- labels associados aos campos;
- mensagens de erro identificáveis;
- contraste adequado;
- textos alternativos úteis;
- respeito a preferências de redução de movimento;
- áreas de toque adequadas no mobile.

Não substitua um elemento HTML nativo por uma construção customizada sem justificar o ganho e preservar o comportamento acessível.

## Formulários e dados externos

- validar no cliente apenas para experiência;
- repetir a validação no servidor;
- aceitar somente campos declarados pelo schema;
- limitar tamanho de textos;
- normalizar dados antes de persistir;
- impedir envio duplicado acidental;
- não exibir erros internos ao visitante;
- não colocar dados pessoais em URLs, logs ou analytics;
- não pedir dados sensíveis no contato inicial.

Os controles de honeypot, rate limiting e Turnstile deverão ser adicionados quando os formulários públicos forem implementados.

## Banco de dados

- acessar PostgreSQL somente pelo backend;
- concentrar persistência em repositórios;
- alterar o schema em uma mudança explícita e revisável;
- gerar migrations somente após aprovação da alteração;
- revisar o SQL gerado;
- testar migrations fora da produção;
- nunca conectar testes locais ao banco de produção;
- nunca inserir credenciais no repositório.

Não execute `pnpm db:generate` quando não houver uma alteração de schema aprovada.

## Dependências

Antes de instalar uma dependência:

1. confirme que a plataforma ou o projeto não resolvem o problema sem pacote adicional;
2. avalie manutenção, licença, tamanho, segurança e compatibilidade;
3. explique a necessidade na mudança;
4. use pnpm;
5. revise `package.json` e `pnpm-lock.yaml`;
6. revise qualquer solicitação de script de instalação;
7. execute as verificações proporcionais ao impacto.

Não atualize todas as dependências incidentalmente durante outra tarefa.

## Testes

Escolha verificações de acordo com a mudança:

| Tipo de alteração | Verificação mínima |
| --- | --- |
| documentação | revisão do diff e formatação |
| componente visual | lint, teste de componente e revisão responsiva |
| lógica de domínio | lint, testes unitários e build |
| fluxo de formulário | lint, unitários, integração, E2E e build |
| dependência ou configuração | lint, testes afetados e build |
| schema ou migration | revisão do SQL, teste isolado, suíte afetada e build |

Antes de integrar uma alteração funcional, a referência completa é:

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Um teste não deve depender de internet, horário instável ou dados reais sem justificativa e isolamento explícitos.

## Segurança e privacidade

- use apenas dados claramente fictícios em desenvolvimento e testes;
- não registre conteúdo de formulários;
- não exponha detalhes de exceções ao visitante;
- não adicione origem à Content Security Policy sem necessidade real;
- não desative uma proteção para contornar um teste;
- informe imediatamente se um segredo aparecer no diff ou histórico;
- trate mudanças em autenticação, banco, formulários e headers como alterações de maior risco.

Consulte o checklist completo em [`docs/SECURITY.md`](./docs/SECURITY.md).

## Documentação

Atualize a documentação quando uma mudança alterar:

- arquitetura;
- comandos;
- variáveis de ambiente;
- dependências relevantes;
- fluxo de deploy;
- dados coletados;
- controles de segurança;
- escopo ou decisão de produto.

Uma decisão planejada deve ser identificada como planejada. Somente marque um controle como ativo após validação verificável.

## Revisão antes da integração

- [ ] objetivo da mudança está claro;
- [ ] diff contém somente arquivos relacionados;
- [ ] nenhum segredo ou dado real foi incluído;
- [ ] tipos e validações estão adequados;
- [ ] interface funciona em mobile e por teclado, quando aplicável;
- [ ] testes relevantes foram adicionados ou atualizados;
- [ ] comandos de verificação passaram;
- [ ] migrations foram revisadas, quando aplicável;
- [ ] documentação foi atualizada;
- [ ] riscos e pendências estão explícitos;
- [ ] nenhuma alteração foi feita diretamente em produção.

Uma mudança incompleta deve permanecer na branch até que os critérios correspondentes sejam atendidos.
