import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import {ProductListPage} from "./pages/ProductListPage";
import {ProductDetailPage} from "./pages/ProductDetailPage";
import {CartPage} from "./pages/CartPage";
import {CheckoutPage} from "./pages/CheckoutPage";
import {OrderConfirmationPage} from "./pages/OrderConfirmationPage";
import {useEffect, useState} from "react";
import {fetchMe} from "./api";
import {clearToken, getToken} from "./auth";
import {LoginPage} from "./pages/LoginPage";
import {OrdersPage} from "./pages/OrdersPage";
import {OrderDetailsPage} from "./pages/OrderDetailsPage";
import {AdminProductsPage} from "./pages/AdminProductsPage";

export default function App() {
    const [me, setMe] = useState<any | null>(null);

    useEffect(() => {
        function loadMe() {
            if (!getToken()) {
                setMe(null);
                return;
            }

            fetchMe()
                .then(setMe)
                .catch(() => {
                    clearToken();
                    setMe(null);
                });
        }

        loadMe(); // run once at startup

        window.addEventListener("auth-changed", loadMe);
        return () => window.removeEventListener("auth-changed", loadMe);
    }, []);
    return (
        <BrowserRouter>
            <div className="nav">
                <div className="nav-inner">
                    <Link className="brand" to="/">Ecommerce</Link>
                    <Link to="/">Shop</Link>
                    <Link to="/cart">Cart</Link>
                    <Link to="/orders">Orders</Link>

                    {me?.role === "Admin" && <Link to="/admin/products">Admin</Link>}

                    <div style={{marginLeft: "auto"}}/>

                    {me ? (
                        <>
                            <span className="pill">{me.email}</span>
                            <button
                                className="btn secondary"
                                onClick={() => {
                                    clearToken();
                                    setMe(null);
                                    window.dispatchEvent(new Event("auth-changed"));
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link className="btn" to="/login">Login</Link>
                    )}
                </div>
            </div>

            <div className="container">
                <div className="content">
                    <Routes>
                        <Route path="/" element={<ProductListPage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/products/:id" element={<ProductDetailPage/>}/>
                        <Route path="/cart" element={<CartPage/>}/>
                        <Route path="/checkout" element={<CheckoutPage/>}/>
                        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage/>}/>
                        <Route path="/orders" element={<OrdersPage/>}/>
                        <Route path="/orders/:id" element={<OrderDetailsPage/>}/>
                        <Route
                            path="/admin/products"
                            element={
                                me?.role === "Admin" ? (
                                    <AdminProductsPage/>
                                ) : (
                                    <div style={{padding: 24, fontFamily: "system-ui"}}>
                                        <h2>Forbidden</h2>
                                        <p>You must be an admin to view this page.</p>
                                        <Link to="/">Go home</Link>
                                    </div>
                                )
                            }
                        />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}