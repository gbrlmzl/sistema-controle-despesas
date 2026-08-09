//Shape de retorno comum a toda Server Action do projeto: { success, message } e,
//quando a action devolve algo além da mensagem (ex.: o código novo gerado), um
//"data" opcional por cima.
export type ActionState<T = undefined> = T extends undefined
    ? { success: boolean; message: string }
    : { success: boolean; message: string; data?: T };
