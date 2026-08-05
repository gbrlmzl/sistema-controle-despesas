import Aviso from "./Aviso";
import {useFormatarSistema} from "../../hooks/useFormatarSistema";
import Confirmacao from "./Confirmacao";
import ResumoFormatacao from "./ResumoFormatacao";



export default function FormatarSistema({ handleOpcaoMenu, atualizarDadosLocais }) {
    const {
        etapa,
        loading,
        decisaoProsseguir,
        confirmarFormatacao,
        resultadoFormatacaoData,
        

    } = useFormatarSistema(handleOpcaoMenu, atualizarDadosLocais);


    const retornarAoMenu = () => {
        handleOpcaoMenu("menu");
    }



    if (etapa === "aviso") {
        return (
            <Aviso
                handleProsseguir={(prosseguir) => decisaoProsseguir(prosseguir)}

            />

        )
    } else if (etapa === "confirmacao") {
        return (
            <Confirmacao
                onRetornaAoMenu={retornarAoMenu}
                onConfirmaFormatacao={(textoConfirmacao) => confirmarFormatacao(textoConfirmacao)}
                loading={loading}

            />
        )

    } else if (etapa === "resumo") {
        return (
            <ResumoFormatacao
                resultadoFormatacaoData={resultadoFormatacaoData}
                onRetornaAoMenu={retornarAoMenu}
                />
        )
    }

}