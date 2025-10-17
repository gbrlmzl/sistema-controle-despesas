import { useState } from "react";
import Loading from "../ui/Loading";

export default function Confirmacao({ onRetornaAoMenu, onConfirmaFormatacao, loading }){
    const [textoConfirmacao, setTextoConfirmacao] = useState("");

    const handleCancela = () => {
        onRetornaAoMenu();
    }

    const handleConfirma = () => {
        onConfirmaFormatacao();

    }

    if(loading){
        return(
            <div>
                <h2>Formatar sistema</h2>
                <Loading/>

            </div>

        )
    }


    return (
        <div>
            <h2>Formatar sistema</h2>
            <h3>Para prosseguir, digite FORMATAR SISTEMA no campo abaixo</h3>
            <input type="text" value={textoConfirmacao} onChange={(e) => setTextoConfirmacao(e.target.value.toUpperCase())} />
            <div>
                <button disabled={textoConfirmacao !== "FORMATAR SISTEMA" || loading} onClick={handleConfirma}>Confirmar</button>
                <button onClick={handleCancela}>Cancelar</button>
            </div>
        </div>
    )

}