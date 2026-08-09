'use client'

import { useEffect, useState } from "react";
import styles from './Snackbar.module.css';

interface SnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  type?: string;
}

export default function Snackbar({ open, message, onClose, type }: SnackbarProps) {
  //Enquanto o fade-out acontece o elemento precisa continuar montado,
  //senão ele sumiria de uma vez e a transição nunca seria vista.
  const [renderizar, setRenderizar] = useState(open);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (open) {
      setRenderizar(true);
      setSaindo(false);
      return;
    }

    if (!renderizar) {
      return;
    }

    setSaindo(true);
    const temporizador = setTimeout(() => {
      setRenderizar(false);
      setSaindo(false);
    }, 300);

    return () => clearTimeout(temporizador);
  }, [open, renderizar]);

  if (!renderizar) return null;

  const backgroundColors: Record<string, string> = {
    success: "#4caf50",
    error: "#f44336",
    warning: "#38B6FF",
  };




  return (
    <div className={`${styles.container} ${saindo ? styles.saindo : ''}`} style={{ backgroundColor: backgroundColors[type ?? ''] || "#333" }}>
      <div className={styles.mensagemContainer}>
        {message}
      </div>
      <div className={styles.botaoFecharContainer}>
        <button className={styles.botaoFechar} onClick={onClose}>
          <span>
            <img src="/icons/xIcon.svg" alt="Fechar" />
          </span>
        </button>

      </div>




    </div>
  );
}
