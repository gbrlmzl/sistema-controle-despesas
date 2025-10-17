'use server';
import { redirect } from "next/navigation";
import { auth } from "../../../auth";


export default async function ControleDespesasLayout({ children }) {
    const session = await auth();
    if (!session) {
        redirect("/login"); // Se o usuário não estiver autenticado, redireciona para a página de login
    }

    return (
        <div style={{ minHeight: "100vh", background: "#999999ff" }}>
            <header>
                <h1>Controle de Despesas</h1>
            </header>
            <main>
                {children}
            </main>
            <footer>
                <small>Instagram - gbrlmzl</small>
            </footer>
        </div>
    );
}