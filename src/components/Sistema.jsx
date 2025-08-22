"use client"

function Sistema({handleOpcaoMenu}){


    return(
    <div>
        <h1>Sistema</h1>
        <div>
            <button onClick={() => handleOpcaoMenu("cadastraPessoas") }>Cadastrar Pessoas</button>
            

        </div>
        <div>
            <button onClick={() => handleOpcaoMenu("menu")}>Retornar ao menu</button>
        </div>

        

    </div>
        
    )

}


export default Sistema;