'use client'

import Link from "next/link";

import useAcoesResidencia from "../useAcoesResidencia";
import ConfirmacaoModal from "../ConfirmacaoModal";
import RenomearResidenciaModal from "../RenomearResidenciaModal";
import ConvidarUsuarioModal from "../ConvidarUsuarioModal";
import Snackbar from "@/components/ui/Snackbar";
import styles from "./ConfiguracoesResidencia.module.css";

//Tela de administração da residência, acessível pela engrenagem do painel.
//Reúne as ações que antes ficavam soltas no painel: convidar (FEAT-014),
//renomear (FEAT-012), gerar novo código (FEAT-019) e arquivar (FEAT-012).
export default function ConfiguracoesResidencia({ residencia, abrirConviteInicial }) {
    const {
        confirmacao,
        fecharConfirmacao,
        processando,
        renomeando,
        abrirRenomear,
        fecharRenomear,
        convidando,
        abrirConvidar,
        fecharConvidar,
        confirmarArquivamento,
        confirmarRegeneracao,
        snackbar,
        fecharSnackbar,
    } = useAcoesResidencia(residencia, abrirConviteInicial);

    //RN-032 -> enquanto arquivada, a única ação de escrita permitida é desarquivar
    const somenteLeitura = residencia.isArchived;

    return (
        <div className={styles.container}>
            <div className={styles.barraSuperior}>
                <Link href={`/app/residences/${residencia.code}`} className={styles.botaoCanto}
                    aria-label="Retornar à residência" title="Retornar à residência">
                    <img src="/icons/voltarIcon.svg" alt="Retornar à residência" width={22} height={22} />
                </Link>
            </div>

            <div className={styles.tituloContainer}>
                <h2>Configurações</h2>
                <p className={styles.nomeResidencia}>{residencia.name}</p>
                {somenteLeitura && (
                    <span className={styles.seloArquivada}>Arquivada · somente leitura</span>
                )}
            </div>

            {somenteLeitura && (
                <p className={styles.avisoArquivada}>
                    Enquanto a residência estiver arquivada, as demais configurações ficam indisponíveis.
                    Desarquive-a para voltar a administrá-la.
                </p>
            )}

            <div className={styles.opcoesContainer}>
                <button type="button" className={styles.botaoOpcao} onClick={abrirConvidar} disabled={somenteLeitura}>
                    Convidar usuário
                </button>
                <button type="button" className={styles.botaoOpcao} onClick={abrirRenomear} disabled={somenteLeitura}>
                    Renomear residência
                </button>
                <button type="button" className={styles.botaoOpcao} onClick={confirmarRegeneracao} disabled={somenteLeitura}>
                    Gerar novo código
                </button>
                <button type="button" className={styles.botaoOpcao} onClick={confirmarArquivamento}>
                    {residencia.isArchived ? "Desarquivar residência" : "Arquivar residência"}
                </button>
            </div>

            {confirmacao && (
                <ConfirmacaoModal
                    titulo={confirmacao.titulo}
                    mensagem={confirmacao.mensagem}
                    textoConfirmar={confirmacao.textoConfirmar}
                    processando={processando}
                    onConfirmar={confirmacao.onConfirmar}
                    onCancelar={fecharConfirmacao} />
            )}

            {renomeando && (
                <RenomearResidenciaModal residencia={residencia} onFechar={fecharRenomear} />
            )}

            {convidando && (
                <ConvidarUsuarioModal residencia={residencia} onFechar={fecharConvidar} />
            )}

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={fecharSnackbar} />
        </div>
    )
}
