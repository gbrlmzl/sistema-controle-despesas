import Form from "next/form"
import { useEffect, useState, useRef } from "react";

export default function DespesaInfo({despesaDados, pessoaIndexDados, onProxima, onAnterior, onFinaliza, onProximaPessoa, onAnteriorPessoa}) {
    const [localData, setLocalData] = useState({numeroDespesa : "", nomePessoa: "", identificacao: "", valor: "", somaDespesas: 0});
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalData({numeroDespesa : despesaDados.numDespesa, nomePessoa: despesaDados.nomePessoa, identificacao: despesaDados.identificacao, valor: despesaDados.valor, somaDespesas: despesaDados.somaDespesas });
        inputRef.current.focus(); // coloca o input da identificação da despesa em foco após atualizar os dados
    }, [despesaDados]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalData((prevData) => ({ ...prevData, [name]: value }));
    }

    const handleFormAction = (formData) =>{
        onProxima(formData);
    }

    const handleAnterior = () => {
        onAnterior();
    }

    const handleProximaPessoa = () => {
        onProximaPessoa();
    }

    const handleAnteriorPessoa = () => {
        onAnteriorPessoa();
    }

    const handleFinaliza = () => {
        onFinaliza();
    }


    return (
        <div>
            <div className="subtitulo">
                <h3>Despesa nº {localData.numeroDespesa} de {localData.nomePessoa}</h3>
                <h3>Subtotal: R$ {localData.somaDespesas}</h3>
            </div>
            <div className="formDespesas">
                <Form action={handleFormAction}>
                    <div>
                        <input type="text" name="identificacao" value={localData.identificacao} onChange={handleChange} placeholder="Identificação" ref={inputRef} required />
                        <input type="text" name="valor" value={localData.valor} onChange={handleChange} placeholder="Valor"  required  />
                    </div>
                    <div>
                        <button type = "button" onClick={handleAnterior} disabled = {(localData.numeroDespesa - 1) === 0} >
                            Anterior
                        </button>
                        <button type="submit"> 
                            Próxima
                        </button>
                    </div>
                    <div>
                        <h4>Pessoas</h4>
                        <button type="button" onClick={handleAnteriorPessoa} disabled={pessoaIndexDados.isFirstPessoa}>
                            Anterior
                        </button>
                        <button type="button" onClick={handleProximaPessoa} disabled={pessoaIndexDados.isLastPessoa}>
                            Próxima
                        </button>
                    </div>
                    <div>
                        <button type="button" disabled={!pessoaIndexDados.isLastPessoa} onClick={handleFinaliza}>
                            Finalizar 
                        </button>
                    </div>

                </Form>
            </div>
        </div>

    )
}