import useConsultarDespesas from "../../hooks/useConsultarDespesas";
import DespesasDetalhes from "./DespesasDetalhes";
import DespesasResumo from "./DespesasResumo";
import DespesasNaoCadastradas from "../shared/DespesasNaoCadastradas";
import SeletorMes from "../shared/SeletorMes";
import Snackbar from "../ui/Snackbar";
import { useEffect } from "react";

export default function ConsultarDespesas({ listaPessoas, listaDespesas, handleOpcaoMenu, }) {


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
        compartilharDespesasDetalhes,
        snackbar,
        mostrarSnackbar,
        fecharSnackbar,
    } = useConsultarDespesas({ listaPessoas, listaDespesas });

    useEffect(() => {
        if(etapa === "despesasResumo") {
            mostrarSnackbar({msg: "Clique no nome da pessoa para ver os detalhes das despesas.", type: "warning"});
        }
        
    }, [etapa]);

    const retornarAoMenu = () => {
        handleOpcaoMenu("menu");
    }

    if(etapa === "selecaoMes" && existeDespesaCadastrada === false) {
        return(
            <DespesasNaoCadastradas
            onRetornaSelecao={retornarSelecao}
            mesAnoTexto={mesAnoTexto()}
        />
        )
        
    }
    
    if (etapa === "selecaoMes") {
        return (
            <SeletorMes
                onConfirmaEscolha={(mesSelecionado, anoSelecionado) => buscarDespesasMesAno(mesSelecionado, anoSelecionado)}
                onCancela={retornarAoMenu}
                loading={loading}
            />
        )
    } else if (etapa === "despesasResumo") {
        return (
            <>
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
            <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} onClose={fecharSnackbar} ></Snackbar>
            </>
        );
    } else if (etapa === "despesasDetalhes") {
        return (
            <DespesasDetalhes
                despesasPessoa={despesasPessoaSelecionada}
                retornarResumo={retornarResumo}
                mesAnoTexto={mesAnoTexto}
                onCompartilhar={(despesas, pessoa, mesAnoTexto) => compartilharDespesasDetalhes(despesas, pessoa, mesAnoTexto)}
            />
        )
    }

}