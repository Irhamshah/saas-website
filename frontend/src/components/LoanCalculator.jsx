import React, { useState, useEffect } from 'react';
import { X, Home, Car, CreditCard, DollarSign, Percent, Calendar, Download, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import './LoanCalculator.css';

function LoanCalculator({ onClose }) {
  const [loanType, setLoanType] = useState('mortgage'); // 'mortgage', 'auto', 'personal'
  const [loanAmount, setLoanAmount] = useState(300000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [termUnit, setTermUnit] = useState('years');
  const [downPayment, setDownPayment] = useState(60000);
  const [extraPayment, setExtraPayment] = useState(0);
  
  const [results, setResults] = useState(null);
  const [schedule, setSchedule] = useState([]);

  // Calculate loan
  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTerm, termUnit, downPayment, extraPayment]);

  const calculateLoan = () => {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const months = termUnit === 'years' ? loanTerm * 12 : loanTerm;

    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      setResults(null);
      setSchedule([]);
      return;
    }

    // Calculate monthly payment
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalWithExtra = monthlyPayment + extraPayment;

    // Generate amortization schedule
    let balance = principal;
    let totalInterest = 0;
    let totalPrincipal = 0;
    const scheduleData = [];
    let month = 1;

    while (balance > 0 && month <= months) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment + extraPayment;

      if (principalPayment > balance) {
        principalPayment = balance;
      }

      balance -= principalPayment;
      totalInterest += interestPayment;
      totalPrincipal += principalPayment;

      scheduleData.push({
        month,
        payment: (interestPayment + principalPayment).toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        balance: Math.max(0, balance).toFixed(2),
      });

      month++;
      if (balance <= 0) break;
    }

    const actualMonths = scheduleData.length;
    const savedMonths = months - actualMonths;
    const savedInterest = principal * monthlyRate * months - totalInterest;

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalWithExtra: totalWithExtra.toFixed(2),
      totalPaid: (totalPrincipal + totalInterest).toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPrincipal: totalPrincipal.toFixed(2),
      principal: principal.toFixed(2),
      actualMonths,
      savedMonths: extraPayment > 0 ? savedMonths : 0,
      savedInterest: extraPayment > 0 ? Math.max(0, savedInterest).toFixed(2) : 0,
    });

    setSchedule(scheduleData);
  };

  // Apply preset
  const applyPreset = (type) => {
    switch (type) {
      case 'mortgage':
        setLoanAmount(300000);
        setInterestRate(4.5);
        setLoanTerm(30);
        setDownPayment(60000);
        break;
      case 'auto':
        setLoanAmount(35000);
        setInterestRate(6.0);
        setLoanTerm(5);
        setDownPayment(5000);
        break;
      case 'personal':
        setLoanAmount(15000);
        setInterestRate(8.5);
        setLoanTerm(3);
        setDownPayment(0);
        break;
    }
    setLoanType(type);
    toast.success(`Applied ${type} preset`);
  };

  // Download schedule
  const downloadSchedule = () => {
    if (!results || schedule.length === 0) return;

    let content = `LOAN AMORTIZATION SCHEDULE\n`;
    content += `${'='.repeat(70)}\n\n`;
    content += `Loan Amount: $${loanAmount.toLocaleString()}\n`;
    content += `Down Payment: $${downPayment.toLocaleString()}\n`;
    content += `Principal: $${parseFloat(results.principal).toLocaleString()}\n`;
    content += `Interest Rate: ${interestRate}%\n`;
    content += `Loan Term: ${loanTerm} ${termUnit}\n`;
    content += `Monthly Payment: $${parseFloat(results.monthlyPayment).toLocaleString()}\n`;
    if (extraPayment > 0) {
      content += `Extra Payment: $${extraPayment.toLocaleString()}\n`;
      content += `Total Payment: $${parseFloat(results.totalWithExtra).toLocaleString()}\n`;
    }
    content += `\n${'='.repeat(70)}\n\n`;

    content += `Month\tPayment\t\tPrincipal\tInterest\tBalance\n`;
    content += `${'='.repeat(70)}\n`;

    schedule.forEach((row) => {
      content += `${row.month}\t$${parseFloat(row.payment).toLocaleString()}\t$${parseFloat(
        row.principal
      ).toLocaleString()}\t$${parseFloat(row.interest).toLocaleString()}\t$${parseFloat(
        row.balance
      ).toLocaleString()}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan-schedule.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Schedule downloaded!');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="interest-modal">
      <div className="interest-container">
        <div className="interest-header">
          <h2>Loan Calculator</h2>
          <p>Calculate monthly payments and amortization schedule</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="interest-content">
          {/* Presets */}
          <div className="presets-section">
            <label>Quick Presets:</label>
            <div className="presets-grid">
              <button
                className={`preset-btn ${loanType === 'mortgage' ? 'active' : ''}`}
                onClick={() => applyPreset('mortgage')}
              >
                <Home size={18} />
                Mortgage
              </button>
              <button
                className={`preset-btn ${loanType === 'auto' ? 'active' : ''}`}
                onClick={() => applyPreset('auto')}
              >
                <Car size={18} />
                Auto Loan
              </button>
              <button
                className={`preset-btn ${loanType === 'personal' ? 'active' : ''}`}
                onClick={() => applyPreset('personal')}
              >
                <CreditCard size={18} />
                Personal Loan
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="inputs-section">
            <div className="input-group">
              <label>
                <DollarSign size={16} />
                Loan Amount
              </label>
              <div className="input-with-currency">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                <TrendingDown size={16} />
                Down Payment
              </label>
              <div className="input-with-currency">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="input-group">
              <label>
                <Percent size={16} />
                Interest Rate (Annual)
              </label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min="0"
                  max="30"
                  step="0.1"
                />
                <span className="suffix">%</span>
              </div>
            </div>

            <div className="input-group">
              <label>
                <Calendar size={16} />
                Loan Term
              </label>
              <div className="input-with-select">
                <input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  min="1"
                  step="1"
                />
                <select value={termUnit} onChange={(e) => setTermUnit(e.target.value)}>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>
                <DollarSign size={16} />
                Extra Monthly Payment
              </label>
              <div className="input-with-currency">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value))}
                  min="0"
                  step="50"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {results && (
            <div className="actions-row">
              <button className="btn-action secondary" onClick={downloadSchedule}>
                <Download size={16} />
                Download Schedule
              </button>
            </div>
          )}

          {/* Results */}
          {results && (
            <>
              <div className="results-section">
                <h3>Monthly Payment</h3>
                <div className="results-grid">
                  <div className="result-card primary">
                    <div className="result-label">Monthly Payment</div>
                    <div className="result-value">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                  </div>

                  {extraPayment > 0 && (
                    <div className="result-card">
                      <div className="result-label">With Extra Payment</div>
                      <div className="result-value">{formatCurrency(results.totalWithExtra)}</div>
                    </div>
                  )}

                  <div className="result-card">
                    <div className="result-label">Total Interest</div>
                    <div className="result-value">{formatCurrency(results.totalInterest)}</div>
                  </div>

                  <div className="result-card">
                    <div className="result-label">Total Paid</div>
                    <div className="result-value">{formatCurrency(results.totalPaid)}</div>
                  </div>

                  {extraPayment > 0 && results.savedMonths > 0 && (
                    <>
                      <div className="result-card success">
                        <div className="result-label">Months Saved</div>
                        <div className="result-value">{results.savedMonths}</div>
                      </div>

                      <div className="result-card success">
                        <div className="result-label">Interest Saved</div>
                        <div className="result-value">
                          {formatCurrency(results.savedInterest)}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Visual */}
                <div className="visual-breakdown">
                  <div className="breakdown-bars">
                    <div
                      className="bar principal"
                      style={{
                        width: `${
                          (parseFloat(results.totalPrincipal) / parseFloat(results.totalPaid)) *
                          100
                        }%`,
                      }}
                    >
                      <span>Principal</span>
                    </div>
                    <div
                      className="bar interest"
                      style={{
                        width: `${
                          (parseFloat(results.totalInterest) / parseFloat(results.totalPaid)) * 100
                        }%`,
                      }}
                    >
                      <span>Interest</span>
                    </div>
                  </div>
                  <div className="breakdown-legend">
                    <div className="legend-item">
                      <span className="legend-color principal"></span>
                      <span>Principal: {formatCurrency(results.totalPrincipal)}</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color interest"></span>
                      <span>Interest: {formatCurrency(results.totalInterest)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amortization Schedule */}
              <div className="schedule-section">
                <h3>Amortization Schedule (First 12 Months)</h3>
                <div className="schedule-table">
                  <div className="table-header">
                    <div>Month</div>
                    <div>Payment</div>
                    <div>Principal</div>
                    <div>Interest</div>
                    <div>Balance</div>
                  </div>
                  {schedule.slice(0, 12).map((row) => (
                    <div key={row.month} className="table-row">
                      <div>{row.month}</div>
                      <div>{formatCurrency(row.payment)}</div>
                      <div>{formatCurrency(row.principal)}</div>
                      <div>{formatCurrency(row.interest)}</div>
                      <div className="balance">{formatCurrency(row.balance)}</div>
                    </div>
                  ))}
                </div>
                {schedule.length > 12 && (
                  <p className="table-note">
                    Showing first 12 months of {schedule.length} total payments. Download full
                    schedule above.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Info */}
          <div className="info-section">
            <h3>Understanding Your Loan</h3>
            <div className="info-cards">
              <div className="info-card">
                <h4>Monthly Payment</h4>
                <p>
                  Your fixed monthly payment includes both principal and interest. Early payments
                  are mostly interest, while later payments pay down more principal.
                </p>
              </div>
              <div className="info-card">
                <h4>Extra Payments</h4>
                <p>
                  Making extra payments directly reduces your principal balance, saving you
                  thousands in interest and shortening your loan term significantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanCalculator;