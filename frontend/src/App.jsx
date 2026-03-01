// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import MenuItemsPage from './pages/MenuItemsPage';
import NotFoundPage from './pages/NotFoundPage';

// ✅ قائمة بالـ slugs المحجوزة
const RESERVED_SLUGS = ['login', 'dashboard', 'admin', 'api', 'assets'];

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

// ✅ مكون منفصل لصفحة المطعم مع استخدام useParams
const RestaurantRoute = () => {
    const { slug } = useParams();
    
    if (RESERVED_SLUGS.includes(slug)) {
        return <Navigate to="/" />;
    }
    
    return <RestaurantPage />;
};

function App() {
    return (
        <Router>
            <LanguageProvider>
                <CartProvider>
                    <Routes>
                        {/* 🏠 الصفحة الرئيسية */}
                        <Route path="/" element={<HomePage />} />
                        
                        {/* 🔐 صفحة تسجيل الدخول */}
                        <Route path="/login" element={<LoginPage />} />
                        
                        {/* 🔐 صفحات الداشبورد مع slug ✅ */}
                        <Route path="/dashboard/:slug" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/dashboard/:slug/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                        <Route path="/dashboard/:slug/items" element={<ProtectedRoute><MenuItemsPage /></ProtectedRoute>} />
                        <Route path="/dashboard/:slug/items/:categoryId" element={<ProtectedRoute><MenuItemsPage /></ProtectedRoute>} />
                        
                        {/* 🍽️ صفحات المطاعم */}
                        <Route path="/:slug" element={<RestaurantRoute />} />
                        
                        {/* 404 */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </CartProvider>
            </LanguageProvider>
        </Router>
    );
}

export default App;