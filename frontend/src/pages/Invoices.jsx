import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  IndianRupee,
  Plus,
  Printer,
  ReceiptText,
  Search,
} from "lucide-react";
import "../App.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ clientId: "", billingMonth: "", numberOfWorkers: "", subtotal: "", gstPercentage: "18", otherCharges: "0", discount: "0", dueDate: "", paymentStatus: "Pending", notes: "" });

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`);
      const result = await response.json();
      if (result.success) setClients(result.data || []);
    } catch {
      setMessage("Clients data could not be loaded.");
    }
  };

  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (monthFilter) params.set("month", monthFilter);
      params.set("page", String(page));
      params.set("limit", "10");

      const response = await fetch(`${API_URL}/invoices?${params.toString()}`);
      const result = await response.json();
      if (result.success) setInvoices(result.data || []);
      else setMessage(result.message || "Unable to fetch invoices");
    } catch (error) {
      setMessage(error.message || "Invoice API is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchInvoices(1);
  }, [search, statusFilter, monthFilter]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const payload = {
        ...formData,
        clientId: Number(formData.clientId),
        numberOfWorkers: Number(formData.numberOfWorkers || 0),
        subtotal: Number(formData.subtotal || 0),
        gstPercentage: Number(formData.gstPercentage || 0),
        otherCharges: Number(formData.otherCharges || 0),
        discount: Number(formData.discount || 0),
      };

      const response = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Invoice creation failed");
      setMessage("Invoice generated successfully.");
      setFormData({ clientId: "", billingMonth: "", numberOfWorkers: "", subtotal: "", gstPercentage: "18", otherCharges: "0", discount: "0", dueDate: "", paymentStatus: "Pending", notes: "" });
      fetchInvoices();
    } catch (error) {
      setMessage(error.message || "Unable to create invoice.");
    }
  };

  const invoiceSummary = {
    totalInvoices: invoices.length,
    totalBilled: invoices.reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0),
    paidAmount: invoices
      .filter((invoice) => invoice.payment_status === "Paid")
      .reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0),
    pendingAmount: invoices
      .filter((invoice) => invoice.payment_status !== "Paid")
      .reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0),
  };

  return (
    <div className="module-page invoices-page">
      <header className="module-header">
        <div className="module-title-wrap">
          <div className="module-title-icon invoices-accent">
            <ReceiptText size={22} />
          </div>
          <div>
            <p className="module-kicker">Collections</p>
            <h1>Invoices</h1>
          </div>
        </div>
        <div className="module-header-meta">
          <span>Invoice generation and collection tracking</span>
        </div>
      </header>

      {message && <div className="general-message success-message">{message}</div>}

      <section className="summary-grid">
        <article className="summary-card invoices-card">
          <div className="summary-card-icon"><FileText size={16} /></div>
          <div className="summary-card-content">
            <span>Total Invoices</span>
            <strong>{invoiceSummary.totalInvoices}</strong>
          </div>
        </article>
        <article className="summary-card invoices-card">
          <div className="summary-card-icon"><IndianRupee size={16} /></div>
          <div className="summary-card-content">
            <span>Total Billed</span>
            <strong>₹{formatMoney(invoiceSummary.totalBilled)}</strong>
          </div>
        </article>
        <article className="summary-card invoices-card">
          <div className="summary-card-icon"><CreditCard size={16} /></div>
          <div className="summary-card-content">
            <span>Paid Amount</span>
            <strong>₹{formatMoney(invoiceSummary.paidAmount)}</strong>
          </div>
        </article>
        <article className="summary-card invoices-card">
          <div className="summary-card-icon"><ReceiptText size={16} /></div>
          <div className="summary-card-content">
            <span>Pending Amount</span>
            <strong>₹{formatMoney(invoiceSummary.pendingAmount)}</strong>
          </div>
        </article>
      </section>

      <section className="module-card invoices-card-shell">
        <div className="module-card-header">
          <div>
            <p className="card-eyebrow">Billing workflow</p>
            <h2>Create Invoice</h2>
          </div>
        </div>

        <form className="professional-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="invoice-client">Client <span className="required-mark">*</span></label>
              <select id="invoice-client" name="clientId" value={formData.clientId} onChange={handleFormChange} required>
                <option value="">Select client</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.companyName}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="invoice-month">Billing Month <span className="required-mark">*</span></label>
              <input id="invoice-month" type="month" name="billingMonth" value={formData.billingMonth} onChange={handleFormChange} required />
            </div>
            <div className="form-field">
              <label htmlFor="invoice-workers">Workers</label>
              <input id="invoice-workers" type="number" name="numberOfWorkers" value={formData.numberOfWorkers} onChange={handleFormChange} />
            </div>
            <div className="form-field">
              <label htmlFor="invoice-subtotal">Subtotal <span className="required-mark">*</span></label>
              <div className="amount-input-wrapper">
                <span>₹</span>
                <input id="invoice-subtotal" type="number" name="subtotal" value={formData.subtotal} onChange={handleFormChange} required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="invoice-gst">GST %</label>
              <input id="invoice-gst" type="number" name="gstPercentage" value={formData.gstPercentage} onChange={handleFormChange} />
            </div>
            <div className="form-field">
              <label htmlFor="invoice-other-charges">Other Charges</label>
              <div className="amount-input-wrapper">
                <span>₹</span>
                <input id="invoice-other-charges" type="number" name="otherCharges" value={formData.otherCharges} onChange={handleFormChange} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="invoice-discount">Discount</label>
              <div className="amount-input-wrapper">
                <span>₹</span>
                <input id="invoice-discount" type="number" name="discount" value={formData.discount} onChange={handleFormChange} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="invoice-due-date">Due Date</label>
              <input id="invoice-due-date" type="date" name="dueDate" value={formData.dueDate} onChange={handleFormChange} />
            </div>
            <div className="form-field">
              <label htmlFor="invoice-status">Status</label>
              <select id="invoice-status" name="paymentStatus" value={formData.paymentStatus} onChange={handleFormChange}>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="form-field form-field-full">
              <label htmlFor="invoice-notes">Notes</label>
              <textarea id="invoice-notes" name="notes" value={formData.notes} onChange={handleFormChange} rows="4" placeholder="Add billing notes" />
            </div>
          </div>

          <div className="form-action-row">
            <button type="submit" className="primary-action-button invoices-action">
              <Plus size={18} />
              Create Invoice
            </button>
          </div>
        </form>
      </section>

      <section className="module-card invoices-card-shell">
        <div className="module-card-header table-card-header">
          <div>
            <p className="card-eyebrow">Billing register</p>
            <h2>Invoice Register</h2>
          </div>
          <div className="table-toolbar">
            <div className="table-toolbar-controls">
              <div className="toolbar-search">
                <Search size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search client" aria-label="Search invoices" />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Invoice filter by status">
                <option value="">All status</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
              <input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} aria-label="Invoice month filter" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <FileText size={20} />
            <div>
              <strong>Loading invoices</strong>
              <span>Preparing billing records.</span>
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <ReceiptText size={20} />
            <div>
              <strong>No invoices found</strong>
              <span>Create an invoice to begin tracking collections.</span>
            </div>
          </div>
        ) : (
          <>
            <div className="professional-table-wrapper">
              <table className="professional-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Client</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_number}</td>
                      <td>{invoice.clientName || "-"}</td>
                      <td>{invoice.billing_month}</td>
                      <td>₹{formatMoney(invoice.grand_total)}</td>
                      <td><span className={`status-pill ${String(invoice.payment_status || "").toLowerCase().replace(/\s+/g, "-")}`}>{invoice.payment_status}</span></td>
                      <td>
                        <div className="table-action-group">
                          <button type="button" className="icon-button" aria-label="Print invoice" onClick={() => setSelectedInvoice(invoice)}>
                            <Printer size={15} />
                          </button>
                        </div>
                      </td>
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

      {selectedInvoice && (
        <div className="print-slip-wrapper">
          <div className="print-slip">
            <div className="print-header">
              <h3>Invoice</h3>
              <button type="button" onClick={() => window.print()}>Print</button>
            </div>
            <div className="slip-grid">
              <div><strong>Invoice</strong><span>{selectedInvoice.invoice_number}</span></div>
              <div><strong>Client</strong><span>{selectedInvoice.clientName}</span></div>
              <div><strong>Month</strong><span>{selectedInvoice.billing_month}</span></div>
              <div><strong>Subtotal</strong><span>₹{formatMoney(selectedInvoice.subtotal)}</span></div>
              <div><strong>GST</strong><span>₹{formatMoney(selectedInvoice.gst_amount)}</span></div>
              <div><strong>Other Charges</strong><span>₹{formatMoney(selectedInvoice.other_charges)}</span></div>
              <div><strong>Discount</strong><span>₹{formatMoney(selectedInvoice.discount)}</span></div>
              <div><strong>Grand Total</strong><span>₹{formatMoney(selectedInvoice.grand_total)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;
