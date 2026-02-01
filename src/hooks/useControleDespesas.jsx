import { useEffect, useState } from "react";


export const useControleDespesas = () => {
    //useStates
    const [opcaoMenu, setOpcaoMenu] = useState("menu");
    const [listaPessoas, setListaPessoas] = useState([]);
    const [listaDespesas, setListaDespesas] = useState([]);
    //listaDespesas = [{ mes: 1, ano: 2022, despesas: [{name: 'aluguel', value: 700, month: 2, year: 2029, idPessoa: 1}]}]

    useEffect(() => { //Ao iniciar, busca as pessoas e gastos cadastradas no banco de dados e atualiza os dados locais.
        const recuperaEAtualizaDados = async () => {
            await atualizarPessoas();
            await atualizarDespesas();
        };

        recuperaEAtualizaDados();
    }, []);

    const recuperaListaPessoas = async () => {
        try {
            const response = await fetch("/api/pessoas", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const resultadoBusca = await response.json();
            return resultadoBusca.data;
        } catch (err) {
            console.log(err);
        }
    }

    const recuperaListaDespesas = async () => {
        try {
            const response = await fetch("/api/gastos", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const resultadoBusca = await response.json();
            return resultadoBusca;
        } catch (err) {
            console.log(err);
        }
    }

    const atualizarPessoas = async () => {
        const novaListaPessoas = await recuperaListaPessoas();

        setListaPessoas(novaListaPessoas || []);
    }

    const atualizarDespesas = async () => {
        const despesasBrutasObject = await recuperaListaDespesas();
        const despesasBrutas = despesasBrutasObject.gastos;

        if (despesasBrutas.length > 0) {
            // Agrupa por mês/ano
            const despesasOrganizadas = [];
            despesasBrutas.forEach(despesa => {
                const { month, year } = despesa;
                let grupo = despesasOrganizadas.find(d => d.mes === month && d.ano === year);
                if (!grupo) {
                    grupo = { mes: month, ano: year, despesas: [] };
                    despesasOrganizadas.push(grupo);
                }
                grupo.despesas.push(despesa);
            });
            setListaDespesas(despesasOrganizadas);
        }else{
            setListaDespesas([]);
        }

    }



    //handlers
    const handleOpcaoMenu = (opcao) => {
        setOpcaoMenu(opcao);
    }

    const existemPessoasCadastradas = () => {
        return listaPessoas.length > 0;
    }




    return { opcaoMenu, listaPessoas, listaDespesas, handleOpcaoMenu, atualizarPessoas, atualizarDespesas, existemPessoasCadastradas }
}