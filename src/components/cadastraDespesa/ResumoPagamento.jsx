import { useRef } from "react";

export default function ResumoPagamento({ dataEmTexto, dadosPagamento, onRetornaAoMenu, onCompartilhar }) {

    const resumoRef = useRef();
    const handleOk = () => {
        onRetornaAoMenu();
    }
    
    const handleCompartilhar = () => {
        onCompartilhar(resumoRef);
    }



    return (
        <div ref={resumoRef}>
            <h2>Resumo financeiro de {dataEmTexto()}</h2>
            <div>
                <div>
                    <h3>Recebem</h3>
                    <ul>
                        {dadosPagamento.filter(pessoa => pessoa.recebe).map(pessoa => (
                                <li key={pessoa.nomePessoa}>
                                    {pessoa.nomePessoa} recebe {pessoa.quantia.toFixed(2)} R$
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div>
                    <h3>Pagam</h3>
                    <ul>
                        {dadosPagamento.filter(pessoa => pessoa.paga).map(pessoa => (
                                <li key={pessoa.nomePessoa}>
                                    {pessoa.nomePessoa} paga {pessoa.quantia.toFixed(2)} R$
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div>
                    <button onClick={handleOk}>OK</button>
                    <button onClick={handleCompartilhar}>Compartilhar</button>
                </div>
            </div>
        </div>
    )



}