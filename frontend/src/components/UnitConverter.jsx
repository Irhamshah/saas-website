import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import './UnitConverter.css';

function UnitConverter({ onClose }) {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('meters');
  const [toUnit, setToUnit] = useState('feet');
  const [inputValue, setInputValue] = useState('1');
  const [result, setResult] = useState('');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  // Comprehensive unit definitions
  const units = {
    length: {
      name: 'Length',
      icon: '📏',
      units: {
        // Metric
        kilometers: { name: 'Kilometers', symbol: 'km', toBase: 1000 },
        meters: { name: 'Meters', symbol: 'm', toBase: 1 },
        centimeters: { name: 'Centimeters', symbol: 'cm', toBase: 0.01 },
        millimeters: { name: 'Millimeters', symbol: 'mm', toBase: 0.001 },
        // Imperial
        miles: { name: 'Miles', symbol: 'mi', toBase: 1609.34 },
        yards: { name: 'Yards', symbol: 'yd', toBase: 0.9144 },
        feet: { name: 'Feet', symbol: 'ft', toBase: 0.3048 },
        inches: { name: 'Inches', symbol: 'in', toBase: 0.0254 },
        // Nautical
        nauticalMiles: { name: 'Nautical Miles', symbol: 'nmi', toBase: 1852 },
      }
    },
    weight: {
      name: 'Weight',
      icon: '⚖️',
      units: {
        // Metric
        tonnes: { name: 'Tonnes', symbol: 't', toBase: 1000000 },
        kilograms: { name: 'Kilograms', symbol: 'kg', toBase: 1000 },
        grams: { name: 'Grams', symbol: 'g', toBase: 1 },
        milligrams: { name: 'Milligrams', symbol: 'mg', toBase: 0.001 },
        // Imperial
        tons: { name: 'Tons (US)', symbol: 'ton', toBase: 907184.74 },
        pounds: { name: 'Pounds', symbol: 'lb', toBase: 453.592 },
        ounces: { name: 'Ounces', symbol: 'oz', toBase: 28.3495 },
      }
    },
    temperature: {
      name: 'Temperature',
      icon: '🌡️',
      units: {
        celsius: { name: 'Celsius', symbol: '°C' },
        fahrenheit: { name: 'Fahrenheit', symbol: '°F' },
        kelvin: { name: 'Kelvin', symbol: 'K' },
      }
    },
    volume: {
      name: 'Volume',
      icon: '🧪',
      units: {
        // Metric
        cubicMeters: { name: 'Cubic Meters', symbol: 'm³', toBase: 1000000 },
        liters: { name: 'Liters', symbol: 'L', toBase: 1000 },
        milliliters: { name: 'Milliliters', symbol: 'mL', toBase: 1 },
        // Imperial
        gallons: { name: 'Gallons (US)', symbol: 'gal', toBase: 3785.41 },
        quarts: { name: 'Quarts', symbol: 'qt', toBase: 946.353 },
        pints: { name: 'Pints', symbol: 'pt', toBase: 473.176 },
        cups: { name: 'Cups', symbol: 'cup', toBase: 236.588 },
        fluidOunces: { name: 'Fluid Ounces', symbol: 'fl oz', toBase: 29.5735 },
        tablespoons: { name: 'Tablespoons', symbol: 'tbsp', toBase: 14.7868 },
        teaspoons: { name: 'Teaspoons', symbol: 'tsp', toBase: 4.92892 },
      }
    },
    area: {
      name: 'Area',
      icon: '📐',
      units: {
        // Metric
        squareKilometers: { name: 'Square Kilometers', symbol: 'km²', toBase: 1000000 },
        squareMeters: { name: 'Square Meters', symbol: 'm²', toBase: 1 },
        squareCentimeters: { name: 'Square Centimeters', symbol: 'cm²', toBase: 0.0001 },
        hectares: { name: 'Hectares', symbol: 'ha', toBase: 10000 },
        // Imperial
        squareMiles: { name: 'Square Miles', symbol: 'mi²', toBase: 2589988.11 },
        acres: { name: 'Acres', symbol: 'ac', toBase: 4046.86 },
        squareYards: { name: 'Square Yards', symbol: 'yd²', toBase: 0.836127 },
        squareFeet: { name: 'Square Feet', symbol: 'ft²', toBase: 0.092903 },
        squareInches: { name: 'Square Inches', symbol: 'in²', toBase: 0.00064516 },
      }
    },
    speed: {
      name: 'Speed',
      icon: '🚀',
      units: {
        metersPerSecond: { name: 'Meters/Second', symbol: 'm/s', toBase: 1 },
        kilometersPerHour: { name: 'Kilometers/Hour', symbol: 'km/h', toBase: 0.277778 },
        milesPerHour: { name: 'Miles/Hour', symbol: 'mph', toBase: 0.44704 },
        knots: { name: 'Knots', symbol: 'kn', toBase: 0.514444 },
        feetPerSecond: { name: 'Feet/Second', symbol: 'ft/s', toBase: 0.3048 },
      }
    },
    time: {
      name: 'Time',
      icon: '⏱️',
      units: {
        years: { name: 'Years', symbol: 'yr', toBase: 31536000 },
        weeks: { name: 'Weeks', symbol: 'wk', toBase: 604800 },
        days: { name: 'Days', symbol: 'd', toBase: 86400 },
        hours: { name: 'Hours', symbol: 'h', toBase: 3600 },
        minutes: { name: 'Minutes', symbol: 'min', toBase: 60 },
        seconds: { name: 'Seconds', symbol: 's', toBase: 1 },
        milliseconds: { name: 'Milliseconds', symbol: 'ms', toBase: 0.001 },
      }
    },
    data: {
      name: 'Data',
      icon: '💾',
      units: {
        terabytes: { name: 'Terabytes', symbol: 'TB', toBase: 1099511627776 },
        gigabytes: { name: 'Gigabytes', symbol: 'GB', toBase: 1073741824 },
        megabytes: { name: 'Megabytes', symbol: 'MB', toBase: 1048576 },
        kilobytes: { name: 'Kilobytes', symbol: 'KB', toBase: 1024 },
        bytes: { name: 'Bytes', symbol: 'B', toBase: 1 },
        bits: { name: 'Bits', symbol: 'bit', toBase: 0.125 },
      }
    },
  };

  // Convert function
  const convert = (value, from, to, cat) => {
    if (!value || isNaN(value)) return '';
    
    const num = parseFloat(value);
    
    // Temperature conversion (special case)
    if (cat === 'temperature') {
      return convertTemperature(num, from, to);
    }
    
    // Standard conversion through base unit
    const fromUnit = units[cat].units[from];
    const toUnit = units[cat].units[to];
    
    if (!fromUnit || !toUnit) return '';
    
    const baseValue = num * fromUnit.toBase;
    const result = baseValue / toUnit.toBase;
    
    return formatResult(result);
  };

  const convertTemperature = (value, from, to) => {
    let celsius;
    
    // Convert to Celsius first
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5 / 9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      default:
        return '';
    }
    
    // Convert from Celsius to target
    let result;
    switch (to) {
      case 'celsius':
        result = celsius;
        break;
      case 'fahrenheit':
        result = (celsius * 9 / 5) + 32;
        break;
      case 'kelvin':
        result = celsius + 273.15;
        break;
      default:
        return '';
    }
    
    return formatResult(result);
  };

  const formatResult = (num) => {
    if (Math.abs(num) >= 1000000) {
      return num.toExponential(6);
    } else if (Math.abs(num) < 0.0001 && num !== 0) {
      return num.toExponential(6);
    } else {
      return num.toFixed(8).replace(/\.?0+$/, '');
    }
  };

  // Update result when inputs change
  useEffect(() => {
    const res = convert(inputValue, fromUnit, toUnit, category);
    setResult(res);
  }, [inputValue, fromUnit, toUnit, category]);

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const firstUnit = Object.keys(units[newCategory].units)[0];
    const secondUnit = Object.keys(units[newCategory].units)[1] || firstUnit;
    setFromUnit(firstUnit);
    setToUnit(secondUnit);
    setSearchFrom('');
    setSearchTo('');
  };

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(result);
  };

  // Filter units based on search
  const filterUnits = (searchTerm) => {
    const unitsList = units[category].units;
    return Object.entries(unitsList).filter(([key, unit]) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredFromUnits = filterUnits(searchFrom);
  const filteredToUnits = filterUnits(searchTo);

  // Quick conversion presets
  const commonConversions = {
    length: [
      { from: 'meters', to: 'feet', label: 'm → ft' },
      { from: 'kilometers', to: 'miles', label: 'km → mi' },
      { from: 'inches', to: 'centimeters', label: 'in → cm' },
    ],
    weight: [
      { from: 'kilograms', to: 'pounds', label: 'kg → lb' },
      { from: 'grams', to: 'ounces', label: 'g → oz' },
      { from: 'tonnes', to: 'tons', label: 't → ton' },
    ],
    temperature: [
      { from: 'celsius', to: 'fahrenheit', label: '°C → °F' },
      { from: 'fahrenheit', to: 'celsius', label: '°F → °C' },
      { from: 'celsius', to: 'kelvin', label: '°C → K' },
    ],
    volume: [
      { from: 'liters', to: 'gallons', label: 'L → gal' },
      { from: 'milliliters', to: 'cups', label: 'mL → cup' },
      { from: 'gallons', to: 'liters', label: 'gal → L' },
    ],
  };

  return (
    <div className="converter-modal">
      <div className="converter-container">
        <div className="converter-header">
          <h2>Unit Converter</h2>
          <p>Convert between different units of measurement</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="converter-content">
          {/* Category Selection */}
          <div className="category-section">
            <div className="category-grid">
              {Object.entries(units).map(([key, cat]) => (
                <button
                  key={key}
                  className={`category-btn ${category === key ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(key)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          {commonConversions[category] && (
            <div className="presets-section">
              <label>Quick Convert:</label>
              <div className="presets-grid">
                {commonConversions[category].map((preset, index) => (
                  <button
                    key={index}
                    className="preset-btn"
                    onClick={() => {
                      setFromUnit(preset.from);
                      setToUnit(preset.to);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversion Section */}
          <div className="conversion-section">
            {/* From Unit */}
            <div className="unit-box">
              <label>From</label>
              <div className="unit-selector">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search unit..."
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                  />
                </div>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  size={6}
                >
                  {filteredFromUnits.map(([key, unit]) => (
                    <option key={key} value={key}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div className="value-input">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value"
                  step="any"
                />
                <span className="unit-label">
                  {units[category].units[fromUnit]?.symbol}
                </span>
              </div>
            </div>

            {/* Swap Button */}
            <button className="swap-btn" onClick={swapUnits}>
              <ArrowLeftRight size={24} />
            </button>

            {/* To Unit */}
            <div className="unit-box">
              <label>To</label>
              <div className="unit-selector">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search unit..."
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                  />
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  size={6}
                >
                  {filteredToUnits.map(([key, unit]) => (
                    <option key={key} value={key}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div className="value-display">
                <input
                  type="text"
                  value={result}
                  readOnly
                  placeholder="Result"
                />
                <span className="unit-label">
                  {units[category].units[toUnit]?.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className="result-section">
              <div className="result-text">
                <strong>{inputValue} {units[category].units[fromUnit]?.symbol}</strong>
                {' = '}
                <strong>{result} {units[category].units[toUnit]?.symbol}</strong>
              </div>
            </div>
          )}

          {/* Formula Display */}
          {category !== 'temperature' && result && (
            <div className="formula-section">
              <p className="formula-text">
                Formula: Multiply by {(units[category].units[fromUnit]?.toBase / units[category].units[toUnit]?.toBase).toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnitConverter;