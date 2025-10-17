import { useState } from "react";



export const useFormatarSistema = (handleOpcaoMenu, atualizarDadosLocais) => {
    const etapas = ["aviso", "confirmacao", "resumo"];
    const [etapa, setEtapa] = useState(etapas[0]);
    const [loading, setLoading] = useState(false);
    const [resultadoFormatacaoData, setResultadoFormatacaoData] = useState();

    const decisaoProsseguir = (prosseguir) => {
        if (prosseguir) {
            setEtapa(etapas[1]);
        } else {
            handleOpcaoMenu("sistema");
        }
    }

    const formatarSistema = async () => {
        //Fazer uma chamada para a API para formatar o sistema, if sucesso, ir para o resumo
        if (loading) return; //se já estiver carregando, não faz nada
        setLoading(true); //indica que está carregando
        try {
            const response = await fetch("/api/usuarios/dados", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },

            });

            const resultadoFormatacao = await response.json();

            return resultadoFormatacao;


        } catch (err) {
            console.log("Erro na formatação");

        } finally {
            setLoading(false);
        }




    }

    const confirmarFormatacao = async () => {
        const resultadoFormatacao = await formatarSistema();
        if(resultadoFormatacao.success){
            setEtapa(etapas[2]);
            setResultadoFormatacaoData(resultadoFormatacao.data);
            atualizarDadosLocais();
        } else{
            setResultadoFormatacaoData(false);
        }
    }





    return {
        etapa,
        loading,
        decisaoProsseguir,
        confirmarFormatacao,
        resultadoFormatacaoData,
        

    };
}