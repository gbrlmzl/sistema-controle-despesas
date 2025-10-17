import { useState } from "react";


export default function SelecionarMesAnoConsulta({ onConfirmaEscolha, onRetornaAoMenu,onRetorna, loading, existeDespesaCadastrada, mesAnoTexto }) {
    const [mesEscolhido, setMesEscolhido] = useState("");
    const [anoEscolhido, setAnoEscolhido] = useState("");


    const handleConfirmaEscolha = () => {
        if (mesEscolhido !== "" && anoEscolhido !== "") {
            const mesInt = parseInt(mesEscolhido);
            const anoInt = parseInt(anoEscolhido);
            onConfirmaEscolha(mesInt, anoInt);

        }

    }

    if (existeDespesaCadastrada === false) {
        return (
            <div>
                <h2>Não existem despesas cadastradas para {mesAnoTexto()}.</h2>
                <button onClick={onRetorna}>Retornar</button>
                <button onClick={onRetornaAoMenu}>Menu</button>
            </div>
        )

    }






    return (
        <div>
            <h2>Selecione o Mês e Ano</h2>
            <div>
                <select value={mesEscolhido} onChange={(e) => setMesEscolhido(e.target.value)}>
                    <option value="" disabled hidden>Selecione o mês</option>
                    <option value="1" >Janeiro</option>
                    <option value="2">Fevereiro</option>
                    <option value="3">Março</option>
                    <option value="4">Abril</option>
                    <option value="5">Maio</option>
                    <option value="6">Junho</option>
                    <option value="7">Julho</option>
                    <option value="8">Agosto</option>
                    <option value="9">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                </select>
            </div>
            <div>
                <select value={anoEscolhido} onChange={(e) => setAnoEscolhido(e.target.value)}>
                    <option value="" disabled hidden>Selecione o ano</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                </select>

            </div>
            <div>
                <button onClick={handleConfirmaEscolha} disabled={loading || mesEscolhido === "" || anoEscolhido === ""}>Confirmar</button>
                <button onClick={onRetornaAoMenu}>Cancelar</button>
            </div>


        </div>
    )
}
