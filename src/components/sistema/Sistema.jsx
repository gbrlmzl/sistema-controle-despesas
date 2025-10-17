"use client"

function Sistema({handleOpcaoMenu}){


    return(
    <div>
        <h1>Sistema</h1>
        <div>
            <button onClick={() => handleOpcaoMenu("cadastraPessoas") }>Cadastrar Pessoas</button>
            <button onClick={() => handleOpcaoMenu("menu")}>Retornar ao menu</button>
            <button onClick={() => handleOpcaoMenu("formatarSistema")}>Formatar sistema</button>
            

        </div>


        

    </div>
        
    )

}


export default Sistema;