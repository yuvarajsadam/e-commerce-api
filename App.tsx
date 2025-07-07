
import React, { useState, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { ProductList } from './components/ProductList';
import { CartView } from './components/CartView';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { Modal } from './components/common/Modal';
import { Product, Role } from './types';
import { mockApiService } from './services/mockApiService';
import { Button } from './components/common/Button';

type View = 'products' | 'admin' | 'login';

const AppContent: React.FC = () => {
    const { isAuthenticated, role, isLoading, token } = useAuth();
    const [view, setView] = useState<View>('products');
    const [isCartOpen, setIsCartOpen] = useState(false);

    // State for modals
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // State for admin forms
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);

    const handleViewChange = (newView: 'products' | 'admin') => {
        if (newView === 'admin' && role !== Role.ADMIN) {
            // If non-admin tries to access admin, show login
            setIsLoginModalOpen(true);
            return;
        }
        setEditingProduct(null); // Clear editing state when changing views
        setView(newView);
    };

    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        // If user logged in as admin to see admin panel, switch to it
        if(role === Role.ADMIN && view !== 'admin') {
            setView('admin');
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setView('admin');
    };
    
    const handleDeleteRequest = (productId: number) => {
        setProductToDelete(productId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if(productToDelete && token){
            await mockApiService.deleteProduct(productToDelete, token);
            // This is a bit of a hack. In a real app with a proper data fetching library (like React Query),
            // this would be handled by invalidating the products query. Here, we force a view switch to re-trigger the fetch.
            setView('products'); 
            setTimeout(() => setView(view), 0);
        }
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    const handleAdminFormSubmit = () => {
        setEditingProduct(null);
        setView('products');
    };

    const handleAdminFormCancel = () => {
        setEditingProduct(null);
        setView('products');
    }
    
    if (isLoading) {
        return <div className="h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }

    const renderContent = () => {
        if (!isAuthenticated && view !== 'products') {
            return (
                 <div className="container mx-auto px-6 py-20">
                    <Login onLoginSuccess={handleLoginSuccess} />
                </div>
            );
        }

        switch (view) {
            case 'admin':
                return <AdminDashboard editingProduct={editingProduct} onFormSubmit={handleAdminFormSubmit} onCancel={handleAdminFormCancel} />;
            case 'products':
            default:
                return <ProductList onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteRequest}/>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header
                onViewChange={handleViewChange}
                onCartToggle={() => setIsCartOpen(true)}
                onLoginClick={() => setIsLoginModalOpen(true)}
            />
            <main className="flex-grow">
                {renderContent()}
            </main>
            <CartView isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            
            <Modal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                title="Login Required"
            >
                <Login onLoginSuccess={handleLoginSuccess} />
            </Modal>
            
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                    </>
                }
            >
                <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            </Modal>

            <footer className="bg-white border-t mt-auto">
                <div className="container mx-auto px-6 py-4 text-center text-gray-600">
                    &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <CartProvider>
            <AppContent />
        </CartProvider>
    </AuthProvider>
);

export default App;
