import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

//CA-4 da US-016 -> a notificação exibe o momento em que ocorreu.
//Tempo relativo ("há 2 horas") comunica melhor que data absoluta em uma lista de avisos.
export function formatarMomento(data) {
    if (!data) {
        return "";
    }

    return formatDistanceToNow(new Date(data), { addSuffix: true, locale: ptBR });
}
