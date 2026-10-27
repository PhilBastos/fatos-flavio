# Em contexto: placar dos fatos

Página estática sobre declarações políticas, sem ranking de candidatos.

## Publicação

Destino: `PhilBastos/fatos-flavio`, diretório `comparador/`. A página usa a publicação existente do GitHub Pages. Nenhuma dependência ou compilação é necessária. Abra por um servidor HTTP, pois a base é carregada com `fetch`.

## Arquivos

- `index.html`: estrutura, metodologia e navegação.
- `estilo.css`: identidade off-white, preto e azul, responsiva e com foco visível.
- `app.js`: filtros, fichas e contagens derivadas da base.
- `dados.json`: conteúdo editável, fontes e cronologias.
- `verificar.cjs`: verificação executável com `node verificar.cjs`.

## Adicionar um argumento

1. Adicione as fontes em `sources`, com identificador, título, URL HTTPS, tipo e data de publicação. Declare restrições de acesso e se o documento é uma reprodução.
2. Copie uma ficha em `items` e dê a ela um `id` único. Preencha todos os campos, inclusive contraditório, nível de certeza e retratação específica.
3. Use uma das categorias existentes ou adicione a nova categoria em `categories` e no seletor de `index.html`.
4. Escolha `confirmado`, `fora-de-contexto`, `sem-prova` ou `corrigido`. Uma retratação geral não basta para atribuir `corrigido` a toda fala antiga. A metodologia completa aparece na própria página.
5. Cada evento de `timeline` referencia uma fonte da própria ficha. `quoteSource` identifica a origem da transcrição curta e deve constar de `sources` da ficha.
6. Atualize a data de revisão, rode `node verificar.cjs` e revise o resultado no navegador. O teste contém a contagem de referência desta edição; ao adicionar itens, ajuste os valores esperados de forma deliberada.

Os filtros e as contagens se atualizam a partir dos dados. Para novos autores, atualize também a lista do seletor e a validação de autores em `app.js`. Não há pontuação, submissão pública automática nem serviço externo de análise de visitantes.

## Limites editoriais desta edição, 27/10/2026

Recorte inicial de sete episódios/alegações, não representativo nem exaustivo. A confirmação diz respeito à alegação específica e à ocorrência da fala, não à verdade do que o político afirma. A ausência de registro não permite inferir inocência, culpa ou manutenção atual de uma posição.

A entrevista de 1979 foi consultada em reprodução de terceiros com texto extraído e OCR imperfeito, cruzada com transcrições da Folha e E-farsas. O original da editora não foi autenticado. A ficha dá acesso à reprodução integral e diferencia a ressalva original, a contestação do assessor e as falas posteriores. Não se reproduz a entrevista completa por direitos autorais.

Os registros de Pelotas e Maria do Rosário incluem pedidos de desculpas documentados. A fala de Jair sobre filho homossexual inclui o pedido geral de desculpas de 2018, cujo alcance específico não foi estabelecido. A proposta de Flávio sobre verba pública é apresentada como proposta, com sua ressalva contra proibir o evento, sem atribuição ao pai ou juízo automático de ilegalidade.

Buscas realizadas por nome e episódio com termos de contexto, retratação, desculpas e reafirmação. Fontes e datas consultadas constam de cada ficha. Não houve contato com assessorias nem levantamento de todos os acontecimentos até 2026. Algumas fontes podem exigir assinatura, login ou apresentar bloqueio automatizado. Os links são os dos documentos identificados, não promessas de acesso irrestrito.

## Histórico e correções

O histórico do GitHub registra mudanças. Para propor correção, abra uma issue com alegação exata, autor, data e documento completo. A base não é atualizada automaticamente.

## Organização do placar

Os campos `side` e `partyAtTime` definem o lado de comparação e a filiação histórica. Não são intercambiáveis: por exemplo, as falas de Jair e Flávio em 2016 são do PSC; a de Lula em 1979 antecede a fundação do PT. Os títulos Bolsonaro / PL e Lula / PT são agrupamentos de comparação, não prova de endosso partidário. Cada categoria exibe os dois lados, inclusive quando um lado não tem registro no recorte.

O placar tem quatro linhas expansíveis, uma por estado. Cada linha mostra as contagens dos dois lados, marcadores visuais por registro e as fichas completas ao expandir. As fichas do arquivo abaixo continuam alinhadas por categoria e lado. Todos os números seguem os filtros aplicados.
