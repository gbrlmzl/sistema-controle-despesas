"use client";
import styles from "./SeletorNumeroPessoas.module.css";
import { useState } from "react";

export default function SeletorNumeroPessoas({onConfirma, onCancela}){
    const [numeroPessoasPainel, setNumeroPessoasPainel] = useState(0);

    const handleNumeroPessoasPainel = (numero) =>{
        setNumeroPessoasPainel(numero);
    }
    
    const handleConfirmaNumeroPessoas = () => {
        if(onConfirma) {onConfirma(numeroPessoasPainel)};
    }

    const handleCancela = () => {
        if (onCancela) {onCancela()};
    }



    return(
        <div>
            <div>
                <div>
                    <h2>Número de pessoas: {numeroPessoasPainel !== 0 && numeroPessoasPainel}</h2>  
                </div>
                <div className={styles.tecladoNumerico}>
                    <button disabled={true}>1</button>
                    <button onClick={() => handleNumeroPessoasPainel(2)}>2</button>
                    <button onClick={() => handleNumeroPessoasPainel(3)}>3</button>
                    <button onClick={() => handleNumeroPessoasPainel(4)}>4</button>
                    <button onClick={() => handleNumeroPessoasPainel(5)}>5</button>
                    <button onClick={() => handleNumeroPessoasPainel(6)}>6</button>
                    <button onClick={() => handleNumeroPessoasPainel(7)}>7</button>
                    <button onClick={() => handleNumeroPessoasPainel(8)}>8</button>
                    <button onClick={() => handleNumeroPessoasPainel(9)}>9</button>
                </div>
                <div>
                    <button onClick={handleCancela}>Cancelar</button>
                    <button onClick={handleConfirmaNumeroPessoas} disabled = {numeroPessoasPainel === 0}>Confirmar</button>
                </div>             
            </div>
            
        </div>
    )

}