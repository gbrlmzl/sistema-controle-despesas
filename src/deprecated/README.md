# Código descontinuado (V1)

Este diretório guarda o fluxo de despesas da **V1**, em que um único usuário cadastrava
`Person` e lançava as despesas de todo mundo. A V2.0 substituiu esse modelo: agora cada
usuário lança as próprias despesas dentro de uma residência.

## Por que está aqui e não em uso

Nenhum arquivo deste diretório é alcançado pela aplicação. A cadeia foi desligada em etapas:

1. A rota `/app/despesas`, que renderizava o `ControleDespesas`, foi removida.
2. As rotas de API que esse fluxo consumia — `/api/persons`, `/api/expenses` e
   `/api/users/me/data` — foram removidas junto com o model `Person`.

Ou seja: **este código não funciona mais**, porque os endpoints que ele chama não existem.
Ele é mantido apenas como referência de como a V1 resolvia cada tela.

## O que ainda pode ser útil aqui

- `utils/compartilharDespesas.js` — a técnica de montar SVG e rasterizar em PNG. Foi
  reescrita de forma mais enxuta em `src/utils/resumoImagem.js`, que é a versão em uso.
- `components/shared/SeletorData.jsx` — o seletor de mês/ano da V1, feito sobre o
  `react-datepicker`. A V2.0 usa o `SeletorCompetencia`, escrito sem dependência externa.
- `hooks/useConsultarDespesas.jsx` — o cálculo de rateio por divisão igual, que virou a
  base da FEAT-029 em `src/lib/reports.js`.

## Pode apagar?

Sim, a qualquer momento. O histórico do git preserva tudo. Este diretório existe só para
facilitar a consulta enquanto a V2.0 amadurece.
