import html2canvas from "html2canvas";
import { useEffect, useState, useRef } from "react";

export const useCadastroDespesas = ({listaPessoas, atualizarDespesas}) => {
    const etapas = ["selecaoMes", "cadastroDespesa", "confirmaDespesa", "resumoPagamento"];
    const [mesAno, setMesAno] = useState({ mes: null, ano: null });
    const [pessoaAtualIndex, setPessoaAtualIndex] = useState(0);
    const [despesaAtualIndex, setDespesaAtualIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [existeDespesaCadastrada, setExisteDespesaCadastrada] = useState(false);
    const [somaDespesasPessoaAtual, setSomaDespesasPessoaAtual] = useState(0);
    const [listaDespesasDeCadaPessoa, setListaDespesasDeCadaPessoa] = useState([]);
    const [etapa, setEtapa] = useState(etapas[0]);
    const [sucessoCadastro, setSucessoCadastro] = useState(null); // null = não tentou cadastrar, true = sucesso, false = falha
    const sobrescreverDespesas = useRef(false);

    useEffect(() => { //UseEffect para atualizar a soma das despesas da pessoa atual sempre que a lista de despesas ou o índice da pessoa atual mudar
        setSomaDespesasPessoaAtual(listaDespesasDeCadaPessoa[pessoaAtualIndex]?.somaDespesas || 0);
    }, [listaDespesasDeCadaPessoa, pessoaAtualIndex]);

    useEffect(() => { //UseEffect para resetar o índice da despesa atual sempre que a pessoa atual mudar
        setDespesaAtualIndex(0);
    }, [pessoaAtualIndex]);

    useEffect(() => {
        if(sucessoCadastro === true){
            atualizarDespesas();
        }

    }, [sucessoCadastro])

    //Array que vai conter um array de objetos que tem {idPessoa: id, nomePessoa: "", despesas: [], somaDespesas: 0, quantDespesas : 0}
    const criarListaDeDespesasParaCadaPessoa = () => {
        const pessoasArray = listaPessoas.pessoas; //transforma o objeto listaPessoas em um array para melhor manipulação
        const novaListaDespesasDeCadaPessoa = [];
        for (const pessoa of pessoasArray) {
            novaListaDespesasDeCadaPessoa.push({ idPessoa: pessoa.id, nomePessoa: pessoa.name, despesas: [], somaDespesas: 0, quantDespesas: 0 });
        }
        setListaDespesasDeCadaPessoa(novaListaDespesasDeCadaPessoa);
    }

    const despesaDados = {
        nomePessoa: listaPessoas.pessoas[pessoaAtualIndex]?.name || "",
        numDespesa: (despesaAtualIndex + 1),
        somaDespesas: somaDespesasPessoaAtual,
        identificacao: listaDespesasDeCadaPessoa[pessoaAtualIndex]?.despesas[despesaAtualIndex]?.identificacao || "",
        valor: listaDespesasDeCadaPessoa[pessoaAtualIndex]?.despesas[despesaAtualIndex]?.valor || "",
    };

    const pessoaIndexDados = {
        pessoaAtualIndex: pessoaAtualIndex,
        isFirstPessoa: pessoaAtualIndex === 0,
        isLastPessoa: pessoaAtualIndex === (listaPessoas.pessoas.length - 1)
    }


    const recuperaDespesasDoMes = async (mesAno) => {
        try {
            const response = await fetch(`/api/gastos?mes=${mesAno.mes}&ano=${mesAno.ano}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const resultado = await response.json();
            return resultado;


        } catch (err) {
            console.log(err);
        }
    }

    const handleConfirmaEscolha = async (mesSelecionado, anoSelecionado) => {
        if (loading) return; //se já estiver carregando, não faz nada
        setLoading(true); //indica que está carregando
        setMesAno({ mes: mesSelecionado, ano: anoSelecionado });
        //Quando confirmar o mês e ano, verificar se já existem despesas cadastradas no banco de dados correspondente a esse mês e ano. se existir, perguntar se quer substituir ou cancelar a operação
        const response = await recuperaDespesasDoMes({ mes: mesSelecionado, ano: anoSelecionado });
        const despesasExistentes = response.gastos;

        if (despesasExistentes.length > 0) { //Se existem despesas cadastradas nesse mês e ano, o usuário deve decidir se quer substituir ou cancelar a operação                      
            setLoading(false);
            setExisteDespesaCadastrada(true);
            return; //finaliza a função aqui, esperando o usuário decidir o que fazer
        }


        //se não existir, avançar para a próxima etapa
        setEtapa(etapas[1]); //avança para a próxima etapa
        setLoading(false); //indica que terminou de carregar
        criarListaDeDespesasParaCadaPessoa(); //cria o array de despesas para cada pessoa
    }

    const handleSobrescrever = () => {
        //Função para sobrescrever as despesas existentes no banco de dados
        setExisteDespesaCadastrada(false);
        sobrescreverDespesas.current = true;
        setEtapa(etapas[1]); //avança para a próxima etapa

        criarListaDeDespesasParaCadaPessoa(); //cria o array de despesas para cada pessoa
    }


    const handleProximaDespesa = (formData) => {
        setListaDespesasDeCadaPessoa(prevLista => {
            // Cria uma cópia profunda do array
            const novaLista = prevLista.map((pessoa, indexPessoa) => {
                if (indexPessoa !== pessoaAtualIndex) return pessoa; // mantém as outras pessoas

                // Cópia das despesas da pessoa atual
                const novasDespesas = [...pessoa.despesas];
                const valor = parseFloat(formData.get("valor"));
                const identificacao = formData.get("identificacao");

                if (novasDespesas[despesaAtualIndex]) {
                    // Substitui a despesa existente
                    novasDespesas[despesaAtualIndex] = { identificacao: identificacao, valor: valor };
                } else {
                    // Adiciona nova despesa
                    novasDespesas.push({ identificacao: identificacao, valor: valor });
                }

                // Atualiza soma e quantidade
                const novaSomaDespesas = novasDespesas.reduce((acumulador, despesa) => acumulador + despesa.valor, 0);
                const novaQuantDespesas = novasDespesas.length;

                return {
                    ...pessoa,
                    despesas: novasDespesas,
                    somaDespesas: novaSomaDespesas,
                    quantDespesas: novaQuantDespesas
                };
            });

            return novaLista;
        });

        setDespesaAtualIndex(despesaAtualIndex + 1);
    };

    const handleAnteriorDespesa = () => {
        if (despesaAtualIndex > 0) {
            setDespesaAtualIndex(despesaAtualIndex - 1);
        }
    }

    const handleProximaPessoa = () => {
        if (pessoaAtualIndex < listaPessoas.pessoas.length - 1) {
            setPessoaAtualIndex(pessoaAtualIndex + 1);
        }
    }

    const handleAnteriorPessoa = () => {
        if (pessoaAtualIndex > 0) {
            setPessoaAtualIndex(pessoaAtualIndex - 1);
        }
    }

    const handleFinalizar = () => {
        setEtapa(etapas[2]); //mudar para a etapa de confirmaDespesa
    }

    const mesAnoTexto = () => {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        if (mesAno.mes && mesAno.ano) {
            const mesTexto = meses[mesAno.mes - 1];
            return `${mesTexto} de ${mesAno.ano}`;
        }
    }

    const listaResumoDespesas = () => {
        return listaDespesasDeCadaPessoa.map(pessoa => ({
            nomeResponsavel: pessoa.nomePessoa,
            somaDespesas: pessoa.somaDespesas,
            quantDespesas: pessoa.quantDespesas
        }));
    }

    const handleConfirmaCadastroDespesas = async () => {
        if (loading) return; //se já estiver carregando, não faz nada
        setLoading(true); //indica que está carregando

        try {
            const response = await fetch("/api/gastos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lista: listaDespesasDeCadaPessoa,
                    mes: mesAno.mes,
                    ano: mesAno.ano,
                    sobrescreverDespesas: sobrescreverDespesas.current
                }),

            });

            const resultadoCadastro = await response.json();

            if (resultadoCadastro.success === true) {
                setSucessoCadastro(true);
                setEtapa(etapas[3]);

            } else if (resultadoCadastro.success === false) {
                setSucessoCadastro(false); // Indica falha no cadastro
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
            sobrescreverDespesas.current = false;
        }
    }

    const handleCancelaCadastroDespesas = () => {
        setEtapa(etapas[1])//volta para a etapa de cadastrar despesas.
    }


    const calcularPagamento = () => {
        const valorTotalDespesas = listaDespesasDeCadaPessoa.reduce((acumuladorSomaDespesas, pessoa) => acumuladorSomaDespesas + pessoa.somaDespesas, 0);
        const numPessoas = listaDespesasDeCadaPessoa.length;
        const valorPagamentoPorPessoa = valorTotalDespesas / numPessoas;
        
        //Retornar um array de objetos com valores
        //{nomePessoa: "", recebe: true/false , paga: true/false, quantia:}
        return listaDespesasDeCadaPessoa.map(pessoa => {
            const nomePessoa = pessoa.nomePessoa;
            const saldo = valorPagamentoPorPessoa - pessoa.somaDespesas;
            const recebe = saldo < 0 ? true : false;
            const paga   = saldo > 0 ? true : false;
            const quantia = Math.abs(saldo);

            return {
                nomePessoa: nomePessoa,
                recebe: recebe,
                paga: paga,
                quantia : quantia
            }
        })
    }

    const dadosPagamento = calcularPagamento();

    const handleCompartilharResumo = async (resumoRef) => {
        const canvas = await html2canvas(resumoRef.current);
        const dataUrl = canvas.toDataURL("image/png");

        //Converter para blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        //Compartilhar usando a API de compartilhamento nativa do navegador
        if(navigator.share){
            const mesAnoFormatado = `${mesAno.mes}_${mesAno.ano}`;
            const file = new File([blob], `resumo_${mesAnoFormatado}.png`, {type: "image/png"});
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
        mesAnoTexto,
        loading,
        existeDespesaCadastrada,
        despesaDados,
        pessoaIndexDados,
        handleConfirmaEscolha,
        handleProximaDespesa,
        handleAnteriorDespesa,
        handleProximaPessoa,
        handleAnteriorPessoa,
        handleSobrescrever,
        handleFinalizar,
        handleConfirmaCadastroDespesas,
        handleCancelaCadastroDespesas,
        handleCompartilharResumo,
        listaResumoDespesas,
        sucessoCadastro,
        dadosPagamento
    };
}