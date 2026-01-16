import {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {cartTotalCents, loadCart, saveCart, type CartItem} from "../cart";
import {createOrder} from "../api";
import {getToken} from "../auth";

function formatPrice(cents: number) {
    return (cents / 100).toFixed(2);
}

function digitsOnly(s: string) {
    return s.replace(/\D/g, "");
}

function detectBrand(digits: string) {
    if (digits.startsWith("4")) return "Visa";
    if (digits.startsWith("5")) return "Mastercard";
    if (digits.startsWith("3")) return "Amex";
    return "Card";
}

type Address = {
    fullName: string;
    email: string;
    line1: string;
    city: string;
    country: string;
};

export function CheckoutPage() {
    const navigate = useNavigate();

    const [checkedAuth, setCheckedAuth] = useState(false);

    const [cart] = useState<CartItem[]>(() => loadCart());
    const total = useMemo(() => cartTotalCents(cart), [cart]);

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [address, setAddress] = useState<Address>({
        fullName: "",
        email: "",
        line1: "",
        city: "",
        country: "Georgia",
    });

    const [paymentMethod, setPaymentMethod] = useState<"Card" | "Cash">("Card");
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvc, setCardCvc] = useState("");

    useEffect(() => {
        if (!getToken()) {
            navigate("/login", {state: {from: "/checkout"}});
            return;
        }
        setCheckedAuth(true);
    }, [navigate]);

    if (!checkedAuth) {
        return null;
    }

    if (cart.length === 0) {
        return (
            <div style={{padding: 24, fontFamily: "system-ui"}}>
                <h1>Checkout</h1>
                <p>Your cart is empty.</p>
                <Link to="/">Go shopping</Link>
            </div>
        );
    }

    async function placeOrder() {
        setError(null);

        if (!address.fullName.trim()) return setError("Full name is required.");
        if (!address.email.trim()) return setError("Email is required.");
        if (!address.line1.trim()) return setError("Address line is required.");
        if (!address.city.trim()) return setError("City is required.");
        if (!address.country.trim()) return setError("Country is required.");

        if (paymentMethod === "Card") {
            const digits = digitsOnly(cardNumber);
            if (digits.length < 12) return setError("Please enter a valid card number." );
            if (!cardExpiry.trim()) return setError("Expiry is required." );
            if (!cardCvc.trim()) return setError("CVC is required." );
            if (!cardName.trim()) return setError("Name on card is required." );
        }

        setSubmitting(true);
        try {
            const payload = cart.map((x) => ({
                productId: x.productId,
                quantity: x.quantity,
            }));

            const digits = digitsOnly(cardNumber);
            const last4 = digits.length >= 4 ? digits.slice(-4) : null;
            const brand = digits.length > 0 ? detectBrand(digits) : null;

            const created = await (createOrder as any)(payload, {
                paymentMethod,
                cardBrand: paymentMethod === "Card" ? brand : null,
                cardLast4: paymentMethod === "Card" ? last4 : null,
            });

            // Save last order confirmation info (optional)
            localStorage.setItem(
                "ecommerce_last_order_v1",
                JSON.stringify({
                    orderId: created.orderId ?? created.id ?? null,
                    createdAt: new Date().toISOString(),
                    totalCents: total,
                    items: cart,
                    address,
                    paymentMethod,
                })
            );

            // Clear cart
            saveCart([]);

            const orderId = created.orderId ?? created.id;
            navigate(`/order-confirmation/${orderId}`);
        } catch (e) {
            setError(
                String(e).includes("401") || String(e).toLowerCase().includes("auth")
                    ? "You must be logged in to place an order. Please log in and try again."
                    : String(e)
            );
            setSubmitting(false);
        }
    }

    return (
        <div className="container">
            <h1>Checkout</h1>

            {error && <p style={{color: "crimson"}}>{error}</p>}

            <div style={{display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr"}}>
                <div style={{gridColumn: "1 / -1"}}>
                    <label>
                        Full name
                        <input
                            value={address.fullName}
                            onChange={(e) => setAddress({...address, fullName: e.target.value})}
                        />
                    </label>
                </div>

                <div style={{gridColumn: "1 / -1"}}>
                    <label>
                        Email
                        <input
                            value={address.email}
                            onChange={(e) => setAddress({...address, email: e.target.value})}
                        />
                    </label>
                </div>

                <div style={{gridColumn: "1 / -1"}}>
                    <label>
                        Address line
                        <input
                            value={address.line1}
                            onChange={(e) => setAddress({...address, line1: e.target.value})}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        City
                        <input
                            value={address.city}
                            onChange={(e) => setAddress({...address, city: e.target.value})}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Country
                        <input
                            value={address.country}
                            onChange={(e) => setAddress({...address, country: e.target.value})}
                        />
                    </label>
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <h3 style={{ marginTop: 0 }}>Payment</h3>

                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            type="radio"
                            checked={paymentMethod === "Card"}
                            onChange={() => setPaymentMethod("Card")}
                        />
                        Card
                    </label>

                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            type="radio"
                            checked={paymentMethod === "Cash"}
                            onChange={() => setPaymentMethod("Cash")}
                        />
                        Cash
                    </label>
                </div>

                {paymentMethod === "Card" && (
                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        <input
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name on card"
                        />
                        <input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card number"
                        />
                        <div style={{ display: "flex", gap: 10 }}>
                            <input
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="MM/YY"
                            />
                            <input
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                placeholder="CVC"
                            />
                        </div>
                        <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                        </p>
                    </div>
                )}
            </div>

            <h3 style={{marginTop: 24}}>Order summary</h3>
            <ul>
                {cart.map((x) => (
                    <li key={x.productId}>
                        {x.name} × {x.quantity} — ${formatPrice(x.priceCents * x.quantity)}
                    </li>
                ))}
            </ul>

            <h2>Total: ${formatPrice(total)}</h2>

            <button
                className="btn"
                onClick={placeOrder}
                disabled={submitting}
                style={{ marginRight: 12 }}
            >
                {submitting ? "Placing order…" : "Place order"}
            </button>

            <Link className="btn secondary" to="/cart">Back to cart</Link>
        </div>
    );
}