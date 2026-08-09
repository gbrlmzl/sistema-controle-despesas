import db from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isValidAvatar } from "@/lib/avatars";

// Atualiza dados do próprio usuário autenticado.
// Hoje suporta a troca da foto de perfil por um avatar pré-definido.
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user.email) {
        return NextResponse.json({ success: false, message: "Usuário não autenticado" }, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
    } catch (error) {
        return NextResponse.json({ success: false, message: "JSON inválido" }, { status: 400 });
    }

    const { avatar } = body;

    //Segurança: o e-mail vem sempre da sessão (nunca do body) e o avatar precisa
    //estar na whitelist dos avatares pré-definidos.
    if (!avatar || !isValidAvatar(avatar)) {
        return NextResponse.json({ success: false, message: "Avatar inválido" }, { status: 400 });
    }

    try {
        const updatedUser = await db.user.update({
            where: { email: session.user.email },
            data: { profilePic: avatar },
            select: { profilePic: true },
        });

        return NextResponse.json(
            { success: true, message: "Foto de perfil atualizada com sucesso!", data: { profilePic: updatedUser.profilePic } },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro ao atualizar usuário" }, { status: 500 });
    }
}
