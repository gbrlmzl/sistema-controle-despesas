import { useState } from "react";
import Pessoa from "../entities/Pessoa"


export const useControleDespesas = () =>{
    //pessoas
    //Será modificado para quando existir pessoas cadastradas no banco de dados.

    
    //useStates
    const [opcaoMenu, setOpcaoMenu] = useState("menu");
    const [listaPessoas, setListaPessoas] = useState([]);








const updatePessoas = (pessoas) => {  //Recebe um array com as pessoas cadastradas e atualiza o array de pessoas nesse Hook
    


    }

    //handlers
    const handleOpcaoMenu = (opcao) =>{
        setOpcaoMenu(opcao);
    }




    return{opcaoMenu, handleOpcaoMenu }
}