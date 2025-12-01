export const toolCategories = [
  {
    id: 'developer',
    name: "Developer Tools",
    icon: "⚡",
    iconClass: "dev-icon",
    tools: [
      { 
        id: "json-formatter", 
        name: "JSON Formatter", 
        description: "Format, validate, and beautify JSON data", 
        premium: false,
        category: "developer"
      },
      { 
        id: "csv-json", 
        name: "CSV ↔ JSON Converter", 
        description: "Convert between CSV and JSON formats", 
        premium: false,
        category: "developer"
      },
      { 
        id: "uuid", 
        name: "UUID Generator", 
        description: "Generate unique identifiers instantly", 
        premium: false,
        category: "developer"
      },
      { 
        id: "regex", 
        name: "Regex Tester", 
        description: "Test and validate regular expressions", 
        premium: false,
        category: "developer"
      },
      { 
        id: "sql-formatter", 
        name: "SQL Formatter", 
        description: "Format and beautify SQL queries", 
        premium: false,
        category: "developer"
      },
      { 
        id: "jwt", 
        name: "JWT Decoder", 
        description: "Decode and inspect JWT tokens", 
        premium: true,
        category: "developer"
      },
      { 
        id: "hash", 
        name: "Hash Generator", 
        description: "Generate MD5, SHA256 hashes", 
        premium: false,
        category: "developer"
      },
      { 
        id: "base64", 
        name: "Base64 Encoder/Decoder", 
        description: "Encode and decode Base64 strings", 
        premium: false,
        category: "developer"
      }
    ]
  },
  {
    id: 'file',
    name: "File & PDF Tools",
    icon: "📄",
    iconClass: "file-icon",
    tools: [
      { 
        id: "pdf-merge", 
        name: "PDF Merge", 
        description: "Combine multiple PDFs into one", 
        premium: true,
        category: "file"
      },
      { 
        id: "pdf-split", 
        name: "PDF Split", 
        description: "Split PDF into separate pages", 
        premium: true,
        category: "file"
      },
      { 
        id: "pdf-compress", 
        name: "PDF Compress", 
        description: "Reduce PDF file size", 
        premium: true,
        category: "file"
      },
      { 
        id: "image-compress", 
        name: "Image Compressor", 
        description: "Compress images without quality loss", 
        premium: false,
        category: "file"
      },
      { 
        id: "image-pdf", 
        name: "Image → PDF", 
        description: "Convert images to PDF format", 
        premium: false,
        category: "file"
      },
      { 
        id: "qr", 
        name: "QR Code Generator", 
        description: "Create QR codes for any data", 
        premium: false,
        category: "file"
      }
    ]
  },
  {
    id: 'text',
    name: "Text & Productivity",
    icon: "✍️",
    iconClass: "text-icon",
    tools: [
      { 
        id: "word-counter", 
        name: "Word Counter", 
        description: "Count words, characters, and lines", 
        premium: false,
        category: "text"
      },
      { 
        id: "case-converter", 
        name: "Case Converter", 
        description: "Convert text case (UPPER, lower, Title)", 
        premium: false,
        category: "text"
      },
      { 
        id: "duplicate-remover", 
        name: "Duplicate Line Remover", 
        description: "Remove duplicate lines from text", 
        premium: false,
        category: "text"
      },
      { 
        id: "sort-lines", 
        name: "Sort Lines", 
        description: "Sort text lines alphabetically", 
        premium: false,
        category: "text"
      },
      { 
        id: "text-diff", 
        name: "Text Diff Checker", 
        description: "Compare two texts side by side", 
        premium: false,
        category: "text"
      },
      { 
        id: "markdown-preview", 
        name: "Markdown Preview", 
        description: "Preview markdown in real-time", 
        premium: false,
        category: "text"
      }
    ]
  },
  {
    id: 'business',
    name: "Business & Utility",
    icon: "💼",
    iconClass: "business-icon",
    tools: [
      { 
        id: "invoice", 
        name: "Invoice Generator", 
        description: "Create professional invoices", 
        premium: true,
        category: "business"
      },
      { 
        id: "receipt", 
        name: "Receipt Generator", 
        description: "Generate receipts instantly", 
        premium: false,
        category: "business"
      },
      { 
        id: "password", 
        name: "Password Generator", 
        description: "Generate secure passwords", 
        premium: false,
        category: "business"
      },
      { 
        id: "color-picker", 
        name: "Color Picker", 
        description: "Pick and convert color codes", 
        premium: false,
        category: "business"
      },
      { 
        id: "unit-converter", 
        name: "Unit Converter", 
        description: "Convert between units easily", 
        premium: false,
        category: "business"
      }
    ]
  }
];

export const getAllTools = () => {
  return toolCategories.flatMap(category => category.tools);
};

export const getToolById = (id) => {
  return getAllTools().find(tool => tool.id === id);
};

export const searchTools = (query) => {
  if (!query.trim()) return toolCategories;
  
  const lowerQuery = query.toLowerCase();
  return toolCategories
    .map(category => ({
      ...category,
      tools: category.tools.filter(tool =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery)
      )
    }))
    .filter(category => category.tools.length > 0);
};
