# Em contexto: placar dos fatos

Edição ampliada de 27/10/2026: 31 registros, 12 perguntas examinadas e 64 fontes identificadas. Página estática publicada no diretório `comparador/` de `PhilBastos/fatos-flavio`.

## O que mudou

- Placar expansível com Bolsonaro / PL à esquerda e Lula / PT à direita.
- Filtros por categoria, autor, estado da evidência e tipo de ocorrência.
- Dossiê dos vínculos políticos e de gabinete de Flávio com Adriano da Nóbrega e sua família, com a defesa pública das milícias em transcrição oficial da Alerj.
- Análise identificada como interpretação política sobre traços fascistas no bolsonarismo, com critérios, episódios e referências acadêmicas.
- Série de notificações de violência de uma única edição revisada do Atlas 2026, com escolha de período e escala comum. Mortes violentas e taxas de homicídio são indicadores separados.
- Perguntas sobre Lula, STF, redes, benefícios, política externa, direitos e segurança, com conclusão e limite da evidência.
- Críticas às falas de Lula acompanhadas de contexto e retratações encontradas, sem equivalência automática com vínculos, políticas ou processos judiciais.

## Executar e verificar

Não há instalação ou compilação. Sirva esta pasta por HTTP; abrir `index.html` diretamente pelo sistema de arquivos impede o carregamento dos dados em alguns navegadores.

Rode `node verificar.cjs` para conferir a base, filtros, fontes referenciadas, autoria, estados, cronologias, indicadores e limites judiciais. O teste contém os totais esperados desta edição; ao alterar o acervo, atualize essas expectativas deliberadamente.

## Arquivos

- `dados.json`: registros, fontes, perguntas, série estatística e análise editorial.
- `index.html`: estrutura e metodologia.
- `app.js`: validação, filtros, contagens e apresentação.
- `estilo.css`: layout responsivo, foco visível e identidade visual.
- `verificar.cjs`: verificações com a biblioteca padrão do Node.

## Atualizar a base

Cada registro precisa de identificador único, autor, lado, filiação histórica, categoria, tipo de ocorrência, data, transcrição ou síntese identificada, contexto, checagem, contraditório, certeza, retratação e cronologia com fontes. `quoteSource` precisa constar das fontes da ficha.

Os quatro estados são `confirmado`, `fora-de-contexto`, `sem-prova` e `corrigido`. Corrigido exige correção ou retirada específica documentada. Remoção judicial de conteúdo não equivale a pedido espontâneo de desculpas. Atos e decisões podem usar `Não se aplica` no campo de retratação.

Os tipos são `Declaração`, `Ato institucional`, `Vínculo político e de gabinete` e `Processo judicial`. O tipo do registro é essencial: as contagens não medem gravidade nem indicam vencedor.

`side` não é filiação histórica. Por exemplo, Jair e Flávio estavam no PSC em alguns episódios de 2016 e no PP em outros períodos. A entrevista de Lula de 1979 precede a fundação do PT. Os lados são agrupamentos editoriais de comparação, não prova de endosso partidário.

Categorias são carregadas dos dados. Para adicionar autores, atualize também a lista do seletor e a validação em `app.js`. As perguntas e análises referenciam episódios por ID e não criam novas ocorrências na contagem.

## Fontes e limites

As pesquisas usaram documentos parlamentares, decisões e notícias institucionais, estudos acadêmicos, relatórios estatísticos e jornalismo identificado. As respostas dos citados são as publicadas nessas fontes. Não houve contato direto com assessorias.

Uma checagem de acesso em 27/10/2026 obteve resposta em 49 dos 64 links; 15 apresentaram bloqueio automatizado ou falha de conexão naquele teste. O navegador de pesquisa recuperou textos e referências de várias dessas páginas. Resposta HTTP não autentica documentos nem substitui leitura; bloqueio automatizado não prova que um endereço deixou de existir. Alguns veículos exigem assinatura ou login.

A reprodução integral da entrevista de 1979 tem OCR imperfeito e não foi autenticada junto à editora. O vídeo antigo de Flávio sobre um casal em restaurante foi localizado em reprodução jornalística, sem a entrevista integral ou data original; a ficha tem certeza média e não o apresenta como proposta de barrar a entrada de homossexuais.

A denúncia das rachadinhas e a decisão de rejeitá-la são tratadas em conjunto. A reprodução da denúncia de 2020 é identificada como documento histórico de acusação, não condenação nem prova judicial válida de culpa. As nomeações, homenagens e falas oficiais têm documentação independente. O dossiê não afirma que Flávio foi condenado por integrar milícia.

A leitura de fascismo é atribuída a pesquisas e acompanhada de critérios e limitações. Ela não é uma sentença criminal, não pressupõe consenso de todos os estudiosos e não transfere automaticamente os atos de Jair para Flávio.

O gráfico usa a tabela 7.1 do Atlas da Violência 2026, página 95, com a interpretação da página 96. Os dados de 2023/2024 são preliminares e foram coletados em março de 2026. Não se misturam edições anteriores, orientação sexual com identidade de gênero ou notificações com mortes. O indicador não isola motivação LGBTfóbica ou causalidade presidencial.

As perguntas recebidas foram parafraseadas para exame público. Não se publicam os prints, o nome ou o perfil do remetente. Generalizações sem processo ou ato identificado são explicadas como não demonstradas pelo material disponível, não como prova de que todos os casos possíveis foram investigados.

## Publicação e histórico

O GitHub Pages existente publica esta pasta. As alterações ficam no histórico do repositório. Não há backend, coleta de visitantes, submissão automática ou atualização automática da pesquisa.
