import { compare, compareSync } from "bcrypt";
import db from "./prisma";


export async function findUserByCredentials(email, password) {
    const usuario = await db.user.findFirst({
        where: {
            email : email
        }
    });

    if (!usuario){
        return null;
    }
    const passwordMatch =  compareSync(password, usuario.password);

    if(passwordMatch){
        return{
            email : usuario.email,
            name: usuario.name,
            profilePic: usuario.profilePic
        };
    }
    
    return null;
}