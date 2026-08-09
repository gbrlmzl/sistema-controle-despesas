import { useCallback, useEffect, useState } from "react";
import type { NotificationType } from "@/generated/client";

interface Notificacao {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    linkTo: string | null;
    readAt: string | null;
    createdAt: string;
    isRead: boolean;
}

interface RespostaListagem {
    success: boolean;
    message?: string;
    data: {
        notificacoes: Notificacao[];
        totalPaginas: number;
        naoLidas: number;
    };
}

interface RespostaAtualizacao {
    success: boolean;
    message?: string;
}

export default function useAlertas() {
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [naoLidas, setNaoLidas] = useState(0);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);


    const buscarNotificacoes = useCallback(async (paginaDesejada: number) => {
        setLoading(true);
        try {
            const resposta = await fetch(`/api/notifications?pagina=${paginaDesejada}`);
            const conteudo = await resposta.json() as RespostaListagem;

            if (!resposta.ok || !conteudo.success) {
                setErro(conteudo.message || "Erro ao buscar notificações");
                return;
            }

            setNotificacoes(conteudo.data.notificacoes);
            setTotalPaginas(conteudo.data.totalPaginas);
            setNaoLidas(conteudo.data.naoLidas);
            setErro(null);

        } catch (error) {
            setErro("Erro ao buscar notificações");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        buscarNotificacoes(pagina);
    }, [pagina, buscarNotificacoes]);


    //CA-5 da US-021 -> marcar todas como lidas
    const marcarTodasComoLidas = async () => {
        try {
            const resposta = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ todas: true }),
            });
            const conteudo = await resposta.json() as RespostaAtualizacao;

            if (!resposta.ok || !conteudo.success) {
                setErro(conteudo.message || "Erro ao atualizar notificações");
                return;
            }

            await buscarNotificacoes(pagina);

        } catch (error) {
            setErro("Erro ao atualizar notificações");
        }
    }

    const irParaPagina = (novaPagina: number) => {
        if (novaPagina < 1 || novaPagina > totalPaginas) {
            return;
        }
        setPagina(novaPagina);
    }


    return {
        notificacoes,
        pagina,
        totalPaginas,
        naoLidas,
        loading,
        erro,
        marcarTodasComoLidas,
        irParaPagina,
    }

}
