import { compareSync } from "bcrypt";
import db from "./prisma";

interface CredentialUser {
    email: string;
    name: string;
    profilePic: string | null;
}

export async function findUserByCredentials(email: string, password: string): Promise<CredentialUser | null> {
    const usuario = await db.user.findFirst({
        where: {
            email: email
        }
    });

    if (!usuario || !usuario.password) {
        return null;
    }
    const passwordMatch = compareSync(password, usuario.password);

    if (passwordMatch) {
        return {
            email: usuario.email,
            name: usuario.name,
            profilePic: usuario.profilePic
        };
    }

    return null;
}
