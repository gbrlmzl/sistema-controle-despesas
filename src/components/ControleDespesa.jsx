"use client"

import ControleDespesasMenu from "./ControleDespesasMenu";
import SistemaComponent from "./Sistema";  
import {useControleDespesas} from "../hooks/useControleDespesas"
import CadastraPessoa from "./CadastraPessoa";


function ControleDespesa(){
    const {opcaoMenu,listaPessoas, handleOpcaoMenu} = useControleDespesas();



    
    

    if(opcaoMenu === "menu"){
        return <ControleDespesasMenu handleOpcaoMenu={handleOpcaoMenu}/>
    }
    if(opcaoMenu === "consultaDespesa"){
        //TODO ConsultaDespesa
    }
    if(opcaoMenu === "cadastraDespesa"){

    }
    if(opcaoMenu === "resumoDespesa"){
        
    }
    if(opcaoMenu === "sistema"){
        return <SistemaComponent handleOpcaoMenu={handleOpcaoMenu}/>

    }
    if(opcaoMenu === "cadastraPessoas"){
        return <CadastraPessoa pessoa={listaPessoas} etapa/>

    }
    return (<div>
        <h1>Pass</h1>
    
    </div>
        
    );

}

export default ControleDespesa;