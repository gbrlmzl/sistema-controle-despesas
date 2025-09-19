import { useEffect, useState } from "react";

export const useCadastroDespesas = (listaDespesas, listaPessoas) => {
    const [mesAno, setMesAno] = useState({ mes: null, ano: null });
    const etapas = ["selecaoMes", "cadastroDespesa", "resumoDespesa"];
    const [pessoaAtualIndex, setPessoaAtualIndex] = useState(0);
    const [despesaAtualIndex, setDespesaAtualIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [existeDespesaCadastrada, setExisteDespesaCadastrada] = useState(false);
    const [somaDespesasPessoaAtual, setSomaDespesasPessoaAtual] = useState(0);
    const [listaDespesasDeCadaPessoa, setListaDespesasDeCadaPessoa] = useState([]); //Array que vai conter um array de objetos que tem {idPessoa: id, nomePessoa: "", despesas: [{identificacao: "", valor: 0}], somaDespesas: 0, quantDespesas : 0}


    useEffect(() => { //UseEffect para atualizar a soma das despesas da pessoa atual sempre que a lista de despesas ou o índice da pessoa atual mudar
        setSomaDespesasPessoaAtual(listaDespesasDeCadaPessoa[pessoaAtualIndex]?.somaDespesas || 0);
        console.log(listaDespesasDeCadaPessoa);
    }, [listaDespesasDeCadaPessoa, pessoaAtualIndex]); 


    
    //Array que vai conter um array de objetos que tem {idPessoa: id, nomePessoa: "", despesas: [], somaDespesas: 0, quantDespesas : 0}
    const [etapa, setEtapa] = useState(etapas[0]);



    const criarListaDeDespesasParaCadaPessoa = () => {
        const pessoasArray = listaPessoas.pessoas; //transforma o objeto listaPessoas em um array para melhor manipulação
        const novaListaDespesasDeCadaPessoa = [];
        for (const pessoa of pessoasArray) {
            novaListaDespesasDeCadaPessoa.push({ idPessoa: pessoa.id, nomePessoa: pessoa.name, despesas: [], somaDespesas: 0, quantDespesas: 0 });
        }
        setListaDespesasDeCadaPessoa(novaListaDespesasDeCadaPessoa);
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

    const handleConfirmaEscolha = async (mesSelecionado, anoSelecionado) => { //Arrumar isso aqui => trocar mês extenso por numero 1 - 12
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
        setEtapa(etapas[1]); //avança para a próxima etapa

        criarListaDeDespesasParaCadaPessoa(); //cria o array de despesas para cada pessoa
    }


    const handleProximaDespesa = (formData) => {
        setListaDespesasDeCadaPessoa(prevLista => {
            // Cria uma cópia profunda do array
            const novaLista = prevLista.map((pessoa, idxPessoa) => {
                if (idxPessoa !== pessoaAtualIndex) return pessoa; // mantém as outras pessoas

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

    const mesAnoTexto = () =>{
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        if (mesAno.mes && mesAno.ano) {
            const mesTexto = meses[mesAno.mes - 1];
            return `${mesTexto} de ${mesAno.ano}`;
        }
    }



    return { etapa, mesAnoTexto, loading, existeDespesaCadastrada, pessoaAtualIndex, despesaAtualIndex, somaDespesasPessoaAtual, handleConfirmaEscolha, handleProximaDespesa, handleSobrescrever };
}