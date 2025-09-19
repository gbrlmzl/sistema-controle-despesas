import Form from "next/form"
import { useState } from "react";

export default function DespesaInfo({nomePessoa, numDespesa, somaDespesas, onProxima, onAnterior, onFinaliza, proximaPessoa}) {
    const [localData, setLocalData] = useState({ identificacao: "", valor: "" });

    const handleFormAction = (formData) =>{
        onProxima(formData);
    }

    const handleAnterior = () => {
        console.log("Anterior");
        //onAnterior(localData); ==> Criar função onAnterior no hook
    }


    return (
        <div>
            <div className="subtitulo">
                <h3>Despesa nº {numDespesa + 1} de {nomePessoa}</h3>
                <h3>Total R$: {somaDespesas}</h3>
            </div>
            <div className="formDespesas">
                <Form action={handleFormAction}>
                    <div>
                        <input type="text" name="identificacao" placeholder="Identificação" required />
                        <input type="text" name="valor" placeholder="Valor" required  />
                    </div>
                    <div>
                        <button type = "button" onClick={handleAnterior} disabled = {numDespesa === 0} >
                            Anterior
                        </button>
                        <button type="submit"> 
                            Próxima
                        </button>
                    </div>
                    <div>
                        <button type="submit">
                            Finalizar
                        </button>
                    </div>

                </Form>
            </div>
        </div>

    )
}