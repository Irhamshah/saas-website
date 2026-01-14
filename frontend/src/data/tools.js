// src/data/tools.js - Updated with routes

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
        category: "developer",
        route: '/tools/json-formatter'  // Modal only (no dedicated page yet)
      },
      {
        id: "csv-json",
        name: "CSV ↔ JSON Converter",
        description: "Convert between CSV and JSON formats",
        premium: false,
        category: "developer",
        route: '/tools/csv-json-converter'  // Modal only
      },
      {
        id: "uuid",
        name: "UUID Generator",
        description: "Generate unique identifiers instantly",
        premium: false,
        category: "developer",
        route: '/tools/uuid-generator'  // Modal only
      },
      {
        id: "regex",
        name: "Regex Tester",
        description: "Test and validate regular expressions",
        premium: false,
        category: "developer",
        route: '/tools/regex-tester'  // Modal only
      },
      {
        id: "sql-formatter",
        name: "SQL Formatter",
        description: "Format and beautify SQL queries",
        premium: false,
        category: "developer",
        route: '/tools/sql-formatter'  // Modal only
      },
      {
        id: "jwt",
        name: "JWT Decoder",
        description: "Decode and inspect JWT tokens",
        premium: false,
        category: "developer",
        route: '/tools/jwt-decoder'  // Modal only
      },
      {
        id: "hash",
        name: "Hash Generator",
        description: "Generate MD5, SHA256 hashes",
        premium: false,
        category: "developer",
        route: '/tools/hash-generator'  // Modal only
      },
      {
        id: "base64",
        name: "Base64 Encoder/Decoder",
        description: "Encode and decode Base64 strings",
        premium: false,
        category: "developer",
        route: "/tools/base64-tool"  // ✅ Has dedicated page
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
        name: "PDF Merger",
        description: "Combine multiple PDFs into one",
        premium: false,
        category: "file",
        route: "/tools/pdf-merger"  // ✅ Has dedicated page
      },
      {
        id: "pdf-split",
        name: "PDF Splitter",
        description: "Split PDF into separate pages",
        premium: false,
        category: "file",
        route: "/tools/pdf-splitter"  // ✅ Has dedicated page
      },
      {
        id: "pdf-compress",
        name: "PDF Compressor",
        description: "Reduce PDF file size",
        premium: false,
        category: "file",
        route: "/tools/pdf-compressor"  // ✅ Has dedicated page
      },
      {
        id: "pdf-text-extract",
        name: "Extract Text",
        description: "Extract text content from PDFs",
        premium: false,
        category: "file",
        route: "/tools/pdf-text-extract"  // ✅ Has dedicated page
      },
      {
        id: "image-compress",
        name: "Image Compressor",
        description: "Compress images without quality loss",
        premium: false,
        category: "file",
        route: null  // Modal only
      },
      {
        id: "image-pdf",
        name: "Image to PDF",
        description: "Convert images to PDF format",
        premium: false,
        category: "file",
        route: "/tools/image-to-pdf"  // ✅ Has dedicated page
      },
      {
        id: "qr",
        name: "QR Code Generator",
        description: "Create QR codes for any data",
        premium: false,
        category: "file",
        route: null  // Modal only
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
        category: "text",
        route: null  // Modal only
      },
      {
        id: "case-converter",
        name: "Case Converter",
        description: "Convert text case (UPPER, lower, Title)",
        premium: false,
        category: "text",
        route: null  // Modal only
      },
      {
        id: "duplicate-remover",
        name: "Duplicate Line Remover",
        description: "Remove duplicate lines from text",
        premium: false,
        category: "text",
        route: null  // Modal only
      },
      {
        id: "sort-lines",
        name: "Sort Lines",
        description: "Sort text lines alphabetically",
        premium: false,
        category: "text",
        route: null  // Modal only
      },
      {
        id: "text-diff",
        name: "Text Diff Checker",
        description: "Compare two texts side by side",
        premium: false,
        category: "text",
        route: null  // Modal only
      },
      {
        id: "markdown-preview",
        name: "Markdown Preview",
        description: "Preview markdown in real-time",
        premium: false,
        category: "text",
        route: null  // Modal only
      },
      {
        id: "lorem-ipsum",
        name: "Lorem Ipsum Generator",
        description: "Generate dummy placeholder text",
        premium: false,
        category: "text",
        route: null  // Modal only
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
        category: "business",
        route: null  // Modal only
      },
      {
        id: "receipt",
        name: "Receipt Generator",
        description: "Generate receipts instantly",
        premium: false,
        category: "business",
        route: null  // Modal only
      },
      {
        id: "password",
        name: "Password Generator",
        description: "Generate secure passwords",
        premium: false,
        category: "business",
        route: null  // Modal only
      },
      {
        id: "color-picker",
        name: "Color Picker",
        description: "Pick and convert color codes",
        premium: false,
        category: "business",
        route: null  // Modal only
      },
      {
        id: "unit-converter",
        name: "Unit Converter",
        description: "Convert between units easily",
        premium: false,
        category: "business",
        route: null  // Modal only
      }
    ]
  },
  {
    id: 'finance',
    name: "Finance Tools",
    icon: "📈",
    iconClass: "business-icon",
    tools: [
      {
        id: "interest-calculator",
        name: "Interest Calculator",
        description: "Calculate simple, compound interest and investments",
        premium: false,
        category: "financial",
        route: null  // Modal only
      },
      {
        id: "loan-calculator",
        name: "Loan Calculator",
        description: "Calculate loan payments and amortization",
        premium: false,
        category: "financial",
        route: null  // Modal only
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