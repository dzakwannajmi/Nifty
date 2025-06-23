// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Warna untuk Gradien Teks (misal untuk logo Nifty) ---
        'purple-gradient-start': '#8a2be2', // Ungu gelap kebiruan
        'purple-gradient-end': '#e0b0ff',   // Ungu muda pinkish

        // --- Palet Warna untuk Tema GELAP ---
        'neutral': { // Menggunakan palet neutral untuk grays gelap yang lebih modern
          '50': '#FAFAFA',
          '100': '#F5F5F5',
          '200': '#E5E5E5',
          '300': '#D4D4D4',
          '400': '#A3A3A3',
          '500': '#737373',
          '600': '#525252',
          '700': '#404040',
          '800': '#262626',
          '900': '#171717', // Ini akan menjadi warna latar belakang kartu/section
          '950': '#0A0A0A', // Ini bisa menjadi warna background global paling gelap
        },
        'gray': { // Palet gray standar Tailwind, disesuaikan untuk kontras tema gelap
          '50': '#F9FAFB',
          '100': '#F3F4F6',
          '200': '#E5E7EB',
          '300': '#D1D5DB', // Teks terang di latar gelap
          '400': '#9CA3AF', // Teks sekunder
          '500': '#6B7280', // Placeholder, teks info
          '600': '#4B5563',
          '700': '#374151',
          '800': '#1F2937',
          '900': '#111827',
          '950': '#030712',
        },

        'purple': { // Definisi warna ungu
          '50': '#F5F3FF',
          '100': '#EDE9FE',
          '200': '#DDD6FE',
          '300': '#C4B5FD', // Aksen teks terang
          '400': '#A78BFA', // Aksen utama
          '500': '#8B5CF6',
          '600': '#7C3AED',
          '700': '#6D28D9',
          '800': '#5B21B6', // Aksen border/background gelap
          '900': '#4C1D95',
          '950': '#2F115C',
        },
        'violet': { // Definisi warna violet
          '50': '#F5F3FF',
          '100': '#EDE9FE',
          '200': '#DDD6FE',
          '300': '#C4B5FD',
          '400': '#A78BFA',
          '500': '#8B5CF6',
          '600': '#7C3AED',
          '700': '#6D28D9',
          '800': '#5B21B6',
          '900': '#4C1D95',
          '950': '#2F115C',
        },
        'red': { // Definisi warna merah untuk error/logout
          '50': '#FEF2F2',
          '100': '#FEE2E2',
          '200': '#FECACA',
          '300': '#FCA5A5',
          '400': '#F87171',
          '500': '#EF4444',
          '600': '#DC2626',
          '700': '#B91C1C',
          '800': '#991B1B',
          '900': '#7F1D1D',
        },
        'blue': { // Definisi warna biru untuk tombol upload
          '50': '#EFF6FF',
          '100': '#DBEAFE',
          '200': '#BFDBFE',
          '300': '#93C5FD',
          '400': '#60A5FA',
          '500': '#3B82F6',
          '600': '#2563EB',
          '700': '#1D4ED8',
          '800': '#1E40AF',
          '900': '#1E3A8A',
        },
        'cyan': { // Definisi warna cyan
          '50': '#ECFEFF',
          '100': '#CFFAFE',
          '200': '#A5F3FC',
          '300': '#67E8F9',
          '400': '#22D3EE',
          '500': '#06B6D4',
          '600': '#0891B2',
          '700': '#0E7490',
          '800': '#155E75',
          '900': '#164E63',
        },
        'green': { // Definisi warna hijau
          '50': '#F0FDF4',
          '100': '#DCFCE7',
          '200': '#BBF7D0',
          '300': '#86EFAC',
          '400': '#4ADE80',
          '500': '#22C55E',
          '600': '#16A34A',
          '700': '#15803D',
          '800': '#166534',
          '900': '#14532D',
        },
      },
      // Tambahkan konfigurasi gradien kustom untuk latar belakang global
      backgroundImage: {
        'dark-gradient-bg': 'linear-gradient(to bottom right, #0A0A0A, #171717, #2F115C)',
      },
    },
  },
  plugins: [],
};