import { useState } from "react";
import html2canvas from "html2canvas";


export default function useConsultarDespesas({ listaPessoas, listaDespesas }) {
    const etapas = ["selecaoMes", "despesasResumo", "despesasDetalhes"];
    const [etapa, setEtapa] = useState(etapas[0]);
    const [loading, setLoading] = useState(false);

    const [despesasMesAnoSelecionado, setDespesasMesAnoSelecionado] = useState([]);
    const [despesasPessoaSelecionada, setDespesasPessoaSelecionada] = useState([]);
    const [existeDespesaCadastrada, setExisteDespesaCadastrada] = useState(null); //null = não verificado, true = existe, false = não existe
    const [mesAnoSelecionado, setMesAnoSelecionado] = useState({ mes: null, ano: null });



    const buscarDespesasMesAno = (mesSelecionado, anoSelecionado) => {
        setLoading(true);
        //Verifica se existem despesas cadastradas para o mês e ano selecionados
        const despesasEncontradas = listaDespesas.find(despesa => despesa.mes === mesSelecionado && despesa.ano === anoSelecionado);
        if (despesasEncontradas) {

            setEtapa(etapas[1]); //avança para a próxima etapa
            setLoading(false);
            setDespesasMesAnoSelecionado(despesasEncontradas.despesas);
            setExisteDespesaCadastrada(true);
            setMesAnoSelecionado({ mes: mesSelecionado, ano: anoSelecionado });

        } else {
            setLoading(false);
            setDespesasMesAnoSelecionado([]); //limpa a lista de despesas
            setExisteDespesaCadastrada(false);
            setMesAnoSelecionado({ mes: mesSelecionado, ano: anoSelecionado });
        }
    }

    const retornarSelecao = () => {
        setEtapa(etapas[0]);
        setDespesasMesAnoSelecionado([]);
        setExisteDespesaCadastrada(null);
        setMesAnoSelecionado({ mes: null, ano: null });
    }

    const mesAnoTexto = () => {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        if (mesAnoSelecionado.mes && mesAnoSelecionado.ano) {
            const mesTexto = meses[mesAnoSelecionado.mes - 1];
            return `${mesTexto} de ${mesAnoSelecionado.ano}`;
        }
    }

    const exibirDespesasDetalhes = (idPessoa) => {
        //filtra as despesas da pessoa selecionada
        const despesasPessoa = despesasMesAnoSelecionado.filter(despesa => despesa.idPessoa === idPessoa);
        const pessoaSelecionada = listaPessoas.pessoas.find(p => p.id === idPessoa);
        setDespesasPessoaSelecionada({ despesas: despesasPessoa, pessoa: pessoaSelecionada });
        setEtapa(etapas[2]);
    }

    const calcularResumoDespesas = () => {
        const valorTotalDespesas = despesasMesAnoSelecionado.reduce((acumuladorSomaDespesas, despesa) => acumuladorSomaDespesas + despesa.value, 0);
        const numPessoas = listaPessoas.pessoas.length;
        const valorPagamentoPorPessoa = valorTotalDespesas / numPessoas;


        return listaPessoas.pessoas.map(pessoa => {
            const totalGastoPessoa = despesasMesAnoSelecionado.reduce(
                (acumuladorSomaDespesas, despesa) =>
                    despesa.idPessoa === pessoa.id
                        ? acumuladorSomaDespesas + despesa.value
                        : acumuladorSomaDespesas,
                0
            );

            const nomePessoa = pessoa.name
            const saldo = valorPagamentoPorPessoa - totalGastoPessoa;
            const recebe = saldo < 0 ? true : false;
            const paga = saldo > 0 ? true : false;
            const quantia = Math.abs(saldo);
            const numDespesas = despesasMesAnoSelecionado.filter(despesa => despesa.idPessoa === pessoa.id).length;

            return {
                nomePessoa: nomePessoa,
                totalGasto: totalGastoPessoa,
                recebe: recebe,
                paga: paga,
                quantia: quantia,
                numDespesas: numDespesas
            }
        })
    }

    const avancarMes = () => {
        let novoMes = mesAnoSelecionado.mes + 1;
        let novoAno = mesAnoSelecionado.ano;

        if (novoMes > 12) {
            novoMes = 1;
            novoAno += 1;
        }
        buscarDespesasMesAno(novoMes, novoAno);
    }

    const retrocederMes = () => {
        let novoMes = mesAnoSelecionado.mes - 1;
        let novoAno = mesAnoSelecionado.ano;

        if (novoMes < 1) {
            novoMes = 12;
            novoAno -= 1;
        }
        buscarDespesasMesAno(novoMes, novoAno);
    }

    const retornarResumo = () => {
        setEtapa(etapas[1]);
        setDespesasPessoaSelecionada([]);
    }

    const compartilharDespesasPessoa = async ({despesasDetalhesRef, pessoaNome}) => {

        

        const canvas = await html2canvas(despesasDetalhesRef.current);
        const dataUrl = canvas.toDataURL("image/png");

        //Converter para blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        //Compartilhar usando a API de compartilhamento nativa do navegador
        if (navigator.share) {
            const mesAnoFormatado = mesAnoTexto().toLowerCase().replace(" de ", "_").replace("ç", "c").replace(/ /g, "_");
            const file = new File([blob], `despesas_${pessoaNome.toLowerCase().replace(/ /g, "_")}_${mesAnoFormatado}.png`, { type: "image/png" });
            navigator.share({
                files: [file],
                title: "Resumo financeiro",
                text: "",
            });
        } else {
            console.log("Erro ao compartilhar");

        }
    }






    return {
        etapa,
        loading,
        existeDespesaCadastrada,
        buscarDespesasMesAno,
        despesasMesAnoSelecionado,
        retornarSelecao,
        mesAnoTexto,
        calcularResumoDespesas,
        avancarMes,
        retrocederMes,
        exibirDespesasDetalhes,
        despesasPessoaSelecionada,
        retornarResumo,
        compartilharDespesasPessoa
    }





}