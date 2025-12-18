import { useResumoDespesas } from "@/hooks/useResumoDespesas"

import DespesasInfoResumo from "./DespesasInfoResumo";
import SeletorMes from "../shared/SeletorMes";
import DespesasNaoCadastradas from "../shared/DespesasNaoCadastradas";
import SeletorData from "../shared/SeletorData";

export default function ResumoDespesas({ handleOpcaoMenu, listaDespesas, listaPessoas }) {

    const { 
        etapa,
        listaDespesasMesAnoSelecionado,
        existeDespesaCadastrada,
        selecionarMesAno,
        mesAnoTexto,
        calcularResumoDespesas,
        compartilharResumo,
        onAnteriorMes,
        onProximoMes,
        retornarSelecao


     } = useResumoDespesas({ listaDespesas, listaPessoas });


    const retornarAoMenu = () =>{
        handleOpcaoMenu("menu");
    }


    if(etapa === "selecionarMesAno" && existeDespesaCadastrada === false){
        return (
            <DespesasNaoCadastradas
                onRetornaSelecao={retornarSelecao}
                mesAnoTexto={mesAnoTexto}
            />
            
        )
    }
    if(etapa === "selecionarMesAno"){
        return (
                <SeletorData
                onConfirmaEscolha={(mesSelecionado, anoSelecionado) => selecionarMesAno(mesSelecionado, anoSelecionado)}
                onCancela={retornarAoMenu}                
                />

       )

    } else if (etapa === "resumoDespesa"){
        return (
            <DespesasInfoResumo
            onRetornaAoMenu={retornarAoMenu}
            mesAnoTexto={mesAnoTexto}
            listaDespesasInfoFormatada = {calcularResumoDespesas()}
            onCompartilhar={(dados) => compartilharResumo(dados)}
            onAnteriorMes={onAnteriorMes}
            onProximoMes={onProximoMes}
            existeDespesaCadastrada={existeDespesaCadastrada}

            />
        )
    }
}