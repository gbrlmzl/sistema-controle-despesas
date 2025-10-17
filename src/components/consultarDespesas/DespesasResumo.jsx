

export default function DespesasResumo({ despesasMesAnoSelecionado, listaPessoas, retornarSelecao, mesAnoTexto, mostrarDespesasPessoa, calcularResumoDespesas, onProximoMes, onAnteriorMes }) {

    



    const existemDespesasCadastradas = despesasMesAnoSelecionado.length > 0;
    const calcularTotalGasto = () => {
        if (!existemDespesasCadastradas){
            return "-";
        } else {
            return calcularResumoDespesas().reduce((acc, pessoa) => acc + pessoa.totalGasto, 0).toFixed(2);
        }
    }


    return (
        <div style={{"display": "flex", "gap": "3vh", "flexDirection": "column" }}>
            <div style={{"display" : "flex", "flexDirection" : "row", "justifyContent" : "space-between", "paddingInline" : 5}}>
                <button style={{borderRadius: 40}} onClick={onAnteriorMes}>{"<"}</button>
                <h2>{mesAnoTexto()}</h2>
                <button onClick={onProximoMes}>{">"}</button>

            </div>

            <div style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', borderRadius: '4px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: "center" }}> {/*Arrumar no CSS depois */}
                {listaPessoas.pessoas.map(pessoa => {
                    return (
                        <div key={pessoa.id}>
                            <button disabled={!existemDespesasCadastradas} onClick={() => mostrarDespesasPessoa(pessoa.id)}>Despesas de {pessoa.name}</button>
                        </div>
                    )
                })}
            </div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Pessoa</th>
                            <th>Pagou</th>
                            <th>Recebeu</th>
                            <th>Despesas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {existemDespesasCadastradas ? (
                            calcularResumoDespesas().map((pessoa, index) => (
                            <tr key={index}>
                                <td>{pessoa.nomePessoa}</td>
                                <td>{pessoa.paga ? pessoa.quantia.toFixed(2) : "0.00"}</td>
                                <td>{pessoa.recebe ? pessoa.quantia.toFixed(2) : "0.00"}</td>
                                <td>{pessoa.numDespesas}</td>
                            </tr>
                        ))) : (
                            listaPessoas.pessoas.map((pessoa, index) => (
                                <tr key={index}>
                                    <td>{pessoa.name}</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{ fontWeight: "bold", color: "#d32f2f" }}>Total</td>
                            <td style={{ fontWeight: "bold", color: "#d32f2f" }}>{calcularTotalGasto()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div>
                <button onClick={retornarSelecao}>Voltar</button>
                
            </div>


        </div>
    )
}