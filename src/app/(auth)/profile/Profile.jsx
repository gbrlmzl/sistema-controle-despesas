'use client'

import styles from './Profile.module.css';
import Link from 'next/link';


export default function Profile({session}) {
    return (
        <div className={styles.container}>
            <h1>Minha conta</h1>
            <div>
                <div className={styles.profilePictureContainer}>
                    <div className={styles.profilePicture}>
                        <img src="/icons/profileIcon.svg" alt="Profile Picture" />
                    </div>
                    <button className={styles.profilePictureEdit}>
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
                <div className={styles.profileActions}>
                    <Link href="/profile/settings/password" className={styles.changePasswordLinkButton}>Alterar senha</Link>
                </div>


            </div>
        </div>
    )
}