import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Percent, Calendar, PieChart, Download, RefreshCw, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import './InterestCalculator.css';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';

function InterestCalculator({ onClose }) {
  const [mode, setMode] = useState('simple'); // 'simple', 'compound', 'investment'
  
  // Common inputs
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(5);
  const [timeUnit, setTimeUnit] = useState('years'); // 'years' or 'months'
  
  // Compound specific
  const [frequency, setFrequency] = useState('monthly'); // 'daily', 'monthly', 'quarterly', 'annually'
  
  // Investment specific
  const [contribution, setContribution] = useState(200);
  const [contributionFrequency, setContributionFrequency] = useState('monthly');
  
  // Results
  const [results, setResults] = useState(null);
  const [breakdown, setBreakdown] = useState([]);

  // ✅ Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('interest-calculator', 3);

  // Calculate Simple Interest
  const calculateSimple = () => {
    const t = timeUnit === 'months' ? time / 12 : time;
    const interest = (principal * rate * t) / 100;
    const total = principal + interest;
    
    return {
      principal,
      interest: interest.toFixed(2),
      total: total.toFixed(2),
      effectiveRate: rate.toFixed(2),
    };
  };

  // Calculate Compound Interest
  const calculateCompound = () => {
    const frequencyMap = {
      daily: 365,
      monthly: 12,
      quarterly: 4,
      annually: 1,
    };
    
    const n = frequencyMap[frequency];
    const t = timeUnit === 'months' ? time / 12 : time;
    const r = rate / 100;
    
    const amount = principal * Math.pow((1 + r / n), n * t);
    const interest = amount - principal;
    
    // Calculate effective annual rate
    const effectiveRate = (Math.pow(1 + r / n, n) - 1) * 100;
    
    // Generate breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= Math.ceil(t); year++) {
      const yearAmount = principal * Math.pow((1 + r / n), n * year);
      const yearInterest = yearAmount - principal;
      yearlyBreakdown.push({
        year,
        amount: yearAmount.toFixed(2),
        interest: yearInterest.toFixed(2),
        principal: principal.toFixed(2),
      });
    }
    
    return {
      principal,
      interest: interest.toFixed(2),
      total: amount.toFixed(2),
      effectiveRate: effectiveRate.toFixed(2),
      breakdown: yearlyBreakdown,
    };
  };

  // Calculate Investment with Regular Contributions
  const calculateInvestment = () => {
    const frequencyMap = {
      daily: 365,
      weekly: 52,
      monthly: 12,
      quarterly: 4,
      annually: 1,
    };
    
    const compoundFreq = frequencyMap[frequency];
    const contributionFreq = frequencyMap[contributionFrequency];
    const t = timeUnit === 'months' ? time / 12 : time;
    const r = rate / 100;
    
    // Future value of principal with compound interest
    const fvPrincipal = principal * Math.pow((1 + r / compoundFreq), compoundFreq * t);
    
    // Future value of annuity (regular contributions)
    const periodsPerYear = contributionFreq;
    const ratePerPeriod = r / compoundFreq;
    const totalPeriods = contributionFreq * t;
    const compoundsPerContribution = compoundFreq / contributionFreq;
    
    let fvContributions = 0;
    for (let i = 0; i < totalPeriods; i++) {
      const periodsRemaining = (totalPeriods - i - 1) * (compoundFreq / contributionFreq);
      fvContributions += contribution * Math.pow(1 + ratePerPeriod, periodsRemaining);
    }
    
    const totalAmount = fvPrincipal + fvContributions;
    const totalContributions = contribution * contributionFreq * t;
    const totalInvested = principal + totalContributions;
    const totalInterest = totalAmount - totalInvested;
    
    // Generate yearly breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= Math.ceil(t); year++) {
      const yearPrincipal = principal * Math.pow((1 + r / compoundFreq), compoundFreq * year);
      const yearContributions = contribution * contributionFreq * year;
      
      let yearFvContributions = 0;
      const yearPeriods = contributionFreq * year;
      for (let i = 0; i < yearPeriods; i++) {
        const periodsRemaining = (yearPeriods - i - 1) * (compoundFreq / contributionFreq);
        yearFvContributions += contribution * Math.pow(1 + ratePerPeriod, periodsRemaining);
      }
      
      const yearTotal = yearPrincipal + yearFvContributions;
      const yearInvested = principal + (contribution * contributionFreq * year);
      const yearInterest = yearTotal - yearInvested;
      
      yearlyBreakdown.push({
        year,
        amount: yearTotal.toFixed(2),
        contributions: yearContributions.toFixed(2),
        interest: yearInterest.toFixed(2),
        invested: yearInvested.toFixed(2),
      });
    }
    
    return {
      principal,
      totalContributions: totalContributions.toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      interest: totalInterest.toFixed(2),
      total: totalAmount.toFixed(2),
      effectiveRate: ((Math.pow(1 + r / compoundFreq, compoundFreq) - 1) * 100).toFixed(2),
      breakdown: yearlyBreakdown,
    };
  };

  // ✅ Calculate on button click
  const handleCalculate = async () => {
    // ✅ CHECK LIMIT FIRST
    if (!canUse) {
      showLimitError();
      return;
    }

    if (principal <= 0) {
      toast.error('Principal must be greater than 0');
      return;
    }

    if (rate <= 0) {
      toast.error('Interest rate must be greater than 0');
      return;
    }

    if (time <= 0) {
      toast.error('Time period must be greater than 0');
      return;
    }

    let result;
    if (mode === 'simple') {
      result = calculateSimple();
    } else if (mode === 'compound') {
      result = calculateCompound();
    } else {
      result = calculateInvestment();
    }
    
    setResults(result);
    setBreakdown(result.breakdown || []);

    // ✅ INCREMENT USAGE AFTER SUCCESS
    await incrementUsage();
    
    toast.success('Calculated successfully!');
  };

  // Download report
  const downloadReport = () => {
    if (!results) return;
    
    let content = `${mode.toUpperCase()} INTEREST CALCULATOR REPORT\n`;
    content += `${'='.repeat(50)}\n\n`;
    
    content += `INPUTS:\n`;
    content += `Principal Amount: $${principal.toLocaleString()}\n`;
    content += `Interest Rate: ${rate}% per year\n`;
    content += `Time Period: ${time} ${timeUnit}\n`;
    
    if (mode === 'compound') {
      content += `Compound Frequency: ${frequency}\n`;
    }
    
    if (mode === 'investment') {
      content += `Regular Contribution: $${contribution.toLocaleString()}\n`;
      content += `Contribution Frequency: ${contributionFrequency}\n`;
    }
    
    content += `\nRESULTS:\n`;
    content += `Initial Principal: $${parseFloat(results.principal).toLocaleString()}\n`;
    
    if (mode === 'investment') {
      content += `Total Contributions: $${parseFloat(results.totalContributions).toLocaleString()}\n`;
      content += `Total Invested: $${parseFloat(results.totalInvested).toLocaleString()}\n`;
    }
    
    content += `Total Interest Earned: $${parseFloat(results.interest).toLocaleString()}\n`;
    content += `Final Amount: $${parseFloat(results.total).toLocaleString()}\n`;
    content += `Effective Annual Rate: ${results.effectiveRate}%\n`;
    
    if (breakdown.length > 0) {
      content += `\nYEARLY BREAKDOWN:\n`;
      content += `${'='.repeat(50)}\n`;
      breakdown.forEach(item => {
        content += `\nYear ${item.year}:\n`;
        content += `  Total Amount: $${parseFloat(item.amount).toLocaleString()}\n`;
        content += `  Interest Earned: $${parseFloat(item.interest).toLocaleString()}\n`;
        if (mode === 'investment') {
          content += `  Contributions: $${parseFloat(item.contributions).toLocaleString()}\n`;
        }
      });
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}-interest-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  // Reset to defaults
  const handleReset = () => {
    setPrincipal(10000);
    setRate(5);
    setTime(5);
    setTimeUnit('years');
    setFrequency('monthly');
    setContribution(200);
    setContributionFrequency('monthly');
    toast.success('Reset to defaults');
  };

  // ✅ Clear results
  const handleClear = () => {
    setResults(null);
    setBreakdown([]);
    toast.success('Results cleared');
  };

  // Format currency
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
          <h2>Interest Calculator</h2>
          <p>Calculate simple interest, compound interest, and investment returns</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="interest-content">
          {/* ✅ USAGE INDICATOR */}
          <UsageIndicator
            usageCount={usageCount}
            usageRemaining={usageRemaining}
            usagePercentage={usagePercentage}
            isPremium={isPremium}
          />

          {/* Mode Selection */}
          <div className="mode-section">
            <div className="mode-tabs">
              <button
                className={`mode-tab ${mode === 'simple' ? 'active' : ''}`}
                onClick={() => setMode('simple')}
                disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
              >
                <DollarSign size={18} />
                Simple Interest
              </button>
              <button
                className={`mode-tab ${mode === 'compound' ? 'active' : ''}`}
                onClick={() => setMode('compound')}
                disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
              >
                <TrendingUp size={18} />
                Compound Interest
              </button>
              <button
                className={`mode-tab ${mode === 'investment' ? 'active' : ''}`}
                onClick={() => setMode('investment')}
                disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
              >
                <PieChart size={18} />
                Investment
              </button>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="inputs-section">
            <div className="input-group">
              <label>
                <DollarSign size={16} />
                Initial Principal
              </label>
              <div className="input-with-currency">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  min="0"
                  step="100"
                  disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
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
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                />
                <span className="suffix">%</span>
              </div>
            </div>

            <div className="input-group">
              <label>
                <Calendar size={16} />
                Time Period
              </label>
              <div className="input-with-select">
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(Number(e.target.value))}
                  min="1"
                  step="1"
                  disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                />
                <select 
                  value={timeUnit} 
                  onChange={(e) => setTimeUnit(e.target.value)}
                  disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                >
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            {mode !== 'simple' && (
              <div className="input-group">
                <label>Compound Frequency</label>
                <select 
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            )}

            {mode === 'investment' && (
              <>
                <div className="input-group">
                  <label>
                    <DollarSign size={16} />
                    Regular Contribution
                  </label>
                  <div className="input-with-currency">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      value={contribution}
                      onChange={(e) => setContribution(Number(e.target.value))}
                      min="0"
                      step="10"
                      disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Contribution Frequency</label>
                  <select
                    value={contributionFrequency}
                    onChange={(e) => setContributionFrequency(e.target.value)}
                    disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* ✅ CALCULATE BUTTON */}
          <div className="calculate-section">
            <button 
              className="btn-calculate"
              onClick={handleCalculate}
              disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
            >
              <Calculator size={20} />
              Calculate Interest
            </button>
            {results && (
              <button 
                className="btn-clear"
                onClick={handleClear}
              >
                Clear Results
              </button>
            )}
          </div>

          {/* Actions */}
          {results && (
            <div className="actions-row">
              <button className="btn-action secondary" onClick={handleReset}>
                <RefreshCw size={16} />
                Reset
              </button>
              <button className="btn-action secondary" onClick={downloadReport}>
                <Download size={16} />
                Download Report
              </button>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <>
              <div className="results-section">
                <h3>Results</h3>
                <div className="results-grid">
                  <div className="result-card primary">
                    <div className="result-label">Final Amount</div>
                    <div className="result-value">{formatCurrency(results.total)}</div>
                  </div>

                  <div className="result-card">
                    <div className="result-label">Initial Principal</div>
                    <div className="result-value">{formatCurrency(results.principal)}</div>
                  </div>

                  {mode === 'investment' && (
                    <>
                      <div className="result-card">
                        <div className="result-label">Total Contributions</div>
                        <div className="result-value">
                          {formatCurrency(results.totalContributions)}
                        </div>
                      </div>

                      <div className="result-card">
                        <div className="result-label">Total Invested</div>
                        <div className="result-value">
                          {formatCurrency(results.totalInvested)}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="result-card success">
                    <div className="result-label">Interest Earned</div>
                    <div className="result-value">{formatCurrency(results.interest)}</div>
                  </div>

                  {mode !== 'simple' && (
                    <div className="result-card">
                      <div className="result-label">Effective Annual Rate</div>
                      <div className="result-value">{results.effectiveRate}%</div>
                    </div>
                  )}
                </div>

                {/* Visual Breakdown */}
                <div className="visual-breakdown">
                  <div className="breakdown-bars">
                    <div
                      className="bar principal"
                      style={{
                        width: `${
                          (parseFloat(results.principal) / parseFloat(results.total)) * 100
                        }%`,
                      }}
                    >
                      <span>Principal</span>
                    </div>
                    {mode === 'investment' && (
                      <div
                        className="bar contributions"
                        style={{
                          width: `${
                            (parseFloat(results.totalContributions) /
                              parseFloat(results.total)) *
                            100
                          }%`,
                        }}
                      >
                        <span>Contributions</span>
                      </div>
                    )}
                    <div
                      className="bar interest"
                      style={{
                        width: `${
                          (parseFloat(results.interest) / parseFloat(results.total)) * 100
                        }%`,
                      }}
                    >
                      <span>Interest</span>
                    </div>
                  </div>
                  <div className="breakdown-legend">
                    <div className="legend-item">
                      <span className="legend-color principal"></span>
                      <span>Principal: {formatCurrency(results.principal)}</span>
                    </div>
                    {mode === 'investment' && (
                      <div className="legend-item">
                        <span className="legend-color contributions"></span>
                        <span>
                          Contributions: {formatCurrency(results.totalContributions)}
                        </span>
                      </div>
                    )}
                    <div className="legend-item">
                      <span className="legend-color interest"></span>
                      <span>Interest: {formatCurrency(results.interest)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yearly Breakdown */}
              {breakdown.length > 0 && (
                <div className="breakdown-section">
                  <h3>Yearly Breakdown</h3>
                  <div className="breakdown-table">
                    <div className="table-header">
                      <div>Year</div>
                      <div>Total Amount</div>
                      {mode === 'investment' && <div>Contributions</div>}
                      <div>Interest Earned</div>
                    </div>
                    {breakdown.map((item) => (
                      <div key={item.year} className="table-row">
                        <div>{item.year}</div>
                        <div className="total-amount">{formatCurrency(item.amount)}</div>
                        {mode === 'investment' && (
                          <div>{formatCurrency(item.contributions)}</div>
                        )}
                        <div className="interest">{formatCurrency(item.interest)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Information */}
          <div className="info-section">
            <h3>How It Works</h3>
            <div className="info-cards">
              {mode === 'simple' && (
                <div className="info-card">
                  <h4>Simple Interest</h4>
                  <p className="formula">I = P × r × t</p>
                  <p>
                    Simple interest is calculated only on the principal amount. The interest
                    earned does not compound over time.
                  </p>
                </div>
              )}

              {mode === 'compound' && (
                <div className="info-card">
                  <h4>Compound Interest</h4>
                  <p className="formula">A = P(1 + r/n)^(nt)</p>
                  <p>
                    Compound interest is calculated on the principal and accumulated interest.
                    More frequent compounding results in higher returns.
                  </p>
                </div>
              )}

              {mode === 'investment' && (
                <div className="info-card">
                  <h4>Investment with Contributions</h4>
                  <p className="formula">FV = PV(1 + r)^t + PMT × [(1 + r)^t - 1] / r</p>
                  <p>
                    Calculates the future value of regular contributions combined with compound
                    interest on both principal and contributions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterestCalculator;