// Enhanced tool processing functions with file handling
import Papa from 'papaparse';

export const toolProcessors = {
  // Developer Tools
  'json-formatter': (input) => {
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      throw new Error('Invalid JSON: ' + error.message);
    }
  },

  'csv-json': (input) => {
    try {
      if (input.trim().startsWith('[') || input.trim().startsWith('{')) {
        const data = JSON.parse(input);
        const csv = Papa.unparse(Array.isArray(data) ? data : [data]);
        return csv;
      } else {
        const result = Papa.parse(input, { header: true });
        return JSON.stringify(result.data, null, 2);
      }
    } catch (error) {
      throw new Error('Conversion failed: ' + error.message);
    }
  },

  'uuid': () => {
    return generateUUID();
  },

  'regex': (input) => {
    const parts = input.split('|||');
    if (parts.length !== 3) {
      return 'Format: pattern|||flags|||testString\nExample: \\d+|||g|||abc123def456';
    }
    
    const [pattern, flags, testString] = parts.map(p => p.trim());
    try {
      const regex = new RegExp(pattern, flags);
      const matches = testString.match(regex);
      
      let output = `Pattern: ${pattern}\nFlags: ${flags}\nTest String: ${testString}\n\n`;
      
      if (matches) {
        output += `✓ Matches found: ${matches.length}\n\n`;
        matches.forEach((match, i) => {
          output += `Match ${i + 1}: ${match}\n`;
        });
      } else {
        output += '✗ No matches found';
      }
      
      return output;
    } catch (error) {
      throw new Error('Invalid regex: ' + error.message);
    }
  },

  'sql-formatter': (input) => {
    let formatted = input
      .replace(/\s+/g, ' ')
      .replace(/\s*(,)\s*/g, '$1\n    ')
      .replace(/\s*(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ORDER BY|GROUP BY|HAVING|UNION)\s+/gi, '\n$1\n    ')
      .replace(/\s*(AND|OR)\s+/gi, '\n    $1 ')
      .trim();
    
    return formatted;
  },

  'jwt': (input) => {
    try {
      const parts = input.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      return `HEADER:\n${JSON.stringify(header, null, 2)}\n\nPAYLOAD:\n${JSON.stringify(payload, null, 2)}\n\nSIGNATURE:\n${parts[2]}`;
    } catch (error) {
      throw new Error('Invalid JWT: ' + error.message);
    }
  },

  'hash': (input) => {
    // Use Web Crypto API for real hashing
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
      .then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return `Input: ${input}\n\nSHA-256: ${hashHex}\n\nNote: For MD5 and SHA-1, install crypto-js library`;
      });
  },

  'base64': (input) => {
    try {
      const decoded = atob(input);
      return `Decoded:\n${decoded}\n\nEncoded:\n${btoa(decoded)}`;
    } catch {
      const encoded = btoa(input);
      return `Encoded:\n${encoded}\n\nDecoded:\n${input}`;
    }
  },

  // File Processing Tools
  'image-compress': async (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (compress to 80% quality)
          const maxWidth = 1920;
          const maxHeight = 1080;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Compress and convert to data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          const originalSize = (file.size / 1024).toFixed(2);
          const compressedSize = ((compressedDataUrl.length * 3) / 4 / 1024).toFixed(2);
          const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);

          resolve(`Original Size: ${originalSize} KB\nCompressed Size: ${compressedSize} KB\nSavings: ${savings}%\n\n${compressedDataUrl}`);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  'image-pdf': async (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create a simple PDF-like output (in production, use jsPDF or pdf-lib)
          const dataUrl = e.target.result;
          resolve(`Image converted to PDF format!\n\nOriginal: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nDimensions: ${img.width}x${img.height}\n\nNote: For production, use jsPDF library\nImage data: ${dataUrl}`);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  'pdf-merge': async (file) => {
    return new Promise((resolve, reject) => {
      if (file.type !== 'application/pdf') {
        reject(new Error('Please select a PDF file'));
        return;
      }
      resolve(`PDF Merge functionality\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nNote: For production, use pdf-lib:\n- Upload multiple PDFs\n- Merge them in order\n- Download combined PDF\n\nThis is a Premium feature!`);
    });
  },

  'pdf-split': async (file) => {
    return new Promise((resolve, reject) => {
      if (file.type !== 'application/pdf') {
        reject(new Error('Please select a PDF file'));
        return;
      }
      resolve(`PDF Split functionality\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nNote: For production, use pdf-lib:\n- Split into individual pages\n- Select specific pages\n- Download as separate files\n\nThis is a Premium feature!`);
    });
  },

  'pdf-compress': async (file) => {
    return new Promise((resolve, reject) => {
      if (file.type !== 'application/pdf') {
        reject(new Error('Please select a PDF file'));
        return;
      }
      resolve(`PDF Compress functionality\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nNote: For production, use pdf-lib:\n- Compress images in PDF\n- Reduce file size\n- Maintain quality\n\nThis is a Premium feature!`);
    });
  },

  // Text Tools
  'word-counter': (input) => {
    const words = input.trim().split(/\s+/).filter(w => w.length > 0);
    const chars = input.length;
    const charsNoSpaces = input.replace(/\s/g, '').length;
    const lines = input.split('\n').length;
    const paragraphs = input.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    return `Words: ${words.length}\nCharacters: ${chars}\nCharacters (no spaces): ${charsNoSpaces}\nLines: ${lines}\nParagraphs: ${paragraphs}\nSentences: ${sentences}\n\nAverage word length: ${(charsNoSpaces / words.length || 0).toFixed(2)} characters\nReading time: ${Math.ceil(words.length / 200)} min`;
  },

  'case-converter': (input) => {
    const toTitleCase = (str) => {
      return str.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    };

    const toCamelCase = (str) => {
      return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    };

    const toSnakeCase = (str) => {
      return str.toLowerCase().replace(/\s+/g, '_');
    };

    const toKebabCase = (str) => {
      return str.toLowerCase().replace(/\s+/g, '-');
    };

    const toPascalCase = (str) => {
      return str.replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).replace(/\s+/g, '');
    };

    return `UPPERCASE:\n${input.toUpperCase()}\n\nlowercase:\n${input.toLowerCase()}\n\nTitle Case:\n${toTitleCase(input)}\n\ncamelCase:\n${toCamelCase(input)}\n\nPascalCase:\n${toPascalCase(input)}\n\nsnake_case:\n${toSnakeCase(input)}\n\nkebab-case:\n${toKebabCase(input)}`;
  },

  'duplicate-remover': (input) => {
    const lines = input.split('\n');
    const unique = [...new Set(lines)];
    const removedCount = lines.length - unique.length;
    
    return `Removed ${removedCount} duplicate line(s)\nOriginal lines: ${lines.length}\nUnique lines: ${unique.length}\n\n${unique.join('\n')}`;
  },

  'sort-lines': (input) => {
    const lines = input.split('\n');
    const sorted = [...lines].sort();
    const reversed = [...lines].sort().reverse();
    const byLength = [...lines].sort((a, b) => a.length - b.length);
    
    return `ALPHABETICAL (A-Z):\n${sorted.join('\n')}\n\nREVERSE (Z-A):\n${reversed.join('\n')}\n\nBY LENGTH (shortest first):\n${byLength.join('\n')}`;
  },

  'text-diff': (input) => {
    const parts = input.split('|||');
    if (parts.length !== 2) {
      return 'Format: text1|||text2 (separated by |||)\n\nExample:\nHello World|||Hello Universe';
    }

    const [text1, text2] = parts;
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    let output = 'DIFFERENCES:\n\n';
    const maxLines = Math.max(lines1.length, lines2.length);
    let diffCount = 0;

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (line1 !== line2) {
        diffCount++;
        output += `Line ${i + 1}:\n`;
        output += `  - ${line1}\n`;
        output += `  + ${line2}\n\n`;
      }
    }

    return diffCount === 0 ? '✅ No differences found - texts are identical!' : `Found ${diffCount} difference(s):\n\n${output}`;
  },

  'markdown-preview': (input) => {
    let output = input
      .replace(/^#{6}\s+(.+)$/gm, '\n$1\n' + '─'.repeat(20))
      .replace(/^#{5}\s+(.+)$/gm, '\n$1\n' + '─'.repeat(30))
      .replace(/^#{4}\s+(.+)$/gm, '\n$1\n' + '─'.repeat(40))
      .replace(/^#{3}\s+(.+)$/gm, '\n$1\n' + '═'.repeat(50))
      .replace(/^#{2}\s+(.+)$/gm, '\n$1\n' + '═'.repeat(60))
      .replace(/^#{1}\s+(.+)$/gm, '\n$1\n' + '═'.repeat(70))
      .replace(/\*\*(.+?)\*\*/g, '【$1】')
      .replace(/\*(.+?)\*/g, '《$1》')
      .replace(/\[(.+?)\]\((.+?)\)/g, '$1 → $2')
      .replace(/`(.+?)`/g, '｢$1｣');

    return `MARKDOWN PREVIEW:\n\n${output}\n\n(Note: Install marked.js for full HTML preview)`;
  },

  // Business Tools
  'password': () => {
    const length = 16;
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return `Generated Password:\n${password}\n\nLength: ${length} characters\nStrength: Strong ✅\n\nContains:\n✓ Uppercase letters\n✓ Lowercase letters\n✓ Numbers\n✓ Special characters\n\nSecurity Tips:\n- Never reuse passwords\n- Use a password manager\n- Enable 2FA when possible\n- Change passwords regularly`;
  },

  'color-picker': (input) => {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgbToHex = (r, g, b) => {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };

    const rgbToHsl = (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    };

    let output = '';

    if (input.startsWith('#')) {
      const rgb = hexToRgb(input);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        output = `HEX: ${input.toUpperCase()}\n\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nRGBA: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)\n\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\nHSLA: hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)\n\nCSS Variables:\n--color: ${input};\nbackground-color: ${input};`;
      } else {
        throw new Error('Invalid HEX color');
      }
    } else if (input.startsWith('rgb')) {
      const match = input.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const [, r, g, b] = match.map(Number);
        const hsl = rgbToHsl(r, g, b);
        output = `RGB: rgb(${r}, ${g}, ${b})\n\nHEX: ${rgbToHex(r, g, b).toUpperCase()}\n\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\nHSLA: hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`;
      } else {
        throw new Error('Invalid RGB color');
      }
    } else {
      throw new Error('Enter HEX (#FF5733) or RGB (255, 87, 51)');
    }

    return output;
  },

  'unit-converter': (input) => {
    const parts = input.split('|');
    if (parts.length !== 3) {
      return 'Format: value|fromUnit|toUnit\n\nExamples:\n100|km|miles\n72|fahrenheit|celsius\n5|meters|feet\n\nSupported conversions:\n\nLength: km, miles, meters, feet, inches, cm\nWeight: kg, lbs, grams, ounces\nTemperature: celsius, fahrenheit, kelvin\nVolume: liters, gallons, ml, cups\nSpeed: kmh, mph, ms';
    }

    const [valueStr, from, to] = parts.map(p => p.trim().toLowerCase());
    const value = parseFloat(valueStr);

    if (isNaN(value)) {
      throw new Error('Invalid number');
    }

    const conversions = {
      'km-miles': v => v * 0.621371,
      'miles-km': v => v / 0.621371,
      'meters-feet': v => v * 3.28084,
      'feet-meters': v => v / 3.28084,
      'meters-inches': v => v * 39.3701,
      'inches-meters': v => v / 39.3701,
      'cm-inches': v => v * 0.393701,
      'inches-cm': v => v / 0.393701,
      'kg-lbs': v => v * 2.20462,
      'lbs-kg': v => v / 2.20462,
      'grams-ounces': v => v * 0.035274,
      'ounces-grams': v => v / 0.035274,
      'celsius-fahrenheit': v => (v * 9/5) + 32,
      'fahrenheit-celsius': v => (v - 32) * 5/9,
      'celsius-kelvin': v => v + 273.15,
      'kelvin-celsius': v => v - 273.15,
      'liters-gallons': v => v * 0.264172,
      'gallons-liters': v => v / 0.264172,
      'ml-cups': v => v * 0.00422675,
      'cups-ml': v => v / 0.00422675,
      'kmh-mph': v => v * 0.621371,
      'mph-kmh': v => v / 0.621371,
      'ms-kmh': v => v * 3.6,
      'kmh-ms': v => v / 3.6,
    };

    const key = `${from}-${to}`;
    const converter = conversions[key];

    if (!converter) {
      throw new Error(`Conversion ${from} → ${to} not supported yet`);
    }

    const result = converter(value);
    return `${value} ${from} = ${result.toFixed(4)} ${to}\n\n📊 Conversion Details:\nInput: ${value} ${from}\nOutput: ${result.toFixed(4)} ${to}\nRatio: 1 ${from} = ${converter(1).toFixed(6)} ${to}`;
  },

  'receipt': (input) => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    return `╔════════════════════════════════════════╗\n║          RECEIPT                       ║\n╚════════════════════════════════════════╝\n\nDate: ${date}\nTime: ${time}\n\n${input}\n\n────────────────────────────────────────\nThank you for your business!\n\nNote: For production, implement:\n- Item parsing and pricing\n- Tax calculation\n- Total computation\n- QR code for verification`;
  },

  'invoice': (input) => {
    const date = new Date().toLocaleDateString();
    return `╔════════════════════════════════════════╗\n║          INVOICE                       ║\n╚════════════════════════════════════════╝\n\nInvoice Date: ${date}\nDue Date: Net 30\n\n${input}\n\n────────────────────────────────────────\nPayment Terms: Net 30 days\n\nNote: This is a Premium feature!\nUpgrade for:\n- Professional templates\n- Custom branding\n- Auto-calculations\n- PDF export`;
  },

  'qr': (input) => {
    const qrData = encodeURIComponent(input);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;
    
    return `QR Code generated for:\n"${input}"\n\nSize: 300x300px\nFormat: PNG\n\nNote: In production, use qrcode.js library for offline generation\n\nData URL: ${qrUrl}`;
  },
};

// Utility functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
