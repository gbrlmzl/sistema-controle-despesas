

export default function Aviso({handleProsseguir}) {
    return (
        <div>
            <h2>Formatar sistema</h2>
            <h3>Atenção: Esta ação irá apagar todos os dados do sistema, incluindo pessoas e despesas cadastradas. Tem certeza que deseja continuar?</h3>
            <button onClick={() => handleProsseguir(true)}>Prosseguir</button>
            <button onClick={() => handleProsseguir(false)}>Cancelar</button>
        </div>
    )
}