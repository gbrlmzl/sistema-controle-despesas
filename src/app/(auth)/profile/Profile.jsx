'use client'

import styles from './Profile.module.css';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from "next-auth/react";
import Snackbar from '@/components/ui/Snackbar';



export default function Profile() {

    const {data: session,  update } = useSession();
    const {
        changeProfilePicture,
        profilePicturePreview,
        fileInputRef,
        handleFileSelect,
        confirmChangeProfilePicture,
        cancelChangeProfilePicture,
        snackbarOpen,
        snackbarMsg,
        closeSnackbar,
        snackbarType
    } = useProfile({ update});


    
    

    const handleChangeProfilePicture = () => {
        changeProfilePicture();
    }

    return (
        <div className={styles.container}>
            <h1>Minha conta</h1>
            <div>
                <div className={styles.profilePictureContainer}>
                    <div className={styles.profilePicture}>
                        {profilePicturePreview ? (
                            <img src={profilePicturePreview} alt="Perfil" />
                        ) : (<img src={session.user.profilePic || "/icons/profileIcon.svg"} alt="Perfil" />)}

                    </div>
                    <button className={styles.profilePictureEdit} onClick={handleChangeProfilePicture}>
                        <span className={styles.profilePictureEditIcon}>
                            <img src="/icons/penEditIcon.svg" alt="Editar foto" />
                        </span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg, image/png" onChange={handleFileSelect} style={{ display: 'none' }} />

                </div>



                <div className={styles.profileDetails}>
                    <span>
                        <strong>Nome:</strong> {session.user.name}
                    </span>
                    <span>
                        <strong>Email:</strong> {session.user.email}

                    </span>
                </div>
                {session.user.provider === 'credentials' && (
                    <div className={styles.profileActions}>
                        <Link href="/profile/settings/password" className={styles.changePasswordLinkButton}>Alterar senha</Link>
                    </div>)
                }
                {profilePicturePreview && (
                    <div className={styles.profilePictureChangeActionsContainer}>
                        <button className={styles.profilePictureChangeButton} onClick={cancelChangeProfilePicture}>
                            <span className={styles.profilePictureChangeButtonIcon}>
                                <img src="/icons/uncheckedIcon.svg" alt="Cancelar alteração da foto de perfil" />
                            </span>
                        </button>
                        <button className={styles.profilePictureChangeButton} onClick={() => confirmChangeProfilePicture(session.user.name, session.user.email)}>
                            <span className={styles.profilePictureChangeButtonIcon}>
                                <img src="/icons/checkedIcon.svg" alt="Confirmar nova foto de perfil" />
                            </span>
                        </button>
                    </div>
                )}
                <Snackbar open={snackbarOpen} message={snackbarMsg} onClose={closeSnackbar} type={snackbarType} />



            </div>
        </div>
    )
}