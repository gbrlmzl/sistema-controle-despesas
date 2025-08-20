class Gasto{
    identificacao = "";
    valor = 0;
    nomeDoResponsavel = "";

    constructor(identificacao, valor, nomeDoResponsavel){
        this.identificacao = identificacao;
        this.valor = valor;
        this.nomeDoResponsavel = nomeDoResponsavel;
    }

    getIdentificacao(){
        return this.identificacao;
    }

    getValor(){
        return this.valor;
    }

    getNomeDoResponsavel(){
        return this.nomeDoResponsavel;
    }

    setIdentificacao(identificacao){
        this.identificacao = identificacao;
    }

    setValor(valor){
        this.valor = valor;
    }

    setNomeDoResponsavel(nomeDoResponsavel){
        this.nomeDoResponsavel = nomeDoResponsavel;
    }

    toString(){
        return `${this.identificacao} -> ${this.valor} R$`;
    }
}

export default Gasto;