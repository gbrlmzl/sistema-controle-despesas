import { useResumoDespesas } from "@/hooks/useResumoDespesas"

import SelecionarMesAno from "./SelecionarMesAno";
import DespesasInfoResumo from "./DespesasInfoResumo";

export default function ResumoDespesas({ handleOpcaoMenu, listaDespesas, listaPessoas }) {

    const { 
        etapa,
        listaDespesasMesAnoSelecionado,
        existeDespesaCadastrada,
        handleConfirmaEscolha,
        mesAnoTexto,
        calcularResumoDespesas,
        compartilharResumo,
        onAnteriorMes,
        onProximoMes


     } = useResumoDespesas({ listaDespesas, listaPessoas });


    const retornarAoMenu = () =>{
        handleOpcaoMenu("menu");
    }


    
    if(etapa === "selecionarMesAno"){
        return (
                <SelecionarMesAno
                onConfirmaEscolha={(mesSelecionado, anoSelecionado) => handleConfirmaEscolha(mesSelecionado, anoSelecionado)}
                onRetornaAoMenu={retornarAoMenu}
                existeDespesaCadastrada={existeDespesaCadastrada}
                


                />

       )

    } else if (etapa === "resumoDespesa"){
        return (
            <DespesasInfoResumo
            onRetornaAoMenu={retornarAoMenu}
            mesAnoTexto={mesAnoTexto}
            listaDespesasInfoFormatada = {calcularResumoDespesas()}
            onCompartilhar={compartilharResumo}
            onAnteriorMes={onAnteriorMes}
            onProximoMes={onProximoMes}
            existeDespesaCadastrada={existeDespesaCadastrada}

            />
        )
    }
}