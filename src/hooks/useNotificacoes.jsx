import { useCallback, useEffect, useState } from "react";

//RN-035 -> o painel do sino mostra apenas as 5 mais recentes
const LIMITE_PAINEL = 5;
//O servidor não empurra eventos para o navegador, então o contador é verificado
//periodicamente. 30s mantém o sino perceptivelmente "vivo" sem gerar tráfego relevante.
const INTERVALO_VERIFICACAO = 30000;

export default function useNotificacoes() {
    const [notificacoes, setNotificacoes] = useState([]);
    const [naoLidas, setNaoLidas] = useState(0);
    const [loading, setLoading] = useState(true);
    const [painelAberto, setPainelAberto] = useState(false);

    const buscarNotificacoes = useCallback(async () => {
        try {
            const resposta = await fetch(`/api/notifications?limite=${LIMITE_PAINEL}`);
            const conteudo = await resposta.json();

            if (!resposta.ok || !conteudo.success) {
                return;
            }

            setNotificacoes(conteudo.data.notificacoes);
            setNaoLidas(conteudo.data.naoLidas);

        } catch (error) {
            //Falha ao buscar notificação não deve quebrar a navegação: o sino
            //apenas continua exibindo o último estado conhecido.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        buscarNotificacoes();

        //Só verifica com a aba visível: em segundo plano o usuário não veria o sino mudar
        const intervalo = setInterval(() => {
            if (document.visibilityState === "visible") {
                buscarNotificacoes();
            }
        }, INTERVALO_VERIFICACAO);

        //Voltar para a aba é justamente quando o número desatualizado mais incomoda
        const aoVoltarParaAba = () => buscarNotificacoes();
        window.addEventListener("focus", aoVoltarParaAba);

        return () => {
            clearInterval(intervalo);
            window.removeEventListener("focus", aoVoltarParaAba);
        };
    }, [buscarNotificacoes]);


    //RN-036 -> ao abrir o painel, as notificações exibidas passam a contar como lidas
    const alternarPainel = async () => {
        const vaiAbrir = !painelAberto;
        setPainelAberto(vaiAbrir);

        if (!vaiAbrir) {
            return;
        }

        await buscarNotificacoes();

        const idsNaoLidos = notificacoes.filter(n => !n.isRead).map(n => n.id);
        if (idsNaoLidos.length === 0) {
            return;
        }

        try {
            const resposta = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: idsNaoLidos }),
            });
            const conteudo = await resposta.json();

            if (resposta.ok && conteudo.success) {
                setNaoLidas(conteudo.data.naoLidas);
            }

        } catch (error) {
            //Não conseguir marcar como lida não impede o usuário de ver o painel
        }
    }

    const fecharPainel = () => setPainelAberto(false);


    return {
        notificacoes,
        naoLidas,
        loading,
        painelAberto,
        alternarPainel,
        fecharPainel,
    }

}
