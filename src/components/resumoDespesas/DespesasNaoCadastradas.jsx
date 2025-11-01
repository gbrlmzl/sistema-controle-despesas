export default function DespesasNaoCadastradas({ onRetornaAoMenu, onRetornaSelecao, mesAnoTexto }) {
    return (
        <div>
            <h2>Não existem despesas cadastradas para {mesAnoTexto}.</h2>
            <button onClick={onRetornaSelecao}>Retornar</button>
            <button onClick={onRetornaAoMenu}>Menu</button>
        </div>
    )
}