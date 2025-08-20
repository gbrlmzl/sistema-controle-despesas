class Pessoa{
    nome;
    cpf;

    constructor(nome, cpf){
        this.nome = nome;
        this.cpf = cpf;
    }

    getNome(){
        return this.nome;
    }

    getCpf(){
        return this.cpf;
    }

    setNome(nome){
        this.nome = nome;
    }
    
    setCpf(cpf){
        this.cpf = cpf;
    }

    equals(other) {
        if(this === other) return true;
        if (other == null) return false;
        
        return other instanceof Pessoa && this.cpf === other.cpf;
  }


}

export default Pessoa;