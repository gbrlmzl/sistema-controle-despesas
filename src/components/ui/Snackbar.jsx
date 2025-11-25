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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        position: "fixed",
        bottom: "25%",
        left: "50%",
        transform: "translateX(-50%)",
        background: backgroundColors[type] || "#00c7c7ff",
        color: "#fff",
        borderRadius: 8,
        zIndex: 9999,
        width: "75vw", //TODO => Tornar isso responsivo para diferentes resoluções
        border: "1px solid #000",
        opacity: open ? 1 : 0,
        transition: "opacity 3s ease-in-out",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      }}>
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