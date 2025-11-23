import { useState } from "react";
import styles from './SeletorMes.module.css';
import Image from "next/image";

const confirmarIcon = "../../assets/icons/novos/confirmarIcon.svg";


export default function SeletorMes({onConfirmaEscolha, onCancela, loading }) {
    const [mesEscolhido, setMesEscolhido] = useState("");
    const [anoEscolhido, setAnoEscolhido] = useState("");


    const handleConfirmaEscolha = () => {
        if (mesEscolhido !== "" && anoEscolhido !== "") {
            const mesInt = parseInt(mesEscolhido);
            const anoInt = parseInt(anoEscolhido);
            onConfirmaEscolha(mesInt, anoInt);

        }

    }




    return (
        <div className={styles.seletorMesContainer}>
            <div className={styles.selectContainer}>
                <select name="mes" value={mesEscolhido} onChange={(e) => setMesEscolhido(e.target.value)}>
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
                <select name="ano" value={anoEscolhido} onChange={(e) => setAnoEscolhido(e.target.value)}>
                    <option value="" disabled hidden>Selecione o ano</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                </select>

            </div>
            <div className={styles.botoesContainer}>
                <button onClick={onCancela}>
                    <span className={styles.botaoIcone}>
                        <img src="/icons/retornarIcon.svg" alt="Cancelar" />
                    </span>          
                </button>
                <button onClick={handleConfirmaEscolha} disabled={loading || mesEscolhido === "" || anoEscolhido === ""}>
                    <span className={styles.botaoIcone}>
                        <img src="/icons/confirmarIcon.svg" alt="Confirmar" />
                    </span>
                </button>
            </div>



        </div>
    )
}
