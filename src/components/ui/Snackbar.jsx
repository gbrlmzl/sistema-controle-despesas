import React from "react";
import styles from './Snackbar.module.css';

export default function Snackbar({ open, message, onClose, type }) {
  if (!open) return null;

  const backgroundColors = {
    success: "#4caf50",
    error: "#f44336",
    warning: "#38B6FF",
  };




  return (
    <div className={styles.container} style={{ backgroundColor: backgroundColors[type] || "#333", opacity: open ? 1: 0, transition: "opacity 3s ease-in-out", }}>
      <div className={styles.mensagemContainer}>
        {message}
      </div>
      <div className={styles.botaoFecharContainer}>
        <button className={styles.botaoFechar} onClick={onClose}>
          <span>
            <img src="./icons/xIcon.svg" alt="Fechar" />
          </span>
        </button>

      </div>




    </div>
  );
}