import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  IndianRupee,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    customerName: "",
    saleDate: "",
    quantity: "1",
    unitPrice: "",
    totalAmount: "",
    paymentStatus: "Pending",
    notes: "",
  });

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/sales`);
      const result = await response.json();
      if (response.ok && result.success) setSales(result.data || []);
      else setMessage(result.message || "Unable to load sales.");
    } catch (error) {
      setMessage(error.message || "Sales API is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_URL}/sales`, {
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
      if (!response.ok || !result.success) throw new Error(result.message || "Sale creation failed");
      setMessage("Sales record added successfully.");
      setFormData({ title: "", customerName: "", saleDate: "", quantity: "1", unitPrice: "", totalAmount: "", paymentStatus: "Pending", notes: "" });
      fetchSales();
    } catch (error) {
      setMessage(error.message || "Unable to add sales record.");
    }
  };

  const salesSummary = {
    totalSales: sales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0),
    paidAmount: sales
      .filter((sale) => sale.paymentStatus === "Paid")
      .reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0),
    pendingAmount: sales
      .filter((sale) => sale.paymentStatus !== "Paid")
      .reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0),
    transactionCount: sales.length,
  };

  return (
    <div className="module-page sales-page">
      <header className="module-header">
        <div className="module-title-wrap">
          <div className="module-title-icon sales-accent">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="module-kicker">Revenue</p>
            <h1>Sales</h1>
          </div>
        </div>
        <div className="module-header-meta">
          <span>Track incoming sales and billing</span>
        </div>
      </header>

      {message && <div className="general-message success-message">{message}</div>}

      <section className="summary-grid">
        <article className="summary-card sales-card">
          <div className="summary-card-icon"><IndianRupee size={16} /></div>
          <div className="summary-card-content">
            <span>Total Sales</span>
            <strong>₹{formatMoney(salesSummary.totalSales)}</strong>
          </div>
        </article>
        <article className="summary-card sales-card">
          <div className="summary-card-icon"><CreditCard size={16} /></div>
          <div className="summary-card-content">
            <span>Paid Amount</span>
            <strong>₹{formatMoney(salesSummary.paidAmount)}</strong>
          </div>
        </article>
        <article className="summary-card sales-card">
          <div className="summary-card-icon"><FileText size={16} /></div>
          <div className="summary-card-content">
            <span>Pending Amount</span>
            <strong>₹{formatMoney(salesSummary.pendingAmount)}</strong>
          </div>
        </article>
        <article className="summary-card sales-card">
          <div className="summary-card-icon"><ArrowUpRight size={16} /></div>
          <div className="summary-card-content">
            <span>Transactions</span>
            <strong>{salesSummary.transactionCount}</strong>
          </div>
        </article>
      </section>

      <section className="module-card sales-card-shell">
        <div className="module-card-header">
          <div>
            <p className="card-eyebrow">Sales entry</p>
            <h2>Add Sales Record</h2>
          </div>
        </div>

        <form className="professional-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="sales-title">Product / Service <span className="required-mark">*</span></label>
              <input id="sales-title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="sales-customer">Customer Name <span className="required-mark">*</span></label>
              <input id="sales-customer" name="customerName" value={formData.customerName} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="sales-date">Sale Date <span className="required-mark">*</span></label>
              <input id="sales-date" type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="sales-quantity">Quantity</label>
              <input id="sales-quantity" type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="sales-unit-price">Unit Price <span className="required-mark">*</span></label>
              <div className="amount-input-wrapper">
                <span>₹</span>
                <input id="sales-unit-price" type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="sales-total">Total Amount <span className="required-mark">*</span></label>
              <div className="amount-input-wrapper">
                <span>₹</span>
                <input id="sales-total" type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="sales-status">Status</label>
              <select id="sales-status" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
            <div className="form-field form-field-full">
              <label htmlFor="sales-notes">Notes</label>
              <textarea id="sales-notes" name="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder="Add additional details" />
            </div>
          </div>

          <div className="form-action-row">
            <button type="submit" className="primary-action-button sales-action">
              <Plus size={18} />
              Save Sale
            </button>
          </div>
        </form>
      </section>

      <section className="module-card sales-card-shell">
        <div className="module-card-header table-card-header">
          <div>
            <p className="card-eyebrow">Transaction ledger</p>
            <h2>Sales Register</h2>
          </div>
          <div className="table-toolbar">
            <div className="table-toolbar-controls">
              <div className="toolbar-search">
                <Search size={16} />
                <input value={""} onChange={() => {}} placeholder="Search client" aria-label="Search sales" />
              </div>
              <select value={""} onChange={() => {}} aria-label="Sales filter by status">
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
              <strong>Loading sales</strong>
              <span>Fetching the latest sales entries.</span>
            </div>
          </div>
        ) : sales.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={20} />
            <div>
              <strong>No sales found</strong>
              <span>Start by adding your first sales record.</span>
            </div>
          </div>
        ) : (
          <>
            <div className="professional-table-wrapper">
              <table className="professional-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.title}</td>
                      <td>{sale.customerName || "-"}</td>
                      <td>{sale.saleDate || "-"}</td>
                      <td>{sale.quantity || 0}</td>
                      <td>₹{formatMoney(sale.unitPrice)}</td>
                      <td>₹{formatMoney(sale.totalAmount)}</td>
                      <td><span className={`status-pill ${String(sale.paymentStatus || "").toLowerCase().replace(/\s+/g, "-")}`}>{sale.paymentStatus}</span></td>
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

export default Sales;
