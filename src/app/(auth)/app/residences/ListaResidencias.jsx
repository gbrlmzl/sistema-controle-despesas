'use client'

import Link from "next/link";
import { useState } from "react";

import useResidencias from "@/hooks/useResidencias";
import Loading from "@/components/ui/Loading";
import Snackbar from "@/components/ui/Snackbar";
import PendenciasAcesso from "./PendenciasAcesso";
import styles from './ListaResidencias.module.css';


export default function ListaResidencias() {
    const {
        residencias,
        convitesRecebidos,
        solicitacoesEnviadas,
        loading,
        erro,
        recarregar,
        copiarCodigo,
        snackbar,
        mostrarSnackbar,
        fecharSnackbar,
    } = useResidencias();

    //Traduz a resposta de uma ação de pendência em feedback visual
    const exibirRespostaDaAcao = (resposta) => {
        mostrarSnackbar({
            msg: resposta?.message || "Não foi possível concluir a ação",
            type: resposta?.success ? "success" : "error",
            time: 4000,
        });
    }
    //Q-7 -> as arquivadas aparecem em uma seção própria, recolhida por padrão.
    //Escondê-las por completo passaria a impressão de que os dados foram perdidos.
    const [mostrarArquivadas, setMostrarArquivadas] = useState(false);

    const residenciasAtivas = residencias.filter(residencia => !residencia.isArchived);
    const residenciasArquivadas = residencias.filter(residencia => residencia.isArchived);

    const itemResidencia = (residencia) => (
        <li key={residencia.code} className={styles.residenciaContainer}>
            <div className={styles.residenciaInfo}>
                <h3>{residencia.name}</h3>
                <div className={styles.criadorContainer}>
                    <img src="/icons/adminIcon.svg" alt="Criador da residência" width={14} height={14} />
                    <span>{residencia.ownerName}</span>
                </div>
            </div>
            <div className={styles.residenciaAcoes}>
                <button type="button" onClick={() => copiarCodigo(residencia.code)} title="Copiar código da residência">
                    <span className={styles.botaoAcao}>
                        <img src="/icons/copiarIcon.svg" alt="Copiar código da residência" />
                    </span>
                </button>
                <Link href={`/app/residences/${residencia.code}`} title="Ver residência">
                    <span className={styles.botaoAcao}>
                        <img src="/icons/avancarIcon.svg" alt="Ver residência" />
                    </span>
                </Link>
            </div>
        </li>
    );

    const barraSuperior = (
        <div className={styles.barraSuperior}>
            <Link href="/app" className={styles.botaoCanto} aria-label="Retornar ao menu" title="Retornar ao menu">
                <img src="/icons/voltarIcon.svg" alt="Retornar ao menu" width={22} height={22} />
            </Link>
        </div>
    );

    if (loading) {
        return (
            <div className={styles.container}>
                {barraSuperior}
                <h2>Residências</h2>
                <Loading />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {barraSuperior}
            <h2>Residências</h2>

            {erro && (
                <div className={styles.errorMessage}>
                    <span>{erro}</span>
                </div>
            )}

            <PendenciasAcesso
                convites={convitesRecebidos}
                solicitacoes={solicitacoesEnviadas}
                onAtualizar={recarregar}
                onMensagem={exibirRespostaDaAcao} />

            {!erro && residencias.length === 0 && (
                <p className={styles.listaVazia}>Você não está cadastrado em nenhuma residência</p>
            )}

            {residenciasAtivas.length > 0 && (
                <ul className={styles.lista}>
                    {residenciasAtivas.map(itemResidencia)}
                </ul>
            )}

            {residenciasArquivadas.length > 0 && (
                <div className={styles.secaoArquivadas}>
                    <button type="button" className={styles.botaoArquivadas}
                        onClick={() => setMostrarArquivadas(prev => !prev)}
                        aria-expanded={mostrarArquivadas}>
                        Arquivadas ({residenciasArquivadas.length})
                    </button>

                    {mostrarArquivadas && (
                        <ul className={styles.lista}>
                            {residenciasArquivadas.map(itemResidencia)}
                        </ul>
                    )}
                </div>
            )}

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={fecharSnackbar} />
        </div>
    )
}
