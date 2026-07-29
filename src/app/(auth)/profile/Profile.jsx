'use client'

import styles from './Profile.module.css';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from "next-auth/react";
import Snackbar from '@/components/ui/Snackbar';



export default function Profile() {

    const { data: session, update } = useSession();
    const {
        avatars,
        galleryOpen,
        selectedAvatar,
        loadingChangeProfilePicture,
        openGallery,
        closeGallery,
        selectAvatar,
        confirmChangeProfilePicture,
        snackbarOpen,
        snackbarMsg,
        closeSnackbar,
        snackbarType
    } = useProfile({ update });



    return (
        <div className={styles.container}>
            <h1>Minha conta</h1>
            <div>
                <div className={styles.profilePictureContainer}>
                    <div className={styles.profilePicture}>
                        <img src={session.user.profilePic || "/icons/profileIcon.svg"} alt="Perfil" />
                    </div>
                    <button className={styles.profilePictureEdit} onClick={openGallery}>
                        <span className={styles.profilePictureEditIcon}>
                            <img src="/icons/penEditIcon.svg" alt="Editar foto" />
                        </span>
                    </button>
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

                {galleryOpen && (
                    <div className={styles.galleryOverlay} role="dialog" aria-modal="true" aria-label="Escolher foto de perfil">
                        <div className={styles.galleryModal}>
                            <h2 className={styles.galleryTitle}>Escolha uma foto de perfil</h2>
                            <div className={styles.galleryGrid}>
                                {avatars.map((avatar) => (
                                    <button
                                        key={avatar}
                                        type="button"
                                        className={`${styles.avatarOption} ${selectedAvatar === avatar ? styles.avatarOptionSelected : ''}`}
                                        onClick={() => selectAvatar(avatar)}
                                        aria-pressed={selectedAvatar === avatar}
                                    >
                                        <img src={avatar} alt="Avatar" />
                                    </button>
                                ))}
                            </div>
                            <div className={styles.galleryActions}>
                                <button className={styles.profilePictureChangeButton} onClick={closeGallery} disabled={loadingChangeProfilePicture}>
                                    <span className={styles.profilePictureChangeButtonIcon}>
                                        <img src="/icons/uncheckedIcon.svg" alt="Cancelar" />
                                    </span>
                                </button>
                                <button className={styles.profilePictureChangeButton} onClick={confirmChangeProfilePicture} disabled={!selectedAvatar || loadingChangeProfilePicture}>
                                    <span className={styles.profilePictureChangeButtonIcon}>
                                        <img src="/icons/checkedIcon.svg" alt="Confirmar" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Snackbar open={snackbarOpen} message={snackbarMsg} onClose={closeSnackbar} type={snackbarType} />



            </div>
        </div>
    )
}
