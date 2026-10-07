/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        emi: {
          azul: '#004F9F',
          azulOscuro: '#003D7C',
          azulProfundo: '#0B2A4A',
          azulClaro: '#E8F0FA',
          azulMedio: '#1668C1',
          amarillo: '#FFDD00',
          amarilloOscuro: '#EAB500',
          amarilloClaro: '#FFF8D6',
          gris: '#F3F6FB',
          grisBorde: '#D9E2EF',
          verde: '#1F9D55',
          verdeClaro: '#E3F6EC',
          rojo: '#CC3B3B',
          rojoClaro: '#FDEAEA',
          naranja: '#E08B00',
          naranjaClaro: '#FFF1DA',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        tarjeta: '0 1px 2px rgba(11, 42, 74, 0.06), 0 8px 24px -12px rgba(11, 42, 74, 0.25)',
        flotante: '0 12px 40px -18px rgba(11, 42, 74, 0.45)',
      },
      keyframes: {
        aparecer: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        entrarPorDerecha: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulsoSuave: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        aparecer: 'aparecer 0.25s ease-out',
        entrarPorDerecha: 'entrarPorDerecha 0.2s ease-out',
        pulsoSuave: 'pulsoSuave 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
