import Form from "next/form"
import { useEffect, useState, useRef } from "react";
import Snackbar from "../ui/Snackbar";
import styles from './DespesaInfo.module.css';


export default function DespesaInfo({ despesaDados, pessoaIndexDados, onProxima, onAnterior, onFinaliza, onProximaPessoa, onAnteriorPessoa, snackbar, onFecharSnackbar, mesAnoTexto, isUltimaDespesa, onRetornaAoMenu }) {
    const [localData, setLocalData] = useState({ numeroDespesa: "", nomePessoa: "", identificacao: "", valor: "", somaDespesas: 0 });
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalData({ numeroDespesa: despesaDados.numDespesa, nomePessoa: despesaDados.nomePessoa, identificacao: despesaDados.identificacao, valor: despesaDados.valor, somaDespesas: despesaDados.somaDespesas });
        inputRef.current.focus(); // coloca o input da identificação da despesa em foco após atualizar os dados
    }, [despesaDados]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (value.length > 50) {
            return; //limita o valor de entrada a 50 caracteres
        }
        if (name === "valor") {
            let valorFormatado = value.replace(/,/g, '.');

            valorFormatado = valorFormatado.replace(/[^0-9.]/g, '');
            const pontos = valorFormatado.match(/\./g);
            if (pontos && pontos.length > 1) {
                //se existir um ponto digitado, excluir qualquer outro ponto digitado
                return;
            }
            setLocalData((prevData) => ({ ...prevData, [name]: valorFormatado }));
            return;
        }
        setLocalData((prevData) => ({ ...prevData, [name]: value }));
    }

    const handleFormAction = (formData) => {
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

    const handleCancela = () => {
        //perguntar se deseja cancelar mesmo
        onRetornaAoMenu();
    }




    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <h3>{mesAnoTexto}</h3>

                <div className={styles.pessoaNavContainer}>
                    {/*pessoaIndexDados.isFirstPessoa && <div /> /* div gerada para fins de estilização */}
                    <button type="button" onClick={handleAnteriorPessoa} disabled={pessoaIndexDados.isFirstPessoa} >
                        <span className="botaoNavegacaoIcone">
                            <img src="/icons/anteriorNavIcon.svg" alt="Mês anterior" />
                        </span>
                    </button>
                    <div className={styles.nomePessoaContainer}>
                        <p>{localData.nomePessoa}</p>
                    </div>
                    <button type="button" onClick={handleProximaPessoa} disabled={pessoaIndexDados.isLastPessoa} >
                        <span className="botaoNavegacaoIcone">
                            <img src="/icons/avancarNavIcon.svg" alt="Próximo mês" />
                        </span>
                    </button>
                    {/*pessoaIndexDados.isLastPessoa && <div/> /* div gerada para fins de estilização */}
                </div>
                <div className={styles.somatorioContainer}>
                    <p>Despesa nº {localData.numeroDespesa} de {localData.nomePessoa}</p>
                    <p>Subtotal: R$ {localData.somaDespesas.toFixed(2)}</p>
                </div>


            </div>
            <Form className={styles.formContainer} action={handleFormAction}>
                <div className={styles.formCamposContainer}>
                    <input type="text" name="identificacao" value={localData.identificacao} onChange={handleChange} placeholder="Identificação" ref={inputRef} required />
                    <input type="text" name="valor" value={localData.valor} onChange={handleChange} placeholder="Valor" required />
                </div>


                <div className={styles.despesaNavContainer}>
                    <button type="button" onClick={handleAnterior} disabled={(localData.numeroDespesa - 1) === 0} >
                        <span className="botaoIcone">
                            <img src="/icons/retornarIcon.svg" alt="Despesa anterior" />
                        </span>
                    </button>
                    <button type="submit">
                        {isUltimaDespesa ?
                            <span className="botaoIcone">
                                <img src="/icons/adicionarIcon.svg" alt="Adicionar despesa" />
                            </span> :
                            <span className="botaoIcone">
                                <img src="/icons/avancarIcon.svg" alt="Próxima despesa" />
                            </span>}
                    </button>
                </div>
                <div className={styles.botoesCancelaFinalizaContainer}>
                    <button className={styles.botaoCancelaFinaliza} type="button" onClick={handleCancela}>
                        Cancelar
                    </button>
                    <button className={styles.botaoCancelaFinaliza} type="button" disabled={!pessoaIndexDados.isLastPessoa} onClick={handleFinaliza}>
                        Finalizar
                    </button>


                </div>

            </Form>
            <div>
                <Snackbar open={snackbar.open} message={snackbar.message} onClose={onFecharSnackbar} type={snackbar.type} />
            </div>

        </div>

    )
}