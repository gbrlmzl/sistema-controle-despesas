"use client"

import { useState, forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';

import styles from './SeletorData.module.css';

registerLocale('pt-BR', ptBR);

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';


function capitalizeFirst(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => {
    // value vem já formatado pelo dateFormat do DatePicker
    const display = value ? capitalizeFirst(value) : "";
    return (
        <input
            className={styles.customInput}
            ref={ref}
            onClick={onClick}
            value={display}
            placeholder={placeholder}
            readOnly
        />
    );
});

export default function SeletorData({ onConfirmaEscolha, onCancela, loading }) {
    const [date, setDate] = useState(null);

    const handleConfirma = () => {
        if (!date) return;
        const mes = date.getMonth() + 1;
        const ano = date.getFullYear();
        onConfirmaEscolha(mes, ano);
    };

    return (
        <div className={styles.container}>
            <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                dateFormat="MMMM 'de' yyyy" /* mostra nome do mês (localizado) */
                showMonthYearPicker
                showFullMonthYearPicker={false}
                placeholderText="Selecione o mês/ano"
                locale="pt-BR"
                calendarClassName={styles.datepickerCalendar}
                customInput={<CustomInput placeholder="Selecione o mês/ano" />}
                disabled={loading}


            />
            <div className="botoesContainer">
                <button onClick={onCancela}>
                    <span className="botaoIcone">
                        <img src="/icons/retornarIcon.svg" alt="Cancelar" />
                    </span> 
                </button>
                <button onClick={handleConfirma} disabled={loading || !date}>
                    <span className="botaoIcone">
                        <img src="/icons/confirmarIcon.svg" alt="Confirmar" />
                    </span>
                </button>
            </div>

        </div>
    );
}