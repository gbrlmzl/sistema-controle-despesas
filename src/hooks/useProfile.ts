import { useState } from "react";
import { AVATARS } from "@/lib/avatars";

interface UseProfileParams {
    update: (data?: { updateType?: string }) => Promise<unknown>;
}

export const useProfile = ({ update }: UseProfileParams) => {

    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [loadingChangeProfilePicture, setLoadingChangeProfilePicture] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarType, setSnackbarType] = useState<"error" | "success">("error");

    const avatars = AVATARS;

    const openGallery = () => {
        setGalleryOpen(true);
    };

    const closeGallery = () => {
        setGalleryOpen(false);
        setSelectedAvatar(null);
    };

    const selectAvatar = (avatar: string) => {
        setSelectedAvatar(avatar);
    };

    const showSnackbar = (msg: string, type?: "error" | "success") => {
        setSnackbarMsg(msg);
        setSnackbarType(type || "error");
        setSnackbarOpen(true);
    };

    const confirmChangeProfilePicture = async () => {
        //Confirma a troca da foto de perfil por um dos avatares pré-definidos
        if (!selectedAvatar) return; // Nenhum avatar selecionado
        if (loadingChangeProfilePicture) return; // Impede execução se já estiver carregando
        setLoadingChangeProfilePicture(true);

        try {
            const response = await fetch("/api/users/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: selectedAvatar }),
            });

            if (response.ok) {
                showSnackbar("Foto de perfil atualizada com sucesso!", "success");
                //Atualiza a sessão do usuário para refletir a nova foto de perfil
                await update({ updateType: "profilePicture" });
                closeGallery();
            } else {
                showSnackbar("Erro ao atualizar a foto de perfil.");
            }
        } catch (err) {
            showSnackbar("Erro ao atualizar a foto de perfil.");
        } finally {
            setLoadingChangeProfilePicture(false);
        }
    };

    const closeSnackbar = () => {
        setSnackbarOpen(false);
    }

    return {
        avatars,
        galleryOpen,
        selectedAvatar,
        loadingChangeProfilePicture,
        openGallery,
        closeGallery,
        selectAvatar,
        confirmChangeProfilePicture,
        closeSnackbar,
        snackbarOpen,
        snackbarMsg,
        snackbarType

    };
}
