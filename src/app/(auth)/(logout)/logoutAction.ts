'use server';

import { signOut } from "../../../auth";

export default async function logoutAction(): Promise<void> {
    await signOut();
}
