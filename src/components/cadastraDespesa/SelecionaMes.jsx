import { useState } from "react";
import Loading from "../ui/Loading";

export default function SelecionaMes({onConfirmaEscolha, onCancela, onSobrescrever, loading, existeDespesaCadastrada}) {
    const [mesEscolhido, setMesEscolhido] = useState("");
    const [anoEscolhido, setAnoEscolhido] = useState("");


    const handleConfirmaEscolha = () => {
        if(mesEscolhido !== "" && anoEscolhido !== ""){
            const mesInt = parseInt(mesEscolhido);
            const anoInt = parseInt(anoEscolhido);
            onConfirmaEscolha(mesInt, anoInt);

        }
        
    }

    if(existeDespesaCadastrada === true){
        //TODO implementar modal para perguntar se quer substituir ou cancelar
        return(
            <div>
                <h2>Existem despesas cadastradas para {mesEscolhido}/{anoEscolhido}.</h2>
                <h2>Deseja sobrescrevê-las?</h2>
                <button onClick={onSobrescrever}>Sobrescrever</button>
                <button onClick={onCancela}>Cancelar</button>
            </div>
        )

    }


    



    return(
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
                <button onClick={onCancela}>Cancelar</button>
            </div>


    </div>
    )
}
