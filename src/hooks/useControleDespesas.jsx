import { useState } from "react";
import Pessoa from "../entities/Pessoa"


export const useControleDespesas = () =>{
    //pessoas
    //Será modificado para quando existir pessoas cadastradas no banco de dados, essas pessoas serem a pessoaUm e pessoaDois.

    
    //useStates
    const [opcaoMenu, setOpcaoMenu] = useState("menu");





    

    //handlers
    const handleOpcaoMenu = (opcao) =>{
        setOpcaoMenu(opcao);
    }




    return{opcaoMenu, handleOpcaoMenu }
}