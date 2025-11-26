'use server';
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import "./app.css";



export default async function ControleDespesasLayout({ children }) {
    const session = await auth();
    if (!session) {
        redirect("/login"); // Se o usuário não estiver autenticado, redireciona para a página de login
    }

    return (
        <div className="paginaConteudo">
            <main>
                {children}
            </main>
            <footer>
                <a href="https://github.com/gbrlmzl" target="_blank" rel="noopener noreferrer" style={{fontFamily: "var(--font-roboto-condensed)"}}>github.com/gbrlmzl</a>
            </footer>
        </div>
    );
}