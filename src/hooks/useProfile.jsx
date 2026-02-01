import { useState, useRef } from "react";


export const useProfile = ({ update }) => {

    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [loadingChangeProfilePicture, setLoadingChangeProfilePicture] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [snackbarType, setSnackbarType] = useState("error");
    const fileInputRef = useRef(null);

    const IMGUR_ALLOWED_FORMATS = ["image/jpeg", "image/png"];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (limite do Imgur)

    const changeProfilePicture = () => {
        fileInputRef.current?.click();
    };



    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        //validar tipo de arquivo
        if (!IMGUR_ALLOWED_FORMATS.includes(file.type)) {
            showSnackbar("Formato de imagem inválido! Use JPEG ou PNG.");
            cancelChangeProfilePicture();
            return;
        }
        //validar tamanho do arquivo
        if (file.size > MAX_FILE_SIZE) {
            //retornar False e mensagem de erro
            showSnackbar("O tamanho da imagem excede o limite de 10MB.");
            cancelChangeProfilePicture();
            return;
        }

        setProfilePictureFile(file);

        //criar preview da imagem
        const reader = new FileReader();
        reader.onload = (e) => {
            setProfilePicturePreview(e.target?.result);
        };
        reader.readAsDataURL(file);

    };

    const cancelChangeProfilePicture = () => {
        fileInputRef.current.value = null;
        setProfilePicturePreview(null);
        setProfilePictureFile(null);
    };

    const confirmChangeProfilePicture = async (username, email) => {
        //função para confirmar a alteração da foto de perfil
        //fazer upload da imagem para o servidor ou serviço de hospedagem
        //Criar lógica de upload na api para a api do imgur
        if (loadingChangeProfilePicture) return; // Impede execução se já estiver carregando
        setLoadingChangeProfilePicture(true);

        const formData = new FormData();
        formData.append("profilePictureFile", profilePictureFile);
        formData.append("username", username);


        try {
            const response = await fetch("/api/imgur", {
                method: "POST",
                body: formData

            });

            const data = await response.json();
            if (response.ok && data.profilePictureLink) {
                //post na api de usuários para atualizar a foto de perfil
                const updateFormData = new FormData();
                updateFormData.append("field", "profilePicture")
                updateFormData.append("profilePictureLink", data.profilePictureLink);
                updateFormData.append("email", email);

                const updateResponse = await fetch("/api/usuarios", {
                    method: "PATCH",
                    body: updateFormData
                });

                if (updateResponse.ok) {
                    showSnackbar("Foto de perfil atualizada com sucesso!", "success");
                    await update({ updateType: "profilePicture" });
                    cancelChangeProfilePicture();

                    return true;
                    //atualizar a sessão do usuário para refletir a nova foto de perfil
                    //pode ser necessário usar um contexto ou estado global para isso


                } else {
                    showSnackbar("Erro ao atualizar a foto de perfil.");
                }




                //snackbar de sucesso
            } else {
                showSnackbar("Erro ao atualizar a foto de perfil.");
            }
        } catch (err) {
            showSnackbar("Erro ao atualizar a foto de perfil.");
        } finally {
            setLoadingChangeProfilePicture(false);
        }
    };


    const showSnackbar = (msg, type) => {
        setSnackbarMsg(msg);
        setSnackbarType(type || "error");
        setSnackbarOpen(true);
    };

    const closeSnackbar = () => {
        setSnackbarOpen(false);
    }

    return {
        profilePicturePreview,
        changeProfilePicture,
        handleFileSelect,
        fileInputRef,
        cancelChangeProfilePicture,
        confirmChangeProfilePicture,
        closeSnackbar,
        snackbarOpen,
        snackbarMsg,
        snackbarType
        
    };
}