//Valores são guardados em centavos (inteiro) para que as somas sejam exatas.
//Ponto flutuante acumula erro de arredondamento, e o rateio futuro depende de totais confiáveis.

export function formatarValor(centavos: number): string {
    const valor = Number.isFinite(centavos) ? centavos : 0;
    return (valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

//Converte o que o usuário digitou em centavos.
//Aceita "180,50", "180.50", "1.234,56" e "R$ 180,50". Retorna null se não for um valor válido.
export function parseValorParaCentavos(texto: string | number): number | null {
    if (typeof texto === "number") {
        return Number.isFinite(texto) ? Math.round(texto * 100) : null;
    }

    if (typeof texto !== "string") {
        return null;
    }

    let limpo = texto.trim().replace(/\s/g, "").replace(/^R\$/i, "");

    if (!limpo) {
        return null;
    }

    //Com vírgula presente, ela é o separador decimal e o ponto vira separador de milhar
    if (limpo.includes(",")) {
        limpo = limpo.replace(/\./g, "").replace(",", ".");
    }

    if (!/^\d+(\.\d{1,2})?$/.test(limpo)) {
        return null;
    }

    return Math.round(Number(limpo) * 100);
}
