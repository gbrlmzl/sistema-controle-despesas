import { compare, compareSync } from "bcrypt";
import db from "./prisma";


export async function findUserByCredentials(email, password) {
    const user = await db.usuario.findFirst({
        where: {
            email : email
        }
    });

    if (!user){
        return null;
    }
    const passwordMatch =  compareSync(password, user.password);

    if(passwordMatch){
        return{
            email : user.email,
            name: user.name
        };
    }
    
    return null;

    

}