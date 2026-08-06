'use client'

import Link from "next/link";

import useNotificacoes from "@/hooks/useNotificacoes";
import { formatarMomento } from "@/utils/formatarMomento";
import styles from "./SinoNotificacoes.module.css";

//FEAT-017 / US-016 -> sino de notificações na barra de navegação.
export default function SinoNotificacoes() {
    const { notificacoes, naoLidas, painelAberto, alternarPainel, fecharPainel } = useNotificacoes();

    return (
        <div className={styles.container}>
            <button type="button" onClick={alternarPainel} aria-expanded={painelAberto} aria-label="Notificações">
                <span className={styles.sino}>
                    <img src="/icons/sinoIcon.svg" alt="Notificações" width={22} height={22} />
                    {/* CA-2 -> indicador com a quantidade de não lidas */}
                    {naoLidas > 0 && (
                        <span className={styles.indicador}>{naoLidas > 9 ? "9+" : naoLidas}</span>
                    )}
                </span>
            </button>

            {painelAberto && (
                <div className={styles.painel}>
                    {notificacoes.length === 0 ? (
                        <p className={styles.vazio}>Você não tem notificações</p>
                    ) : (
                        <ul className={styles.lista}>
                            {notificacoes.map(notificacao => (
                                <li key={notificacao.id} className={notificacao.isRead ? styles.item : styles.itemNaoLido}>
                                    {/* CA-10 -> clicar leva ao contexto da notificação */}
                                    <Link href={notificacao.linkTo || "/app/alerts"} onClick={fecharPainel}>
                                        <span className={styles.itemTitulo}>{notificacao.title}</span>
                                        <span className={styles.itemMensagem}>{notificacao.message}</span>
                                        <span className={styles.itemData}>{formatarMomento(notificacao.createdAt)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link href="/app/alerts" className={styles.mostrarTudo} onClick={fecharPainel}>Mostrar tudo</Link>
                </div>
            )}
        </div>
    )
}
