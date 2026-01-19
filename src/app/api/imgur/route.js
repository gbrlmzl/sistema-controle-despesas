import { NextResponse } from "next/server";
export async function POST(req) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get("profilePictureFile");
        const username = formData.get("username");

        if (!imageFile || typeof imageFile === 'string') {
            return NextResponse.json({ error: "Imagem inválida" }, { status: 400 });
        }

        const imgurForm = new FormData();
        imgurForm.append("image", imageFile);
        imgurForm.append("type", "file");
        imgurForm.append("title", username || "profile_picture");

        const imgurResponse = await fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.IMGUR_ACCESS_TOKEN}`,
            },
            body: imgurForm,
        });
        
        const imgurData = await imgurResponse.json();
        if (!imgurData.success) {

            return NextResponse.json({ success: false, profilePictureLink: null }, { status: 500 });
        }
        return NextResponse.json({ success: true, profilePictureLink: imgurData.data.link }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ error: "Erro ao fazer upload da imagem" }, { status: 500 });
    }

}