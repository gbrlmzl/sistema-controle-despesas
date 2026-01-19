import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function PATCH(req) {
    try {
        const formData = await req.formData();
        const fieldToUpdate = formData.get("field");
        const imageLink = formData.get("profilePictureLink");
        const email = formData.get("email");

        if(!fieldToUpdate || !imageLink || !email){
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        if(fieldToUpdate === "profilePicture"){
            const updatedUser = await db.user.update({
                where: { email: email },
                data: { profilePic: imageLink },
            });

            return NextResponse.json({ message: "Tudo certo" }, { status: 200 });
        }

        return NextResponse.json({ error: "Campo não suportado" }, { status: 400 });
        
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
    }

}
    
