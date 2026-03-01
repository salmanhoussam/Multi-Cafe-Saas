/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // هذا السطر يخبر الأداة بالبحث في كل ملفات React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}