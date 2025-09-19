import { useEffect, useState } from "react";
import Pessoa from "../entities/Pessoa"


export const useControleDespesas = () => {
    


    //useStates
    const [opcaoMenu, setOpcaoMenu] = useState("menu");
    const [listaPessoas, setListaPessoas] = useState([]);
    

    useEffect(() => { //Ao iniciar, busca as pessoas cadastradas no banco de dados e atualiza o array de pessoas local
        const recuperaEAtualiza = async () => {
            await handleUpdatePessoas();
        };
        recuperaEAtualiza();
    }, []);
    
    const recuperaListaPessoas = async () => {
        try{
            const response = await fetch("/api/pessoas", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const resultadoBusca = await response.json();
            return resultadoBusca;
        }catch(err){
            console.log(err);
        }
    }

    const handleUpdatePessoas = async () => {
        const novaListaPessoas = await recuperaListaPessoas();
        
        setListaPessoas(novaListaPessoas || []);
    }

    const handleAtualizarListaPessoas = async () => {
        await handleUpdatePessoas();
    }

    //handlers
    const handleOpcaoMenu = (opcao) => {
        setOpcaoMenu(opcao);
    }




    return { opcaoMenu, listaPessoas, handleOpcaoMenu, recuperaListaPessoas, handleAtualizarListaPessoas }
}