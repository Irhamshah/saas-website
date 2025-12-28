import React, { useState } from 'react';
import { X, Plus, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import './ReceiptGenerator.css';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';

function ReceiptGenerator({ onClose }) {
  // Receipt details
  const [receiptNumber, setReceiptNumber] = useState(`RCP-${Date.now().toString().slice(-6)}`);
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptTime, setReceiptTime] = useState(new Date().toTimeString().slice(0, 5));

  // Business info
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  // Customer info (optional)
  const [customerName, setCustomerName] = useState('');

  // Payment info
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Line items
  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Tax
  const [taxRate, setTaxRate] = useState(0);

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
      toast.error('Receipt must have at least one item');
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

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // ✅ Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('receipt', 3);

  // Generate PDF
  const generatePDF = async () => {
    // ✅ CHECK LIMIT FIRST
    if (!canUse) {
      showLimitError();
      return;
    }

    if (!businessName) {
      toast.error('Please enter business name');
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
      doc.setFontSize(28);
      doc.setTextColor(45, 91, 255);
      doc.text('RECEIPT', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Business Info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(businessName, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);

      if (businessAddress) {
        const addressLines = doc.splitTextToSize(businessAddress, pageWidth - 40);
        addressLines.forEach(line => {
          doc.text(line, pageWidth / 2, yPos, { align: 'center' });
          yPos += 5;
        });
      }

      if (businessPhone) {
        doc.text(businessPhone, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }

      if (businessEmail) {
        doc.text(businessEmail, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }

      yPos += 5;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Receipt details
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Receipt #: ${receiptNumber}`, 20, yPos);
      doc.text(`Date: ${receiptDate}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;

      if (customerName) {
        doc.text(`Customer: ${customerName}`, 20, yPos);
      }
      doc.text(`Time: ${receiptTime}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;

      doc.text(`Payment: ${paymentMethod}`, 20, yPos);
      yPos += 10;

      // Divider
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // Items header
      doc.setFont(undefined, 'bold');
      doc.text('Item', 20, yPos);
      doc.text('Qty', pageWidth - 80, yPos, { align: 'right' });
      doc.text('Price', pageWidth - 50, yPos, { align: 'right' });
      doc.text('Total', pageWidth - 20, yPos, { align: 'right' });
      yPos += 6;

      // Divider
      doc.setFont(undefined, 'normal');
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // Items
      items.forEach(item => {
        const descLines = doc.splitTextToSize(item.description, 90);
        doc.text(descLines, 20, yPos);
        doc.text(item.quantity.toString(), pageWidth - 80, yPos, { align: 'right' });
        doc.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - 50, yPos, { align: 'right' });
        doc.text(`$${item.total.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
        yPos += Math.max(descLines.length * 5, 6);
      });

      yPos += 4;
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      // Totals
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      doc.text('Subtotal:', pageWidth - 60, yPos);
      doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 6;

      if (taxRate > 0) {
        doc.text(`Tax (${taxRate}%):`, pageWidth - 60, yPos);
        doc.text(`$${tax.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 6;
      }

      // Total
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', pageWidth - 60, yPos);
      doc.text(`$${total.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 10;

      // Divider
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Thank you message
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });

      // Save
      doc.save(`receipt-${receiptNumber}.pdf`);
      // ✅ INCREMENT USAGE AFTER SUCCESS
      await incrementUsage();
      toast.success('Receipt generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate receipt');
    }
  };

  return (
    <div className="receipt-modal">
      <div className="receipt-container">
        <div className="receipt-header">
          <h2>Receipt Generator</h2>
          <p>Create professional receipts with automatic calculations</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="receipt-content">
          {/* ✅ ADD USAGE INDICATOR */}
          <UsageIndicator
            usageCount={usageCount}
            usageRemaining={usageRemaining}
            usagePercentage={usagePercentage}
            isPremium={isPremium}
          />
          {/* Receipt Info */}
          <div className="section">
            <h3>Receipt Details</h3>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Receipt Number *</label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="RCP-001"
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={receiptTime}
                  onChange={(e) => setReceiptTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="section">
            <h3>Business Information</h3>
            <div className="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="123 Business St, City, State 12345"
                rows={2}
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="contact@business.com"
                />
              </div>
            </div>
          </div>

          {/* Customer & Payment */}
          <div className="section">
            <h3>Customer & Payment</h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Customer Name (Optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Check">Check</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Payment">Mobile Payment</option>
                  <option value="Other">Other</option>
                </select>
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

            <div className="items-list">
              {items.map((item, index) => (
                <div key={item.id} className="item-card">
                  <div className="item-number">#{index + 1}</div>
                  <div className="item-fields">
                    <div className="form-group">
                      <label>Description *</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item name or description"
                      />
                    </div>
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Unit Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="form-group">
                        <label>Total</label>
                        <div className="total-display">${item.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-remove-item"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax */}
          <div className="section">
            <h3>Tax</h3>
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
                style={{ maxWidth: '200px' }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="summary-section">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
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

          {/* Generate Button */}
          <div className="actions">
            <button className="btn-generate" onClick={generatePDF}>
              <Download size={20} />
              Generate Receipt PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptGenerator;