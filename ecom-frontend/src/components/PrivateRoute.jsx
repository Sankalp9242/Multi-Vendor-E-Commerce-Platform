import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom';



const PrivateRoute = ({ publicPage = false, adminOnly = false }) => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    const isAdmin = user?.roles?.includes("ROLE_ADMIN");
    const isSeller = user?.roles?.includes("ROLE_SELLER");

    // Public pages
    if (publicPage) {
        return user ? <Navigate to="/" replace /> : <Outlet />;
    }

    console.log("User:", user);
    console.log("Path:", location.pathname);

    // Admin-only logic
    if (adminOnly) {
        if (isSeller && !isAdmin) {
            const sellerAllowedPaths = ["/admin/orders", "/admin/products"];
            const sellerAllowed = sellerAllowedPaths.some(path =>
                location.pathname.startsWith(path)
            );

            if (!sellerAllowed) {
                return <Navigate to="/" replace />;
            }
        }

        if (!isAdmin && !isSeller) {
            return <Navigate to="/" replace />;
        }
    }

    // ✅ NORMAL LOGGED-IN USERS ALLOWED
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
