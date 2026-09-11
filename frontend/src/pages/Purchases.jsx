import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  IndianRupee,
  Package2,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    vendorName: "",
    purchaseDate: "",
    category: "Materials",
    quantity: "1",
    unitPrice: "",
    totalAmount: "",
    paymentStatus: "Pending",
    notes: "",
  });

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/purchases`);
      const result = await response.json();
      if (response.ok && result.success) setPurchases(result.data || []);
      else setMessage(result.message || "Unable to load purchases.");
    } catch (error) {
      setMessage(error.message || "Purchases API is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_URL}/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity || 0),
          unitPrice: Number(formData.unitPrice || 0),
          totalAmount: Number(formData.totalAmount || 0),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Purchase creation failed");
      setMessage("Purchase record added successfully.");
      setFormData({ itemName: "", vendorName: "", purchaseDate: "", category: "Materials", quantity: "1", unitPrice: "", totalAmount: "", paymentStatus: "Pending", notes: "" });
      fetchPurchases();
    } catch (error) {
      setMessage(error.message || "Unable to add purchase.");
    }
  };

  const purchaseSummary = {
    totalPurchases: purchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0),
    paidAmount: purchases
      .filter((purchase) => purchase.paymentStatus === "Paid")
      .reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0),
    pendingAmount: purchases
      .filter((purchase) => purchase.paymentStatus !== "Paid")
      .reduce((sum, purchase) => sum + Number(purchase.totalAmount || 0), 0),
    vendorCount: new Set(purchases.map((purchase) => purchase.vendorName)).size,
  };

  return (
    <div className="module-page purchases-page">
      <header className="module-header">
        <div className="module-title-wrap">
          <div className="module-title-icon purchases-accent">
            <ShoppingCart size={22} />
          </div>
          <div>
            <p className="module-kicker">Expense management</p>
            <h1>Purchases</h1>
          </div>
        </div>
        <div className="module-header-meta">
          <span>Expenses and vendor payments</span>
        </div>
      </header>

      {message && <div className="general-message success-message">{message}</div>}

      <section className="summary-grid">
        <article className="summary-card purchases-card">
          <div className="summary-card-icon"><IndianRupee size={16} /></div>
          <div className="summary-card-content">
            <span>Total Purchases</span>
            <strong>₹{formatMoney(purchaseSummary.totalPurchases)}</strong>
          </div>
        </article>
        <article className="summary-card purchases-card">
          <div className="summary-card-icon"><CreditCard size={16} /></div>
          <div className="summary-card-content">
            <span>Paid Amount</span>
            <strong>₹{formatMoney(purchaseSummary.paidAmount)}</strong>
          </div>
        </article>
        <article className="summary-card purchases-card">
          <div className="summary-card-icon"><Package2 size={16} /></div>
          <div className="summary-card-content">
            <span>Pending Amount</span>
            <strong>₹{formatMoney(purchaseSummary.pendingAmount)}</strong>
          </div>
        </article>
        <article className="summary-card purchases-card">
          <div className="summary-card-icon"><FileText size={16} /></div>
          <div className="summary-card-content">
            <span>Vendors</span>
            <strong>{purchaseSummary.vendorCount}</strong>
          </div>
        </article>
      </section>

      <section className="module-card purchases-card-shell">
        <div className="module-card-header">
          <div>
            <p className="card-eyebrow">Purchase entry</p>
            <h2>Add Purchase</h2>
          </div>
        </div>

        <form className="professional-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="purchase-item">Item Name <span className="required-mark">*</span></label>
              <input id="purchase-item" name="itemName" value={formData.itemName} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="purchase-vendor">Vendor Name <span className="required-mark">*</span></label>
              <input id="purchase-vendor" name="vendorName" value={formData.vendorName} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="purchase-date">Purchase Date <span className="required-mark">*</span></label>
              <input id="purchase-date" type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="purchase-category">Category</label>
              <select id="purchase-category" name="category" value={formData.category} onChange={handleChange}>
                <option value="Materials">Materials</option>
                <option value="Equipment">Equipment</option>
                <option value="Services">Services</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="purchase-quantity">Quantity</label>
              <input id="purchase-quantity" type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="purchase-unit-price">Unit Price <span className="required-mark">*</span></label>
              <div className="amount-input-wrapper">
                <span>₹</span>
                <input id="purchase-unit-price" type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="purchase-total">Total Amount <span className="required-mark">*</span></label>
              <div className="amount-input-wrapper">
                <span>₹</span>
                <input id="purchase-total" type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="purchase-status">Status</label>
              <select id="purchase-status" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
            <div className="form-field form-field-full">
              <label htmlFor="purchase-notes">Notes</label>
              <textarea id="purchase-notes" name="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder="Add purchase details" />
            </div>
          </div>

          <div className="form-action-row">
            <button type="submit" className="primary-action-button purchases-action">
              <Plus size={18} />
              Save Purchase
            </button>
          </div>
        </form>
      </section>

      <section className="module-card purchases-card-shell">
        <div className="module-card-header table-card-header">
          <div>
            <p className="card-eyebrow">Expense ledger</p>
            <h2>Purchase Ledger</h2>
          </div>
          <div className="table-toolbar">
            <div className="table-toolbar-controls">
              <div className="toolbar-search">
                <Search size={16} />
                <input value={""} onChange={() => {}} placeholder="Search vendor" aria-label="Search purchases" />
              </div>
              <select value={""} onChange={() => {}} aria-label="Purchase status filter">
                <option value="">All status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <FileText size={20} />
            <div>
              <strong>Loading purchases</strong>
              <span>Fetching recent vendor transactions.</span>
            </div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={20} />
            <div>
              <strong>No purchases found</strong>
              <span>Add a purchase to begin tracking expenses.</span>
            </div>
          </div>
        ) : (
          <>
            <div className="professional-table-wrapper">
              <table className="professional-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Vendor</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>{purchase.itemName}</td>
                      <td>{purchase.vendorName || "-"}</td>
                      <td>{purchase.purchaseDate || "-"}</td>
                      <td>{purchase.category || "-"}</td>
                      <td>{purchase.quantity || 0}</td>
                      <td>₹{formatMoney(purchase.totalAmount)}</td>
                      <td><span className={`status-pill ${String(purchase.paymentStatus || "").toLowerCase().replace(/\s+/g, "-")}`}>{purchase.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-container">
              <button type="button" className="pagination-button" aria-label="Previous page">
                <ChevronLeft size={16} />
              </button>
              <button type="button" className="pagination-button current-page">1</button>
              <button type="button" className="pagination-button" aria-label="Next page">
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Purchases;
