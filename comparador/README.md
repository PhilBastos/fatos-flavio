# Em contexto: placar dos fatos

Edição de 27/10/2026. Página estática em `comparador/` de `PhilBastos/fatos-flavio`: 85 registros, 16 questionamentos, 8 temas e 140 fontes.

## Leitura

Oito temas selecionáveis, com Bolsonaro / PL à esquerda e Lula / PT à direita. Falas e sínteses ficam visíveis nas fichas, junto de checagem, retratação e situação processual quando aplicável. “Ler contexto e fontes” abre os detalhes, o contraditório, a certeza e a cronologia.

Democracia e autoritarismo formam um único tema. Há seções próprias para LGBT, mulheres e raça, deficiência e autismo, milícias e violência policial, armas, corrupção e serviços públicos. Serviços públicos compara SUS, educação, transporte, segurança e financiamento. Propostas, atos aprovados e resultados não são tratados como equivalentes.

A régua das falas contém cinco categorias editoriais: sem restrição explícita; ofensa ou estereótipo; defesa de exclusão; autoritarismo ou ruptura; defesa de violência. Cada classificação tem justificativa própria. Não é medida científica de risco, escala legal ou soma por candidato. O marcador destaca a categoria; os intervalos não têm significado quantitativo.

A autoria inclui Jair, Flávio, Eduardo, integrantes de governo, Lula, Dilma e dirigentes partidários, sempre identificados. A defesa de um acusado é distinguida de envolvimento no crime. Corrupção separa investigação, denúncia, condenação, anulação, indulto e controle constitucional. Registros referentes ao mesmo caso usam `caseId`, sem contabilizar novos crimes.

O gráfico de violência e a comparação por governos foram retirados. O tema LGBT contém uma conclusão sobre o crescimento de registros no período e o papel do discurso na desumanização, com fontes do Atlas e da ONU. A aplicação às falas do arquivo é identificada como análise editorial, sem atribuição quantitativa dos casos a uma pessoa.

O tema de armas compara a flexibilização sob Jair com as restrições sob Lula, usando auditoria do TCU, cadastro legislativo, audiência do Senado e reportagens sobre dados do Exército e levantamento do Sou da Paz. Notificações de armas roubadas, furtadas ou extraviadas não são apresentadas como total de armas apreendidas com facções. O dado de 2023 é identificado como pertencente ao governo Lula.

Não há gráfico ou pontuação agregada de gravidade. Os links diretos abrem os detalhes necessários. A contagem não mede gravidade, frequência total ou vitória política.

## Executar e verificar

Sirva esta pasta por HTTP. Não há instalação nem compilação. Abrir diretamente pelo sistema de arquivos pode impedir o carregamento dos dados.

`node verificar.cjs` confere fontes, autoria, estados, cronologias, cobertura dos temas e perguntas, IDs únicos, proteção contra links inseguros e ausência do gráfico. A interface foi verificada no Chrome em computador e larguras de 320, 390 e 768 pixels, incluindo registros expandidos, links diretos e ausência de transbordamento horizontal.

## Editar

- `dados.json`: registros (`items`), fontes (`sources`), questionamentos (`questions`), resumos e agrupamentos (`topics`), análise e dossiê.
- `index.html`: estrutura e metodologia.
- `app.js`: validação e apresentação.
- `estilo.css`: identidade e layout responsivo.
- `verificar.cjs`: verificações com a biblioteca padrão do Node.

Cada registro deve aparecer em exatamente um tema. Cada pergunta também. `topics.summaries` contém dois resumos, na ordem Bolsonaro / PL, Lula / PT. Os números são calculados dos registros atribuídos ao tema, sem pontuação política. As referências entre episódios usam seus IDs e não criam novas contagens.

Cada ficha exige autoria, lado, filiação histórica, categoria, tipo, data, transcrição ou síntese, contexto, checagem, contraditório, certeza, retratação e cronologia com fontes. `quoteSource` precisa estar entre as fontes da ficha. Um ato institucional pode usar `Não se aplica` no campo de retratação.

Os estados são `confirmado`, `fora-de-contexto`, `sem-prova` e `corrigido`. Corrigido exige correção específica documentada; a ficha distingue retratação espontânea de determinação judicial. Confirmado descreve a ocorrência, não a veracidade do que um político afirmou.

As categorias seguem os temas de leitura. A validação impede perda ou duplicação de registros ao reorganizar temas. Para novos autores, atualize `ACTORS` em `app.js`. Falas literais exigem `rightsAssessment` com `level` inteiro de 0 a 4 e `reason`. Processos judiciais exigem `legalStatus`. Propostas podem informar `policyArea` e `sourcePages`. Ao ampliar o acervo, atualize os totais deliberadamente nos testes.

A série estatística anterior permanece no arquivo de dados como memória da pesquisa e não é exibida. Não se misturam orientação sexual com identidade de gênero, notificações com mortes ou bases com denominadores distintos.

## Fontes e limites

As fontes incluem documentos parlamentares, decisões, notícias institucionais, pesquisas, relatórios e jornalismo. Não houve contato direto com assessorias. Os questionamentos foram parafraseados e anonimizados.

As fontes novas foram consultadas durante esta revisão. Não houve nova varredura automática integral de todos os links históricos. Alguns veículos exigem assinatura ou login. Resposta HTTP não autentica um documento e bloqueio automatizado não demonstra inexistência do endereço.

A reprodução integral da entrevista de 1979 tem OCR imperfeito e não foi autenticada junto à editora. O vídeo de Flávio no restaurante foi localizado em reprodução jornalística, sem entrevista integral datada; a ficha mantém certeza média e não o apresenta como proposta de proibir a entrada de homossexuais.

A denúncia das rachadinhas foi rejeitada após anulações. A acusação histórica não é tratada como condenação ou prova válida de culpa. Nomeações, homenagens e falas oficiais têm documentação independente. Os vínculos não são apresentados como condenação de Flávio por integrar milícia.

A leitura de fascismo é atribuída a pesquisas e tem critérios e limites. Não pressupõe consenso universal e não transfere atos de Jair a Flávio.

O Atlas 2026, tabela 7.1, registra notificações de violência interpessoal contra homossexuais e bissexuais, com dados preliminares de 2023/2024. Não mede todos os casos LGBT nem isola motivação do agressor. A ONU sustenta a relação geral entre discurso de ódio, desumanização, discriminação e violência; isso não constitui estudo causal de cada fala brasileira.

As tabelas 25 e 26 da auditoria do TCU incluem certificados com estados diferentes; a contagem do Anuário 2023 usa certificados ativos. As fichas explicitam essa diferença. O monitoramento do TCU de outubro de 2026 documenta pendências também sob Lula. Não há estimativa confiável do total de armas do crime atribuível à flexibilização.

O programa eleitoral de Flávio e a apuração jornalística sobre estudos de corte são confrontados com a negativa pública da campanha e a decisão eleitoral sobre uma postagem do PT. Não se presume corte setorial confirmado nem execução futura de promessas de qualquer candidato.

O GitHub Pages existente publica esta pasta. Não há coleta de visitantes, backend, submissão automática ou atualização automática das fontes.
