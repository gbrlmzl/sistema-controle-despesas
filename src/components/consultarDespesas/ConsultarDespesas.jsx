import useConsultarDespesas from "../../hooks/useConsultarDespesas";
import DespesasDetalhes from "./DespesasDetalhes";
import DespesasResumo from "./DespesasResumo";
import SelecionarMesAnoConsulta from "./SelecionarMesAnoConsulta";

export default function ConsultarDespesas({listaPessoas, listaDespesas, handleOpcaoMenu,}){


    const {
        etapa,
        loading,
        existeDespesaCadastrada,
        despesasPessoaSelecionada,
        buscarDespesasMesAno,
        retornarSelecao,
        despesasMesAnoSelecionado,
        mesAnoTexto,
        exibirDespesasDetalhes,
        calcularResumoDespesas,
        avancarMes,
        retrocederMes,
        retornarResumo,
        compartilharDespesasPessoa
    } = useConsultarDespesas({listaPessoas, listaDespesas});

    

    if(etapa === "selecaoMes"){
        return(
            <SelecionarMesAnoConsulta 
            onConfirmaEscolha={(mesSelecionado, anoSelecionado) => buscarDespesasMesAno(mesSelecionado, anoSelecionado)}
            onRetornaAoMenu={() => handleOpcaoMenu("menu")}
            onRetorna={retornarSelecao}
            loading={loading}
            existeDespesaCadastrada={existeDespesaCadastrada}
            mesAnoTexto={mesAnoTexto}
            />
        )
    } else if (etapa === "despesasResumo") {
        return (
            <DespesasResumo
                despesasMesAnoSelecionado={despesasMesAnoSelecionado}
                listaPessoas={listaPessoas}
                retornarSelecao={retornarSelecao}
                mesAnoTexto={mesAnoTexto}
                mostrarDespesasPessoa={(idPessoa) => exibirDespesasDetalhes(idPessoa)}
                calcularResumoDespesas={calcularResumoDespesas}
                onProximoMes={avancarMes}
                onAnteriorMes={retrocederMes}
            />
        );
    } else if (etapa === "despesasDetalhes") {
        return (
            <DespesasDetalhes
                despesasPessoa={despesasPessoaSelecionada}
                retornarResumo={retornarResumo}
                mesAnoTexto={mesAnoTexto}
                onCompartilhar={({despesasDetalhesRef, pessoaNome}) => compartilharDespesasPessoa({despesasDetalhesRef, pessoaNome})}
            />
        )
    }

}