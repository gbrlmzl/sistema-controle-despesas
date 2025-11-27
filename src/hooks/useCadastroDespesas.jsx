import { useEffect, useState, useRef } from "react";
import { compartilharResumoPagamento  } from '../utils/compartilharDespesas';
import { set } from "zod";

export const useCadastroDespesas = ({ listaPessoas, atualizarDespesas }) => {
    const etapas = ["selecaoMes", "confirmaSobrescreverDespesas", "cadastroDespesa", "confirmaDespesa","resultadoCadastro", "resumoPagamento"];
    const [etapa, setEtapa] = useState(etapas[0]);
    const [mesAno, setMesAno] = useState({ mes: null, ano: null });
    const [pessoaAtualIndex, setPessoaAtualIndex] = useState(0);
    const [despesaAtualIndex, setDespesaAtualIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });
    const [existeDespesaCadastrada, setExisteDespesaCadastrada] = useState(false);
    const [somaDespesasPessoaAtual, setSomaDespesasPessoaAtual] = useState(0);
    const [listaDespesasDeCadaPessoa, setListaDespesasDeCadaPessoa] = useState([]);
    
    const [isUltimaDespesa, setIsUltimaDespesa] = useState(false);
    const [respostaCadastro, setRespostaCadastro] = useState(null); // null = não tentou cadastrar, true = sucesso, false = falha

    
    
    useEffect(() => { //UseEffect para atualizar a soma das despesas da pessoa atual sempre que a lista de despesas ou o índice da pessoa atual mudar  
        setSomaDespesasPessoaAtual(listaDespesasDeCadaPessoa[pessoaAtualIndex]?.somaDespesas || 0);
        //setIsUltimaDespesa(verificaUltimaDespesaCadastrada());
    }, [listaDespesasDeCadaPessoa, pessoaAtualIndex]);

    useEffect(() => { //UseEffect para resetar o índice da despesa atual sempre que a pessoa atual mudar
        setDespesaAtualIndex(0);
    }, [pessoaAtualIndex]);

    useEffect(() => {
        if (respostaCadastro?.success === true) {
            atualizarDespesas();
        }

    }, [respostaCadastro])

    useEffect(() => {
        setIsUltimaDespesa(verificaUltimaDespesaCadastrada());
    }, [despesaAtualIndex, listaDespesasDeCadaPessoa, pessoaAtualIndex]);
    //Array que vai conter um array de objetos que tem {idPessoa: id, nomePessoa: "", despesas: [], somaDespesas: 0, quantDespesas : 0}
    const criarListaDeDespesasParaCadaPessoa = () => {
        
        const novaListaDespesasDeCadaPessoa = [];
        for (const pessoa of listaPessoas) {
            novaListaDespesasDeCadaPessoa.push({ idPessoa: pessoa.id, nomePessoa: pessoa.name, despesas: [], somaDespesas: 0, quantDespesas: 0 });
        }
        setListaDespesasDeCadaPessoa(novaListaDespesasDeCadaPessoa);
    }

    const despesaDados = {
        nomePessoa: listaPessoas[pessoaAtualIndex]?.name || "",
        numDespesa: (despesaAtualIndex + 1),
        somaDespesas: somaDespesasPessoaAtual,
        identificacao: listaDespesasDeCadaPessoa[pessoaAtualIndex]?.despesas[despesaAtualIndex]?.identificacao || "",
        valor: listaDespesasDeCadaPessoa[pessoaAtualIndex]?.despesas[despesaAtualIndex]?.valor || "",
    };

    const pessoaIndexDados = {
        pessoaAtualIndex: pessoaAtualIndex,
        isFirstPessoa: pessoaAtualIndex === 0,
        isLastPessoa: pessoaAtualIndex === (listaPessoas.length - 1)
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

    const selecionarMesAno = async (mesSelecionado, anoSelecionado) => {
        if (loading) return; //se já estiver carregando, não faz nada
        setLoading(true); //indica que está carregando
        setMesAno({ mes: mesSelecionado, ano: anoSelecionado });
        //Quando confirmar o mês e ano, verificar se já existem despesas cadastradas no banco de dados correspondente a esse mês e ano. se existir, perguntar se quer substituir ou cancelar a operação
        const response = await recuperaDespesasDoMes({ mes: mesSelecionado, ano: anoSelecionado });

        const despesasExistentes = response.gastos;



        if (despesasExistentes.length > 0) { //Se existem despesas cadastradas nesse mês e ano, o usuário deve decidir se quer substituir ou cancelar a operação                      
            setLoading(false);
            setExisteDespesaCadastrada(true);
            setEtapa(etapas[1]); //mudar para a etapa de confirmaSobrescreverDespesas
            return; //finaliza a função aqui, esperando o usuário decidir o que fazer
        }


        //se não existem despesas cadastradas, pode prosseguir para a etapa de cadastrar despesas
        setEtapa(etapas[2]); //avança para a etapa de cadastrar despesas
        setLoading(false); //indica que terminou de carregar
        criarListaDeDespesasParaCadaPessoa(); //cria o array de despesas para cada pessoa
    }

    const handleSobrescrever = () => {
        //Função para sobrescrever as despesas existentes no banco de dados
        setExisteDespesaCadastrada(false);
        setEtapa(etapas[2]); //avança para a próxima etapa

        criarListaDeDespesasParaCadaPessoa(); //cria o array de despesas para cada pessoa
    }


    const adicionarNovaDespesa = (formData) => {
        if (formData.get("identificacao").trim() === "") {
            mostrarSnackbar("A identificação da despesa não pode estar vazia!");
            return;
        }
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
        setDespesaAtualIndex(despesaAtualIndex - 1);
    }

    const handleProximaPessoa = () => {
        if (pessoaAtualIndex < listaPessoas.length - 1) {
            setPessoaAtualIndex(pessoaAtualIndex + 1);
        }
    }

    const handleAnteriorPessoa = () => {
        if (pessoaAtualIndex > 0) {
            setPessoaAtualIndex(pessoaAtualIndex - 1);
        }
    }

    const finalizarCadastroDespesas = () => {
        setEtapa(etapas[3]); //mudar para a etapa de confirmaDespesa
    }

    const mesAnoTexto = () => {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        if (mesAno.mes && mesAno.ano) {
            const mesTexto = meses[mesAno.mes - 1];
            return `${mesTexto} de ${mesAno.ano}`;
        }
    }

    const verificaUltimaDespesaCadastrada = () => {
        if (!listaDespesasDeCadaPessoa) return false;
        if (listaDespesasDeCadaPessoa[pessoaAtualIndex]?.despesas.length === 0) return true;

        return (despesaAtualIndex === (listaDespesasDeCadaPessoa[pessoaAtualIndex]?.quantDespesas));
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
                }),

            });

            const resultadoCadastro = await response.json();
            setRespostaCadastro(resultadoCadastro);
        } catch (err) {
            setRespostaCadastro({ success: false, message: 'Erro ao cadastrar despesas.' });
        } finally {
            setLoading(false);
            setEtapa(etapas[4]);
        }
    }

    const avancarParaResumoPagamento = () => {
        setEtapa(etapas[5]);
    }

    const handleCancelaCadastroDespesas = () => {
        setEtapa(etapas[2])//volta para a etapa de cadastrar despesas.
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
            const paga = saldo > 0 ? true : false;
            const quantia = Math.abs(saldo);

            return {
                nomePessoa: nomePessoa,
                recebe: recebe,
                paga: paga,
                quantia: quantia
            }
        })
    }

    const dadosPagamento = calcularPagamento();

    const onCompartilharResumo = async ({dadosPagamento, mesAnoTexto}) => {
        await compartilharResumoPagamento ({dadosPagamento, mesAnoTexto});
    }

    const mostrarSnackbar = ({msg, type}) => {
        setSnackbar({ open: true, message: msg, type: type });
        setTimeout(() => setSnackbar({ open: false, message: "", type: "" }), 4000);
    };

    const fecharSnackbar = () => {
        setSnackbar({ open: false, message: "", type: "" });
    }



    return {
        etapa,
        mesAnoTexto,
        loading,
        existeDespesaCadastrada,
        despesaDados,
        pessoaIndexDados,
        dadosPagamento,
        respostaCadastro,
        selecionarMesAno,
        adicionarNovaDespesa,
        handleAnteriorDespesa,
        handleProximaPessoa,
        handleAnteriorPessoa,
        handleSobrescrever,
        finalizarCadastroDespesas,
        handleConfirmaCadastroDespesas,
        handleCancelaCadastroDespesas,
        onCompartilharResumo,
        listaResumoDespesas,
        fecharSnackbar,
        avancarParaResumoPagamento,
        isUltimaDespesa,
        snackbar,
    };
}