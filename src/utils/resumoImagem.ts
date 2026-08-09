import { formatarValor } from "./dinheiro";
import { competenciaTexto } from "./categorias";

//FEAT-034 -> o resumo é desenhado em SVG e rasterizado em PNG.
//Desenhar em vez de capturar a tela garante que a imagem saia igual em qualquer
//navegador: não há CSS a reinterpretar, sombra a aproximar nem fonte a adivinhar.

const LARGURA = 640;
const PADDING = 32;
const ALTURA_CABECALHO = 132;
const ALTURA_TOTAL = 118;
const ALTURA_LINHA = 48;
const ALTURA_TITULO_SECAO = 46;
const ALTURA_RODAPE = 46;
const ESCALA = 2; //rasteriza em 2x para a imagem não ficar borrada em tela de celular

const AZUL = "#2497F3";
const VERDE = "#1E7A3C";
const VERMELHO = "#C0392B";
const CINZA = "#5A5A5A";

interface Residencia {
    name: string;
    code: string;
}

interface Competencia {
    month: number;
    year: number;
}

interface Participante {
    name: string;
    gastoInCents: number;
    saldoInCents: number;
}

interface ResumoDaResidencia {
    residencia: Residencia;
    competencia: Competencia;
    totalInCents: number;
    participantes: Participante[];
}

function escaparXml(texto: string | null | undefined): string {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

//O rasterizador do canvas não enxerga as fontes carregadas pela página, então a
//fonte precisa viajar dentro do próprio SVG, embutida em base64.
async function carregarFonteEmBase64(): Promise<string | null> {
    try {
        const resposta = await fetch("/fonts/RobotoCondensed.woff2");
        if (!resposta.ok) {
            return null;
        }

        const buffer = await resposta.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binario = "";

        //Em blocos, porque String.fromCharCode estoura a pilha com arrays grandes
        const bloco = 0x8000;
        for (let i = 0; i < bytes.length; i += bloco) {
            binario += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + bloco)));
        }

        return `data:font/woff2;base64,${btoa(binario)}`;
    } catch (erro) {
        //Sem a fonte embutida a imagem ainda é gerada, apenas com a fonte padrão
        return null;
    }
}

function montarSvg({ residencia, competencia, totalInCents, participantes, fonteBase64 }: ResumoDaResidencia & { fonteBase64: string | null }): string {
    const altura = ALTURA_CABECALHO + ALTURA_TOTAL + ALTURA_TITULO_SECAO
        + (participantes.length * ALTURA_LINHA) + ALTURA_RODAPE;

    const fonte = fonteBase64
        ? `@font-face{font-family:'Roboto Condensed';src:url('${fonteBase64}') format('woff2');font-weight:400;font-style:normal;}`
        : "";

    const yInicioLinhas = ALTURA_CABECALHO + ALTURA_TOTAL + ALTURA_TITULO_SECAO;

    const linhas = participantes.map((participante, indice) => {
        const y = yInicioLinhas + (indice * ALTURA_LINHA);
        const saldo = participante.saldoInCents;
        const cor = saldo > 0 ? VERDE : saldo < 0 ? VERMELHO : CINZA;
        const situacao = saldo > 0
            ? `recebe ${formatarValor(saldo)}`
            : saldo < 0
                ? `paga ${formatarValor(Math.abs(saldo))}`
                : "quitado";

        return `
    <rect x="${PADDING}" y="${y}" width="${LARGURA - PADDING * 2}" height="${ALTURA_LINHA - 8}" rx="8" fill="${indice % 2 === 0 ? "#F4F4F4" : "#FFFFFF"}"/>
    <text class="nome" x="${PADDING + 16}" y="${y + 26}">${escaparXml(participante.name)}</text>
    <text class="gasto" x="${PADDING + 16}" y="${y + 38}">gastou ${formatarValor(participante.gastoInCents)}</text>
    <text class="situacao" x="${LARGURA - PADDING - 16}" y="${y + 30}" text-anchor="end" fill="${cor}">${escaparXml(situacao)}</text>`;
    }).join("");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${altura}" viewBox="0 0 ${LARGURA} ${altura}">
  <style>
    ${fonte}
    text { font-family: 'Roboto Condensed', 'Arial Narrow', sans-serif; }
    .titulo { font-size: 30px; font-weight: 700; fill: #FFFFFF; }
    .subtitulo { font-size: 17px; fill: #E3F1FD; }
    .rotulo { font-size: 15px; fill: ${CINZA}; }
    .valor { font-size: 40px; font-weight: 700; fill: ${AZUL}; }
    .secao { font-size: 18px; font-weight: 700; fill: #111111; }
    .nome { font-size: 17px; font-weight: 700; fill: #111111; }
    .gasto { font-size: 12px; fill: ${CINZA}; }
    .situacao { font-size: 16px; font-weight: 700; }
    .rodape { font-size: 13px; fill: #9A9A9A; }
  </style>

  <rect x="0" y="0" width="${LARGURA}" height="${altura}" fill="#FFFFFF"/>

  <rect x="0" y="0" width="${LARGURA}" height="${ALTURA_CABECALHO}" fill="${AZUL}"/>
  <text class="titulo" x="${PADDING}" y="60">${escaparXml(residencia.name)}</text>
  <text class="subtitulo" x="${PADDING}" y="94">${escaparXml(competenciaTexto(competencia.month, competencia.year))}</text>

  <text class="rotulo" x="${PADDING}" y="${ALTURA_CABECALHO + 34}">Total da residência</text>
  <text class="valor" x="${PADDING}" y="${ALTURA_CABECALHO + 82}">${formatarValor(totalInCents)}</text>

  <text class="secao" x="${PADDING}" y="${ALTURA_CABECALHO + ALTURA_TOTAL + 26}">Rateio entre os membros</text>
  ${linhas}

  <text class="rodape" x="${LARGURA / 2}" y="${altura - 16}" text-anchor="middle">Gerado pelo Cronos</text>
</svg>`;
}

async function svgParaPng(svg: string, largura: number, altura: number): Promise<Blob | null> {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));

    try {
        const imagem = new Image();
        imagem.src = url;
        await imagem.decode();

        const canvas = document.createElement("canvas");
        canvas.width = largura * ESCALA;
        canvas.height = altura * ESCALA;

        const contexto = canvas.getContext("2d")!;
        contexto.scale(ESCALA, ESCALA);
        contexto.drawImage(imagem, 0, 0, largura, altura);

        return await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    } finally {
        URL.revokeObjectURL(url);
    }
}

export async function compartilharResumoDaResidencia({ residencia, competencia, totalInCents, participantes }: ResumoDaResidencia) {
    const fonteBase64 = await carregarFonteEmBase64();
    const svg = montarSvg({ residencia, competencia, totalInCents, participantes, fonteBase64 });

    const altura = ALTURA_CABECALHO + ALTURA_TOTAL + ALTURA_TITULO_SECAO
        + (participantes.length * ALTURA_LINHA) + ALTURA_RODAPE;

    const png = await svgParaPng(svg, LARGURA, altura);

    if (!png) {
        throw new Error("Não foi possível gerar a imagem");
    }

    const nomeArquivo = `${residencia.code}-${competencia.year}-${String(competencia.month).padStart(2, "0")}.png`;
    const arquivo = new File([png], nomeArquivo, { type: "image/png" });

    //CA-3 -> onde houver compartilhamento nativo, ele é usado; CA-4 -> senão, baixa
    if (navigator.canShare?.({ files: [arquivo] })) {
        try {
            await navigator.share({
                title: `Despesas de ${residencia.name}`,
                text: `Resumo de ${competenciaTexto(competencia.month, competencia.year)}`,
                files: [arquivo],
            });
            return { compartilhado: true };
        } catch (erro) {
            //Cancelar o compartilhamento nativo não é erro: o usuário só desistiu
            if (erro instanceof Error && erro.name === "AbortError") {
                return { compartilhado: false, cancelado: true };
            }
        }
    }

    const link = document.createElement("a");
    const urlArquivo = URL.createObjectURL(arquivo);
    link.href = urlArquivo;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlArquivo);

    return { compartilhado: false, baixado: true };
}
