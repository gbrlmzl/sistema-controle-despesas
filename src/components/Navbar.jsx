"use client";

import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {

    const { data: session, status } = useSession();
    if (status === "loading") {
        return <p>Carregando...</p>;
    }

    return (
    <nav style={{width: '100vw', backgroundColor: 'whitesmoke', display: 'flex', justifyContent: 'space-between', padding: '0 2vw 0 2vw'}}>
            {session ? (
                <>
                    <span>Olá, {session.user.name}</span>
                    <LogoutButton />
                </>
            ) : (
                <a href="/login">Login</a>
            )}

        </nav>
    )
}