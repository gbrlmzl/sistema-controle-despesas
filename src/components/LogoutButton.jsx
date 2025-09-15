"use client";


import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({redirectTo: '/'})}
      className="logoutButton"
    >
      Sair
    </button>
  );
}