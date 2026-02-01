import RegisterForm from "./RegisterForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import styles from './page.module.css';

export default async function paginaRegistro() {

    const session = await auth();
    if (session) {
        return redirect('/'); //caso o usuário esteja logado, ele é redirecionado para a página inicial.
    }
    return (

        <div className={styles.container}>
            <RegisterForm />
        </div>

    )

}