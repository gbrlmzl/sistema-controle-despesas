'use server';

import { signIn } from "../../../../auth";

export default async function loginAction(_prevState, formData){
    try{
        await signIn('credentials', {
            email : formData.get('email'),
            password : formData.get('password'),
            redirect : false,
        });
        return { success: true };
    } catch (e) {

        if (e.type === 'CredentialsSignin'){
            return {success : false, message : "Dados incorretos!"};
        }
        if(e.type === 'NEXT_REDIRECT'){
            return {success : true};
        }
        return {success : false, message : "Erro interno no servidor"};
    }
    
}