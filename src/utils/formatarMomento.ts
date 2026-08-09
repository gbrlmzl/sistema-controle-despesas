import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";

//CA-4 da US-016 -> a notificação exibe o momento em que ocorreu.
//Tempo relativo ("há 2 horas") comunica melhor que data absoluta em uma lista de avisos.
//A versão "strict" é usada de propósito: a padrão arredonda e escreve "há cerca de
//2 horas", e esse "cerca de" só ocupa espaço sem acrescentar informação.
export function formatarMomento(data: Date | string | number | null | undefined): string {
    if (!data) {
        return "";
    }

    return formatDistanceToNowStrict(new Date(data), { addSuffix: true, locale: ptBR });
}
