'use client'

import Link from "next/link";

import useAcoesResidencia from "./useAcoesResidencia";
import ListaMembros from "./ListaMembros";
import PendenciasResidencia from "./PendenciasResidencia";
import ConfirmacaoModal from "./ConfirmacaoModal";
import Snackbar from "@/components/ui/Snackbar";
import styles from "./PainelResidencia.module.css";

//FEAT-008 -> Painel da residência.
//As opções de administração ficam na tela de configurações, acessível pela engrenagem.
//Os botões de despesas ficam desabilitados até que as despesas por residência (EP-04) existam.
export default function PainelResidencia({ residencia, solicitacoes, convites }) {
    const {
        confirmacao,
        fecharConfirmacao,
        processando,
        confirmarSaida,
        confirmarRemocao,
        confirmarTransferencia,
        responderSolicitacao,
        cancelarConvite,
        snackbar,
        fecharSnackbar,
    } = useAcoesResidencia(residencia);

    //RN-032 -> residência arquivada é somente leitura, então a gestão de membros
    //fica indisponível até que ela seja desarquivada.
    const podeGerenciar = residencia.isOwner && !residencia.isArchived;

    return (
        <div className={styles.container}>
            <div className={styles.barraSuperior}>
                <Link href="/app/residences" className={styles.botaoCanto} aria-label="Retornar às residências" title="Retornar às residências">
                    <img src="/icons/voltarIcon.svg" alt="Retornar às residências" width={22} height={22} />
                </Link>

                {/* Só o owner administra a residência, então só ele vê a engrenagem */}
                {residencia.isOwner && (
                    <Link href={`/app/residences/${residencia.code}/settings`} className={styles.botaoCanto}
                        aria-label="Configurações da residência" title="Configurações da residência">
                        <img src="/icons/engrenagemIcon.svg" alt="Configurações da residência" width={22} height={22} />
                    </Link>
                )}
            </div>

            <div className={styles.tituloContainer}>
                <h2>{residencia.name}</h2>
                <p className={styles.codigoResidencia}>{residencia.code}</p>
                <div className={styles.criadorContainer}>
                    <img src="/icons/adminIcon.svg" alt="Criador da residência" width={14} height={14} />
                    <span>{residencia.ownerName}</span>
                </div>
                {residencia.isArchived && (
                    <span className={styles.seloArquivada}>Arquivada · somente leitura</span>
                )}
            </div>

            <div className={styles.botoesContainer}>
                <button type="button" className={styles.botaoDespesas} disabled title="Consulta de despesas em breve">
                    Consultar despesas
                </button>
                <button type="button" className={styles.botaoDespesas} disabled
                    title={residencia.isArchived ? "Residência arquivada" : "Cadastro de despesas em breve"}>
                    Cadastrar despesas
                </button>
            </div>

            {/* US-009 e US-022 -> pendências que só o owner enxerga */}
            <PendenciasResidencia
                solicitacoes={solicitacoes}
                convites={convites}
                processando={processando}
                onResponderSolicitacao={responderSolicitacao}
                onCancelarConvite={cancelarConvite} />

            <ListaMembros
                membros={residencia.members}
                podeGerenciar={podeGerenciar}
                onRemover={confirmarRemocao}
                onTransferir={confirmarTransferencia} />

            {/* CA-5 da US-013 -> o owner não vê a opção de sair */}
            {!residencia.isOwner && (
                <div className={styles.acoesResidencia}>
                    <button type="button" className={styles.botaoPerigo} onClick={confirmarSaida}>
                        Sair da residência
                    </button>
                </div>
            )}

            {confirmacao && (
                <ConfirmacaoModal
                    titulo={confirmacao.titulo}
                    mensagem={confirmacao.mensagem}
                    textoConfirmar={confirmacao.textoConfirmar}
                    processando={processando}
                    onConfirmar={confirmacao.onConfirmar}
                    onCancelar={fecharConfirmacao} />
            )}

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={fecharSnackbar} />
        </div>
    )
}
