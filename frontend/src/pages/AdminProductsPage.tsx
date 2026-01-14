import { useState } from "react";
import { adminCreateProduct } from "../api";

export function AdminProductsPage() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState(4999);
    const [categorySlug, setCategorySlug] = useState("toys");
    const [isActive, setIsActive] = useState(true);
    const [msg, setMsg] = useState<string | null>(null);

    async function onCreate() {
        setMsg(null);
        try {
            const res = await adminCreateProduct({
                name,
                priceCents: price,
                categorySlug,
                isActive,
            });
            setMsg(`Created: ${res.id ?? res.Id ?? res.pId ?? res?.id ?? JSON.stringify(res)}`);
        } catch (e) {
            setMsg(String(e));
        }
    }

    return (
        <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 600 }}>
            <h1>Admin: Products</h1>

            {msg && <p>{msg}</p>}

            <div style={{ display: "grid", gap: 10 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ padding: 8 }} />
                <input value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number" placeholder="Price cents" style={{ padding: 8 }} />
                <input value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} placeholder="Category slug (e.g. toys)" style={{ padding: 8 }} />

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Active
                </label>

                <button onClick={onCreate}>Create product</button>
            </div>
        </div>
    );
}