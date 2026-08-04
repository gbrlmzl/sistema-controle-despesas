'use client'

import styles from './ConfirmacaoModal.module.css';

//Modal de confirmação reutilizado pelas ações destrutivas ou irreversíveis do painel:
//sair da residência, remover membro, transferir propriedade e arquivar.
export default function ConfirmacaoModal({ titulo, mensagem, textoConfirmar, processando, onConfirmar, onCancelar }) {

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="tituloConfirmacao">
            <div className={styles.modal}>
                <div className={styles.mensagemContainer}>
                    <h3 id="tituloConfirmacao">{titulo}</h3>
                    <p>{mensagem}</p>
                </div>

                <div className="botoesContainer">
                    <button type="button" className="botaoTexto" onClick={onCancelar} disabled={processando}>Cancelar</button>
                    <button type="button" className="botaoTexto" onClick={onConfirmar} disabled={processando}>{textoConfirmar}</button>
                </div>
            </div>
        </div>
    )
}
