// Fonte única de verdade dos avatares pré-definidos.
// Usado tanto no frontend (galeria de seleção) quanto no backend (validação/whitelist).
// Cada caminho aponta para um SVG servido estaticamente a partir de /public/avatars.

export const AVATARS: string[] = [
    "/avatars/avatar-01.svg",
    "/avatars/avatar-02.svg",
    "/avatars/avatar-03.svg",
    "/avatars/avatar-04.svg",
    "/avatars/avatar-05.svg",
    "/avatars/avatar-06.svg",
    "/avatars/avatar-07.svg",
    "/avatars/avatar-08.svg",
    "/avatars/avatar-09.svg",
    "/avatars/avatar-10.svg",
    "/avatars/avatar-11.svg",
    "/avatars/avatar-12.svg",
    "/avatars/avatar-13.svg",
    "/avatars/avatar-14.svg",
    "/avatars/avatar-15.svg",
    "/avatars/avatar-16.svg",
    "/avatars/avatar-17.svg",
    "/avatars/avatar-18.svg",
    "/avatars/avatar-19.svg",
    "/avatars/avatar-20.svg",
];

// Garante que só caminhos da whitelist possam ser gravados no banco (evita valores arbitrários).
export const isValidAvatar = (avatar: string): boolean => AVATARS.includes(avatar);
