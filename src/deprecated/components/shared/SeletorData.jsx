"use client"

import { useState, forwardRef, useMemo, useCallback, useEffect, useRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ptBR from 'date-fns/locale/pt-BR';

import styles from './SeletorData.module.css';
import { title } from "process";

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

export default function SeletorData({ onConfirmaEscolha, onCancela, loading, listaDespesas }) {
    const [date, setDate] = useState(null);

    // Cria Set de chaves "YYYY-MM" a partir de listaDespesas.
    // Suporta formato agrupado: [{ ano: 2025, despesas: [{ mes: 12, ... }, ...] }, ...]
    // Ou casos menores (fallback): { ano, mes } dentro do array.
    const expenseKeys = useMemo(() => {
        const s = new Set();
        const pad = (n) => String(Number(n)).padStart(2, '0');
        for (const item of listaDespesas || []) {
            const ano = item?.ano;
            const mes = item?.mes;
            if (ano && mes != null) {
                s.add(`${ano}-${pad(mes)}`);
            }
        }
        return s;
    }, [listaDespesas]);

    const calendarRef = useRef(null);

    const highlightMonths = useCallback(() => {
        const cal = calendarRef.current;
        if (!cal) return;

        const titleEl = cal.querySelector(
            '.react-datepicker__current-month, .react-datepicker__current-year, .react-datepicker-year-header'
        );
        let displayedYear = new Date().getFullYear();
        
        if (titleEl) {
            const m = titleEl.textContent.match(/(\d{4})/);
            if (m) displayedYear = Number(m[1]);
        }
        const months = cal.querySelectorAll('.react-datepicker__month-text');
        months.forEach((el, idx) => {
            const monthNum = String(idx + 1).padStart(2, '0');
            const key = `${displayedYear}-${monthNum}`;
            if (expenseKeys.has(key)) el.classList.add('hasExpense');
            else el.classList.remove('hasExpense');
        });
    }, [expenseKeys]);


    useEffect(() => {
        // Atualiza destaque quando calendário está aberto/navegar ou quando expenseKeys muda.
        // React-datepicker renderiza calendário no DOM depois de abrir, então usamos pequeno timeout.
        const id = setTimeout(highlightMonths, 0);
        return () => clearTimeout(id);
    }, [highlightMonths]);

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
                onCalendarOpen={() => setTimeout(highlightMonths, 0)}
                onMonthChange={() => setTimeout(highlightMonths, 0)}
                onYearChange={() => setTimeout(highlightMonths, 0)}
                popperContainer={(props) => (
                    <div ref={calendarRef} {...props} />
                )}


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