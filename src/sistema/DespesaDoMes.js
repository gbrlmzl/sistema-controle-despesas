import Gasto from "@/entities/Gasto";

class DespesaDoMes{
    listaDeGastos = [];
    nomePagante;
    nomeRecebedor;
    mes;

    constructor(mes){
        this.mes = mes;
    }

    setPaganteERecebedor(nomePagante, nomeRecebedor){
        this.nomePagante = nomePagante;
        this.nomeRecebedor = nomeRecebedor;
    }

    getMes() {
        return this.mes;
    }

    getNomePagante(){
        return this.nomePagante;
    }

    getNomeRecebedor(){
        return this.nomeRecebedor;
    }

    adicionarGasto(gasto){
        this.listaDeGastos.push(gasto);
    }


   totalGastosDaPessoa(nomePessoa){
    let totalGastos = 0;
    this.listaDeGastos.forEach(gasto => {
        if(gasto.getNomeDoResponsavel() === nomePessoa){
            totalGastos += gasto.getValor();
        }
    });
    return totalGastos;
   }

   //TODO: funções para retornar informações dos gastos
}

export default DespesaDoMes;