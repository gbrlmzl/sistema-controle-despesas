import Loading from "../ui/Loading";
export default function ConfirmaDespesa({ listaResumoDespesas, onConfirmar, onCancelar, onRetornaAoMenu, loading}) {
    const handleConfirma = () => {
        onConfirmar();
    }
    const handleCancela = () => {
        onCancelar();
    }

    const handleRetornaAoMenu = () => {
        onRetornaAoMenu();
    }


    if (loading) { //Se estiver carregando, mostra a animação de loading
        return (
            <div>
                <Loading />
            </div>
        )
    }


    return (
        <div>
            <h2>Resumo</h2>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1vh" }}> {/* Mudar isso aqui no CSS depois */}
                {listaResumoDespesas().map((resumo, index) => (
                    <div key={index}>
                        <h4>{resumo.nomeResponsavel}</h4>
                        <p>Total: {resumo.somaDespesas} R$, {resumo.quantDespesas} despesas</p>
                    </div>
                ))}
            </div>
            <div>
                <button onClick={handleConfirma} disabled={loading}>Confirmar</button>
                <button onClick={handleCancela}>Cancelar</button>
            </div>

        </div>
    )
}