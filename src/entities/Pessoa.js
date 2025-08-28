class Pessoa{
    nome;
    email;

    constructor(nome, email){
        this.nome = nome;
        this.email = email;
    }

    getNome(){
        return this.nome;
    }

    getEmail(){
        return this.email;
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
  //TODO => Metodo para retornar um JSON pronto e formatado??


}

export default Pessoa;