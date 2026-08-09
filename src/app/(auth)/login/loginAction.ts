'use server';

import { signIn } from "@/auth";
import type { ActionState } from "@/types/actions";

export default async function loginAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false,
        });
        return { success: true, message: '' };
    } catch (e) {
        const type = e && typeof e === 'object' && 'type' in e ? e.type : undefined;

        if (type === 'CredentialsSignin') {
            return { success: false, message: "Dados incorretos!" };
        }
        if (type === 'NEXT_REDIRECT') {
            return { success: true, message: '' };
        }
        return { success: false, message: "Erro interno no servidor" };
    }

}
