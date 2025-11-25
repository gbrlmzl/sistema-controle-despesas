import { useEffect, useState } from "react"
import html2canvas from "html2canvas";
import { compartilharDespesasResumo } from "../utils/compartilharDespesas";

export const useResumoDespesas = ({ listaDespesas, listaPessoas }) => {
    const etapas = ["selecionarMesAno", "resumoDespesa"]

    const [etapa, setEtapa] = useState("selecionarMesAno")
    const [listaDespesasMesAnoSelecionado, setListaDespesasMesAnoSelecionado] = useState([]);
    const [existeDespesaCadastrada, setExisteDespesaCadastrada] = useState(null);
    const [mesAnoSelecionado, setMesAnoSelecionado] = useState({ mes: null, ano: null });
    const [mesAnoTexto, setMesAnoTexto] = useState();


    const calcularResumoDespesas = () => {
        const valorTotalDespesas = listaDespesasMesAnoSelecionado.reduce((acumuladorSomaDespesas, despesa) => acumuladorSomaDespesas + despesa.value, 0);
        const numPessoas = listaPessoas.pessoas.length;
        const valorPagamentoPorPessoa = valorTotalDespesas / numPessoas;


        return listaPessoas.pessoas.map(pessoa => {
            const totalGastoPessoa = listaDespesasMesAnoSelecionado.reduce(
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
            const numDespesas = listaDespesasMesAnoSelecionado.filter(despesa => despesa.idPessoa === pessoa.id).length;

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




    const selecionarMesAno = (mesSelecionado, anoSelecionado) => {
        for (const despesaDados of listaDespesas) {
            if (despesaDados.mes === mesSelecionado && despesaDados.ano === anoSelecionado) {
                setListaDespesasMesAnoSelecionado(despesaDados.despesas);
                setExisteDespesaCadastrada(true);
                setEtapa("resumoDespesa");

                setMesAnoSelecionado({ mes: mesSelecionado, ano: anoSelecionado });
                setMesAnoTexto(converteMesAnoTexto(mesSelecionado, anoSelecionado));

                return;
            }
        }
        //Caso não encontre despesas para o mês e ano selecionados
        setMesAnoTexto(converteMesAnoTexto(mesSelecionado, anoSelecionado))
        setExisteDespesaCadastrada(false);
    }

    const mudaMesSelecionado = (novoMes, novoAno) => {
        setMesAnoSelecionado({ mes: novoMes, ano: novoAno });
        setMesAnoTexto(converteMesAnoTexto(novoMes, novoAno));
        for (const despesaDados of listaDespesas) {
            if (despesaDados.mes === novoMes && despesaDados.ano === novoAno) {
                setListaDespesasMesAnoSelecionado(despesaDados.despesas);
                setExisteDespesaCadastrada(true);
                return;
            }
        }
        setListaDespesasMesAnoSelecionado([]);
        setExisteDespesaCadastrada(false);


    }

    const onAnteriorMes = () => {
        const mesAnterior = mesAnoSelecionado.mes - 1;
        const anoAnterior = mesAnterior === 0 ? mesAnoSelecionado.ano - 1 : mesAnoSelecionado.ano;

        mudaMesSelecionado(mesAnterior === 0 ? 12 : mesAnterior, anoAnterior);

    }

    const onProximoMes = () => {
        const mesProximo = mesAnoSelecionado.mes + 1;
        const anoProximo = mesProximo === 13 ? mesAnoSelecionado.ano + 1 : mesAnoSelecionado.ano;
        mudaMesSelecionado(mesProximo === 13 ? 1 : mesProximo, anoProximo);

    }

    const converteMesAnoTexto = (mesSelecionado, anoSelecionado) => {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const mesTexto = meses[mesSelecionado - 1];
        return `${mesTexto} de ${anoSelecionado}`;

    }

    const compartilharResumo = async (dados) => {
        await compartilharDespesasResumo({
            listaDespesasInfoFormatada: dados.listaDespesasInfoFormatada,
            mesAnoTexto: dados.mesAnoTexto,
            existeDespesaCadastrada: dados.existeDespesaCadastrada
        });
    }



    const retornarSelecao = () => {
        setExisteDespesaCadastrada(null);
        setEtapa("selecionarMesAno");
    }







    return ({
        etapa,
        selecionarMesAno,
        existeDespesaCadastrada,
        listaDespesasMesAnoSelecionado,
        mesAnoTexto,
        calcularResumoDespesas,
        compartilharResumo,
        onAnteriorMes,
        onProximoMes,
        retornarSelecao

    })

}