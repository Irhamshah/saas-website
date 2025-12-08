import React, { useState } from 'react';
import { X, Plus, Trash2, Download, Calendar, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import './InvoiceGenerator.css';

function InvoiceGenerator({ onClose }) {
  // Invoice details
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Company info
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Client info
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Line items
  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Tax and discount
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percent'); // percent or fixed

  // Notes
  const [notes, setNotes] = useState('');

  // Add item
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  // Remove item
  const removeItem = (id) => {
    if (items.length === 1) {
      toast.error('Invoice must have at least one item');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  // Update item
  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate total
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percent') {
      return (subtotal * discount) / 100;
    }
    return discount;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const taxableAmount = subtotal - discountAmount;
    return (taxableAmount * taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const taxAmount = calculateTax();
    return subtotal - discountAmount + taxAmount;
  };

  // Generate PDF
  const generatePDF = () => {
    if (!companyName || !clientName) {
      toast.error('Please enter company and client names');
      return;
    }

    if (items.some(item => !item.description)) {
      toast.error('Please fill in all item descriptions');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPos = 20;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(45, 91, 255);
      doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Invoice details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
      doc.text(`Date: ${invoiceDate}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
      if (dueDate) {
        doc.text(`Due Date: ${dueDate}`, pageWidth - 20, yPos, { align: 'right' });
      }
      yPos += 10;

      // From section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('From:', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(companyName, 20, yPos);
      yPos += 5;
      
      doc.setFont(undefined, 'normal');
      if (companyEmail) {
        doc.text(companyEmail, 20, yPos);
        yPos += 5;
      }
      if (companyPhone) {
        doc.text(companyPhone, 20, yPos);
        yPos += 5;
      }
      if (companyAddress) {
        const addressLines = doc.splitTextToSize(companyAddress, 80);
        doc.text(addressLines, 20, yPos);
        yPos += addressLines.length * 5;
      }
      yPos += 10;

      // To section
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Bill To:', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.text(clientName, 20, yPos);
      yPos += 5;
      
      doc.setFont(undefined, 'normal');
      if (clientEmail) {
        doc.text(clientEmail, 20, yPos);
        yPos += 5;
      }
      if (clientPhone) {
        doc.text(clientPhone, 20, yPos);
        yPos += 5;
      }
      if (clientAddress) {
        const addressLines = doc.splitTextToSize(clientAddress, 80);
        doc.text(addressLines, 20, yPos);
        yPos += addressLines.length * 5;
      }
      yPos += 10;

      // Items table header
      doc.setFillColor(45, 91, 255);
      doc.rect(20, yPos, pageWidth - 40, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Description', 25, yPos + 5);
      doc.text('Qty', pageWidth - 90, yPos + 5, { align: 'center' });
      doc.text('Unit Price', pageWidth - 60, yPos + 5, { align: 'center' });
      doc.text('Total', pageWidth - 25, yPos + 5, { align: 'right' });
      yPos += 12;

      // Items
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      items.forEach((item, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(20, yPos - 4, pageWidth - 40, 8, 'F');
        }

        const descLines = doc.splitTextToSize(item.description, 100);
        doc.text(descLines, 25, yPos);
        doc.text(item.quantity.toString(), pageWidth - 90, yPos, { align: 'center' });
        doc.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - 60, yPos, { align: 'center' });
        doc.text(`$${item.total.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
        
        yPos += Math.max(descLines.length * 5, 8);
      });

      yPos += 5;
      doc.setDrawColor(220, 220, 220);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Totals
      const subtotal = calculateSubtotal();
      const discountAmount = calculateDiscount();
      const taxAmount = calculateTax();
      const total = calculateTotal();

      doc.setFontSize(10);
      doc.text('Subtotal:', pageWidth - 70, yPos);
      doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 6;

      if (discount > 0) {
        doc.text(`Discount (${discountType === 'percent' ? discount + '%' : '$' + discount}):`, pageWidth - 70, yPos);
        doc.text(`-$${discountAmount.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
        yPos += 6;
      }

      if (taxRate > 0) {
        doc.text(`Tax (${taxRate}%):`, pageWidth - 70, yPos);
        doc.text(`$${taxAmount.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
        yPos += 6;
      }

      // Total
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setFillColor(45, 91, 255);
      doc.rect(pageWidth - 90, yPos - 3, 70, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Total:', pageWidth - 70, yPos + 4);
      doc.text(`$${total.toFixed(2)}`, pageWidth - 25, yPos + 4, { align: 'right' });
      yPos += 15;

      // Notes
      if (notes) {
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text('Notes:', 20, yPos);
        yPos += 6;
        const notesLines = doc.splitTextToSize(notes, pageWidth - 40);
        doc.text(notesLines, 20, yPos);
      }

      // Save
      doc.save(`invoice-${invoiceNumber}.pdf`);
      toast.success('Invoice generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate invoice');
    }
  };

  return (
    <div className="invoice-modal">
      <div className="invoice-container">
        <div className="invoice-header">
          <h2>Invoice Generator</h2>
          <p>Create professional invoices with automatic calculations</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="invoice-content">
          {/* Invoice Info */}
          <div className="section">
            <h3>Invoice Details</h3>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Invoice Number *</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-001"
                />
              </div>
              <div className="form-group">
                <label>Invoice Date *</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Company & Client Info */}
          <div className="section-row">
            <div className="section">
              <h3>From (Your Company)</h3>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your Company Inc."
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                  rows={2}
                />
              </div>
            </div>

            <div className="section">
              <h3>Bill To (Client)</h3>
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client Name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@email.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 987-6543"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="456 Client Ave, City, State 67890"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="section">
            <div className="section-header">
              <h3>Items</h3>
              <button className="btn-add" onClick={addItem}>
                <Plus size={18} />
                Add Item
              </button>
            </div>

            <div className="items-table">
              <div className="items-header">
                <div className="col-description">Description *</div>
                <div className="col-quantity">Quantity</div>
                <div className="col-price">Unit Price</div>
                <div className="col-total">Total</div>
                <div className="col-actions"></div>
              </div>

              {items.map((item) => (
                <div key={item.id} className="item-row">
                  <div className="col-description">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-quantity">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-price">
                    <div className="price-input">
                      <DollarSign size={16} />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="col-total">
                    ${item.total.toFixed(2)}
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn-remove"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax and Discount */}
          <div className="section">
            <h3>Adjustments</h3>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Discount</label>
                <div className="discount-group">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="percent">%</option>
                    <option value="fixed">$</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-section">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount ({discountType === 'percent' ? `${discount}%` : `$${discount}`}):</span>
                <span>-${calculateDiscount().toFixed(2)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="summary-row">
                <span>Tax ({taxRate}%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="section">
            <h3>Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, thank you message, or any other notes..."
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <div className="actions">
            <button className="btn-generate" onClick={generatePDF}>
              <Download size={20} />
              Generate Invoice PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceGenerator;