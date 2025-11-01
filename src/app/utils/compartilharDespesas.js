// --- Helpers para embutir fonte como data URL ---
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

async function fetchFontAsDataUrl(fontPath) {
    try {
        const res = await fetch(fontPath);
        if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`);
        const buffer = await res.arrayBuffer();
        const base64 = arrayBufferToBase64(buffer);
        return `data:font/woff2;base64,${base64}`;
    } catch (err) {
        console.warn('Could not load font for embedding in SVG:', err);
        return null;
    }
}

export const compartilharDespesasDetalhes = async (despesas, pessoa, mesAnoTexto) => {
    // === preparar dados ===
    const totalGasto = despesas.reduce((acc, d) => acc + d.value, 0);
    const totalDespesas = despesas.length;

    const largura = 600;
    const alturaCabecalho = 40;
    const alturaLinha = 30;
    const alturaTabela = alturaCabecalho + (despesas.length * alturaLinha) + 60;

    // colunas
    const xInicioTabela = 0;
    const larguraCol1 = 80;
    const larguraCol2 = 320;
    const larguraCol3 = 150;
    const larguraTotal = larguraCol1 + larguraCol2 + larguraCol3;
    const yInicioTabela = 25;

    // --- opcional: garantir que a fonte esteja carregada no documento ---
    // que a fonte Roboto Condensed esteja disponível em /public/fonts/RobotoCondensed.woff2 para embutir no SVG.
    try {
        // espera a API de fonts do browser carregar a família
        await document.fonts.load('16px "Roboto Condensed"');
        // e esperar que todas as fontes relevantes estejam prontas
        await document.fonts.ready;
    } catch (err) {
        // fallback se a API de fonts não existir / falhar
        console.warn('document.fonts.load falhou (fallback será usado):', err);
    }

    // tentar buscar a fonte local e embutir no SVG para garantir que o rasterizador a possua
    // Coloque a fonte em `public/fonts/RobotoCondensed.woff2` para que /fonts/RobotoCondensed.woff2 funcione
    const localFontPath = '/fonts/RobotoCondensed.woff2';
    const fontDataUrl = await fetchFontAsDataUrl(localFontPath);
    const fontFaceCss = fontDataUrl
        ? `@font-face{font-family:'Roboto Condensed';src: url('${fontDataUrl}') format('woff2');font-weight:400;font-style:normal;}`
        : '';

    // montar SVG (use fills inline para garantir) e injeta o @font-face (se disponível)
    const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${alturaTabela}">
                    <style>
                    ${fontFaceCss}
                    /* Ainda mantemos a família, caso esteja disponível */
                    .title { font-family: 'Roboto Condensed', sans-serif; font-size:20px; fill:#111; }
                    .cell-text { font-family: 'Roboto Condensed', sans-serif; font-size:14px; fill:#111; }
                    .header-text { font-family: 'Roboto Condensed', sans-serif; font-size:14px; fill:#fff; font-weight:700; }
                    .header-rect { fill: #38B6FF; stroke: #000; stroke-width:1; }
                    .row-rect { fill: none; stroke: #000; stroke-width:1; }
                    .total-rect { fill: #38B6FF; stroke: #000; stroke-width:1; }
                    </style>

                    <!-- Fundo geral -->
                    <rect x="0" y="0" width="${larguraTotal}" height="${alturaTabela}" fill="#ffffff"/>


                    <!-- Título -->
                    <text x="${largura / 2}" y="20" class="title" text-anchor="middle">${escapeXml(pessoa.name)}</text>

                    <!-- Cabeçalho -->
                    <rect class="header-rect" x="${xInicioTabela}" y="${yInicioTabela}" width="${larguraTotal}" height="${alturaCabecalho}"  />
                    <text class="header-text" x="${xInicioTabela + larguraCol1 / 2}" y="${yInicioTabela + 25}" text-anchor="middle">#</text>
                    <text class="header-text" x="${xInicioTabela + larguraCol1 + larguraCol2 / 2}" y="${yInicioTabela + 25}" text-anchor="middle">Despesa</text>
                    <text class="header-text" x="${xInicioTabela + larguraCol1 + larguraCol2 + larguraCol3 / 2}" y="${yInicioTabela + 25}" text-anchor="middle">Valor</text>

                    <!-- Linhas (rows) -->
                    ${despesas.map((d, i) => {
        const y = yInicioTabela + alturaCabecalho + (i * alturaLinha);
        return `
                        <rect class="row-rect" x="${xInicioTabela}" y="${y}" width="${larguraTotal}" height="${alturaLinha}" />
                        <line x1="${xInicioTabela + larguraCol1}" y1="${y}" x2="${xInicioTabela + larguraCol1}" y2="${y + alturaLinha}" stroke="#000" stroke-width="1" />
                        <line x1="${xInicioTabela + larguraCol1 + larguraCol2}" y1="${y}" x2="${xInicioTabela + larguraCol1 + larguraCol2}" y2="${y + alturaLinha}" stroke="#000" stroke-width="1" />

                        <text class="cell-text" x="${xInicioTabela + larguraCol1 / 2}" y="${y + 20}" text-anchor="middle">${i + 1}</text>
                        <text class="cell-text" x="${xInicioTabela + larguraCol1 + larguraCol2 / 2}" y="${y + 20}" text-anchor="middle">${escapeXml(d.name)}</text>
                        <text class="cell-text" x="${xInicioTabela + larguraCol1 + larguraCol2 + larguraCol3 / 2}" y="${y + 20}" text-anchor="middle">${d.value.toFixed(2)} R$</text>
                    `;
    }).join('')}

                    <!-- Divisórias verticais ao longo da tabela -->
                    <line x1="${xInicioTabela + larguraCol1}" y1="${yInicioTabela}" x2="${xInicioTabela + larguraCol1}" y2="${yInicioTabela + alturaCabecalho + (despesas.length * alturaLinha)}" stroke="#000" stroke-width="1" />
                    <line x1="${xInicioTabela + larguraCol1 + larguraCol2}" y1="${yInicioTabela}" x2="${xInicioTabela + larguraCol1 + larguraCol2}" y2="${yInicioTabela + alturaCabecalho + (despesas.length * alturaLinha)}" stroke="#000" stroke-width="1" />

                    <!-- Total -->
                    <rect class="total-rect" x="${xInicioTabela}" y="${alturaTabela - 40}" width="${larguraTotal}" height="40"/>
                    <text class="header-text" x="${largura / 2}" y="${alturaTabela - 15}" text-anchor="middle">
                    Total: ${totalGasto.toFixed(2)} R$ (${totalDespesas} despesas)
                    </text>
                </svg>
                `;

    // converter SVG -> Blob
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // criar Image e desenhar no canvas; assegure crossOrigin
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = svgUrl;

    // aguarda o carregamento (já garantimos a fonte anteriormente)
    await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
    });

    // desenhar no canvas
    const canvas = document.createElement('canvas');
    canvas.width = larguraTotal * 2;     // opcional: para melhor qualidade ao dar zoom, renderize em 2x
    canvas.height = alturaTabela * 2;
    const ctx = canvas.getContext('2d');
    // scale para 2x (melhor nitidez)
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, largura, alturaTabela);

    // converter em PNG
    const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    // liberar o objectURL do SVG (não mais necessário)
    try { URL.revokeObjectURL(svgUrl); } catch (e) { /* ignore */ }
    const mesAnoFormatado = mesAnoTexto.toLowerCase().replace(" de ", "_").replace("ç", "c").replace(/ /g, "_");
    const file = new File([pngBlob], `${pessoa.name.toLowerCase().replace(/ /g, "_")}_${mesAnoFormatado}.png`, { type: 'image/png' });

    // compartilhar ou baixar
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            title: `Gastos de ${pessoa.name}`,
            text: `Confira o resumo das despesas de ${pessoa.name}`,
            files: [file],
        });
    } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = `${pessoa.name}-gastos.png`;
        link.click();
    }
}

// pequena função de escape para texto (evita que nomes com <>& estraguem o SVG)
function escapeXml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export const compartilharDespesasResumo = async ({ listaDespesasInfoFormatada = [], mesAnoTexto, existeDespesaCadastrada = false } ) => {
    // `listaDespesasInfoFormatada` é recebida como parâmetro no formato esperado.

    // dimensões e colunas
    const largura = 800;
    // reduzir altura do cabeçalho/linhas para ficar mais compacto
    const alturaCabecalho = 28;
    const alturaLinha = 28;
    const linhas = Math.max(1, listaDespesasInfoFormatada.length);
    const alturaTabela = alturaCabecalho + (linhas * alturaLinha) + 60;

    const xInicio = 0;
    const larguraColPessoa = 300;
    const larguraColTotal = 120;
    const larguraColDespesas = 80;
    const larguraColPaga = 150;
    const larguraColRecebe = 150;
    const larguraTotal = larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga + larguraColRecebe;
    const yInicioTabela = 27;
    const footerHeight = 32;

    // garantir fontes
    try {
        await document.fonts.load('16px "Roboto Condensed"');
        await document.fonts.ready;
    } catch (err) {
        console.warn('document.fonts.load falhou (fallback será usado):', err);
    }

    const localFontPath = '/fonts/RobotoCondensed.woff2';
    const fontDataUrl = await fetchFontAsDataUrl(localFontPath);
    const fontFaceCss = fontDataUrl
        ? `@font-face{font-family:'Roboto Condensed';src: url('${fontDataUrl}') format('woff2');font-weight:400;font-style:normal;}`
        : '';

    const mesAnoLabel = typeof mesAnoTexto === 'function' ? mesAnoTexto() : String(mesAnoTexto || '');
    // montar linhas HTML (respeitando existeDespesaCadastrada)
    const rowsHtml = listaDespesasInfoFormatada.map((p, i) => {
        const y = yInicioTabela + alturaCabecalho + (i * alturaLinha);
        const nome = escapeXml(p.nomePessoa || '');
        const totalGastoText = existeDespesaCadastrada ? (Number(p.totalGasto || 0).toFixed(2)) : '-';
        const numDespesasText = existeDespesaCadastrada ? String(p.numDespesas || 0) : '-';
        const pagaText = existeDespesaCadastrada ? (p.paga ? Number(p.quantia || 0).toFixed(2) : '0.00') : '-';
        const recebeText = existeDespesaCadastrada ? (p.recebe ? Number(p.quantia || 0).toFixed(2) : '0.00') : '-';

        return `
            <rect class="row-rect" x="${xInicio}" y="${y}" width="${larguraTotal}" height="${alturaLinha}" />
            <line x1="${xInicio + larguraColPessoa}" y1="${y}" x2="${xInicio + larguraColPessoa}" y2="${y + alturaLinha}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal}" y1="${y}" x2="${xInicio + larguraColPessoa + larguraColTotal}" y2="${y + alturaLinha}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas}" y1="${y}" x2="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas}" y2="${y + alturaLinha}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga}" y1="${y}" x2="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga}" y2="${y + alturaLinha}" stroke="#000" stroke-width="1" />

            <text class="cell-text" x="${xInicio + larguraColPessoa / 2}" y="${y + 20}" text-anchor="middle">${nome}</text>
            <text class="cell-text" x="${xInicio + larguraColPessoa + larguraColTotal / 2}" y="${y + 20}" text-anchor="middle">${totalGastoText}</text>
            <text class="cell-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas / 2}" y="${y + 20}" text-anchor="middle">${numDespesasText}</text>
            <text class="cell-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga / 2}" y="${y + 20}" text-anchor="middle">${pagaText}</text>
            <text class="cell-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga + larguraColRecebe / 2}" y="${y + 20}" text-anchor="middle">${recebeText}</text>
        `;
    }).join('');

    const totalGastosSum = existeDespesaCadastrada ? listaDespesasInfoFormatada.reduce((acc, p) => acc + (Number(p.totalGasto) || 0), 0) : null;
    const totalDespesasSum = existeDespesaCadastrada ? listaDespesasInfoFormatada.reduce((acc, p) => acc + (Number(p.numDespesas) || 0), 0) : null;

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${larguraTotal}" height="${alturaTabela}">
            <style>
            ${fontFaceCss}
            .title { font-family: 'Roboto Condensed', sans-serif; font-size:18px; fill:#111; }
            .cell-text { font-family: 'Roboto Condensed', sans-serif; font-size:13px; fill:#111; }
            .header-text { font-family: 'Roboto Condensed', sans-serif; font-size:13px; fill:#fff; font-weight:700; }
            .header-rect { fill: #38B6FF; stroke: #000; stroke-width:1; }
            .row-rect { fill: none; stroke: #000; stroke-width:1; }
            .total-rect { fill: #38B6FF; stroke: #000; stroke-width:1; }
            </style>

            <rect x="0" y="0" width="${larguraTotal}" height="${alturaTabela}" fill="#ffffff" />
            <text x="${larguraTotal / 2}" y="20" class="title" text-anchor="middle">${escapeXml(mesAnoLabel)}</text>

            <!-- Cabeçalho -->
            <rect class="header-rect" x="${xInicio}" y="${yInicioTabela}" width="${larguraTotal}" height="${alturaCabecalho}" />
            <text class="header-text" x="${xInicio + larguraColPessoa / 2}" y="${yInicioTabela + 20}" text-anchor="middle">Pessoa</text>
            <text class="header-text" x="${xInicio + larguraColPessoa + larguraColTotal / 2}" y="${yInicioTabela + 20}" text-anchor="middle">Total gasto</text>
            <text class="header-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas / 2}" y="${yInicioTabela + 20}" text-anchor="middle">Despesas</text>
            <text class="header-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga / 2}" y="${yInicioTabela + 20}" text-anchor="middle">Valor pago</text>
            <text class="header-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga + larguraColRecebe / 2}" y="${yInicioTabela + 20}" text-anchor="middle">Valor recebido</text>

            ${rowsHtml}

            <!-- Divisória horizontal antes do footer -->
            <line x1="${xInicio}" y1="${yInicioTabela + alturaCabecalho + (linhas * alturaLinha)}" x2="${xInicio + larguraTotal}" y2="${yInicioTabela + alturaCabecalho + (linhas * alturaLinha)}" stroke="#000" stroke-width="1" />

            <!-- Divisórias verticais (linhas contínuas) -->
            <line x1="${xInicio + larguraColPessoa}" y1="${yInicioTabela}" x2="${xInicio + larguraColPessoa}" y2="${yInicioTabela + alturaCabecalho + (linhas * alturaLinha)}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal}" y1="${yInicioTabela}" x2="${xInicio + larguraColPessoa + larguraColTotal}" y2="${yInicioTabela + alturaCabecalho + (linhas * alturaLinha)}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas}" y1="${yInicioTabela}" x2="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas}" y2="${yInicioTabela + alturaCabecalho + (linhas * alturaLinha)}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga}" y1="${yInicioTabela}" x2="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga}" y2="${yInicioTabela + alturaCabecalho + (linhas * alturaLinha)}" stroke="#000" stroke-width="1" />

            <!-- Footer totals -->
            <rect class="total-rect" x="${xInicio}" y="${alturaTabela - footerHeight}" width="${larguraTotal}" height="${footerHeight}" />

            <!-- Divisórias verticais dentro do footer (alinhadas às colunas) -->
            <line x1="${xInicio + larguraColPessoa}" y1="${alturaTabela - footerHeight}" x2="${xInicio + larguraColPessoa}" y2="${alturaTabela}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal}" y1="${alturaTabela - footerHeight}" x2="${xInicio + larguraColPessoa + larguraColTotal}" y2="${alturaTabela}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas}" y1="${alturaTabela - footerHeight}" x2="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas}" y2="${alturaTabela}" stroke="#000" stroke-width="1" />
            <line x1="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga}" y1="${alturaTabela - footerHeight}" x2="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga}" y2="${alturaTabela}" stroke="#000" stroke-width="1" />

            <text class="header-text" x="${xInicio + larguraColPessoa / 2}" y="${alturaTabela - footerHeight + 20}" text-anchor="middle">Total</text>
            <text class="header-text" x="${xInicio + larguraColPessoa + larguraColTotal / 2}" y="${alturaTabela - footerHeight + 20}" text-anchor="middle">${totalGastosSum !== null ? totalGastosSum.toFixed(2) : '-'}</text>
            <text class="header-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas / 2}" y="${alturaTabela - footerHeight + 20}" text-anchor="middle">${totalDespesasSum !== null ? totalDespesasSum : '-'}</text>
            <text class="header-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga / 2}" y="${alturaTabela - footerHeight + 20}" text-anchor="middle">-</text>
            <text class="header-text" x="${xInicio + larguraColPessoa + larguraColTotal + larguraColDespesas + larguraColPaga + larguraColRecebe / 2}" y="${alturaTabela - footerHeight + 20}" text-anchor="middle">-</text>
        </svg>
    `;

    // converter SVG -> Blob
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = svgUrl;

    await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
    });

    const canvas = document.createElement('canvas');
    canvas.width = larguraTotal * 2;
    canvas.height = alturaTabela * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, larguraTotal, alturaTabela);

    const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    try { URL.revokeObjectURL(svgUrl); } catch (e) { /* ignore */ }

    const mesAnoFormatado = mesAnoLabel.toLowerCase().replace(" de ", "_").replace("ç", "c").replace(/ /g, "_");
    const file = new File([pngBlob], `resumo_despesas_${mesAnoFormatado}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            title: `Resumo de despesas ${mesAnoFormatado}`,
            text: `Resumo de despesas - ${mesAnoLabel}`,
            files: [file],
        });
    } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = `resumo_despesas_${mesAnoFormatado}.png`;
        link.click();
    }
}