'use server';

import { signIn } from "../../../../auth";

export default async function loginAction(_prevState, formData){
    try{
        //await signIn('credentials', formData); dessa forma ele redireciona.
        await signIn('credentials', {
            email : formData.get('email'),
            password : formData.get('password'),
            redirect : true,
        });
        console.log("Deu certo");
        return { sucess: true };
    } catch (e) {
        if (e.type === 'CredentialsSignin'){
            return {sucess : false, message : "Dados incorretos"};
        }
        return {sucess : false, message : "Erro interno no servidor"};
    }
    
}