import { useCallback, useEffect, useState } from "react";

export default function useResidencias() {
    const [residencias, setResidencias] = useState([]);
    const [convitesRecebidos, setConvitesRecebidos] = useState([]);
    const [solicitacoesEnviadas, setSolicitacoesEnviadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "" });


    const recarregar = useCallback(async () => {
        try {
            const resposta = await fetch("/api/residences");
            const conteudo = await resposta.json();

            if (!resposta.ok || !conteudo.success) {
                setErro(conteudo.message || "Erro ao buscar residências");
                return;
            }

            setResidencias(conteudo.data.residencias);
            setConvitesRecebidos(conteudo.data.convitesRecebidos);
            setSolicitacoesEnviadas(conteudo.data.solicitacoesEnviadas);
            setErro(null);

        } catch (error) {
            setErro("Erro ao buscar residências");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        recarregar();
    }, [recarregar]);


    //FEAT-007 -> Copia o código para a área de transferência. Se o navegador negar
    //o acesso (contexto não seguro, permissão negada), exibe o código para cópia manual.
    const copiarCodigo = async (codigo) => {
        try {
            await navigator.clipboard.writeText(codigo);
            mostrarSnackbar({ msg: "Código copiado!", type: "success", time: 3000 });
        } catch (error) {
            mostrarSnackbar({ msg: `Copie o código manualmente: ${codigo}`, type: "warning" });
        }
    }

    const mostrarSnackbar = ({ msg, type, time }) => {
        setSnackbar({ open: true, message: msg, type: type });
        if (time) {
            setTimeout(() => {
                setSnackbar({ open: false, message: "", type: "" });
            }, time);
        }

    }

    const fecharSnackbar = () => {
        setSnackbar({ open: false, message: "", type: "" });
    }


    return {
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
    }

}
