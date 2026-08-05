//RN-067 -> ponto e vírgula como separador e vírgula como decimal: é o formato que o
//Excel em português abre direto, sem passar pelo assistente de importação.
const SEPARADOR = ";";

function escapar(valor) {
    const texto = String(valor ?? "");
    //Aspas duplicadas e o campo entre aspas é o escape padrão de CSV
    return `"${texto.replace(/"/g, '""')}"`;
}

export function gerarCsv(cabecalhos, linhas) {
    const conteudo = [
        cabecalhos.map(escapar).join(SEPARADOR),
        ...linhas.map(linha => linha.map(escapar).join(SEPARADOR)),
    ].join("\r\n");

    //BOM para o Excel reconhecer o UTF-8 e não quebrar os acentos
    return `﻿${conteudo}`;
}

export function baixarCsv(nomeArquivo, conteudo) {
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
