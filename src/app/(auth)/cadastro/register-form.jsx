'use client'
import registerAction from "./registerAction";
import { useActionState } from "react";
import Form from "next/form"
 
export default function RegisterForm(){
    const [state, formAction, isPending] = useActionState(registerAction, null);  // Hook para gerenciar o estado da ação do formulário
    //isPending -> indica se a ação do formulário está em andamento, desabilitando o botão de envio para evitar envios múltiplos.
    return(
        <>
            {state?.sucess === false && (
                <div className="a" role="alert">
                    <strong className="aaa">Erro!</strong>
                    <span className="aa">{state?.message}</span>
                </div>
            )}
            <Form action={formAction} >
                <div>
                    <label>Nome</label>
                    <input type="text" name="name" placeholder="Nome" />
                </div>
                <div>
                    <label>Email</label>
                    <input type="email" name="email" placeholder="eu@exemplo.com" />
                </div>
                <div>
                    <label>Senha</label>
                    <input type="password" name="password" placeholder="********" />
                </div>
                <div>
                    <button disabled={isPending} className="w-full mt-6" type="submit">
                        Registrar
                    </button>
                </div>
            </Form>
        </>
    )
}