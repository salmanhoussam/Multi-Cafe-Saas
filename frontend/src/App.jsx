// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';

// سنقوم بإنشاء هذه الصفحات في الخطوة القادمة
import MenuPage from './pages/MenuPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <CartProvider>
          <Routes>
            {/* مسار المنيو الرئيسي للعملاء */}
            <Route path="/" element={<MenuPage />} />
            
            {/* مسار لوحة التحكم لصاحب المطعم */}
            <Route path="/:restaurantSlug/dashboard" element={<DashboardPage />} />
          </Routes>
        </CartProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;