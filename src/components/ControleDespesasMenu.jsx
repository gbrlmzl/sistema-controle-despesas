//imports
"use client"

function Menu({handleOpcaoMenu}){
    
   
    


    return (
        <div>
            <div className="titulo" style={{color: "black", fontSize: 14 }}>
                <h1>Controle de Despesas</h1>
            </div>
            <div className="menuContainer" style={{display: "flex", flexDirection: "column"}}>               
                <div className="botoes" style={{display: "flex", flexDirection: "column", gap: 5}}>
                    <button onClick={() => handleOpcaoMenu("consultaDespesa")}>Consultar Despesas</button>
                    <button onClick={() => handleOpcaoMenu("cadastroDespesa")}>Cadastrar Despesas</button> 
                    <button onClick={() => handleOpcaoMenu("resumoDespesa")}>Resumo de Despesas</button>
                    <button onClick={() => handleOpcaoMenu("sistema")}>Sistema</button>
                </div>
                





            </div>
            <div className="menuRodape">

            </div>

        </div>
    )

}

export default Menu;