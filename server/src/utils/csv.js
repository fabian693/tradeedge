// Minimal RFC4180-ish CSV parser — handles quoted fields, commas, and CRLF/LF.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }

  if (field !== '' || row.length) {
    row.push(field);
    if (row.some((f) => f.trim() !== '')) rows.push(row);
  }

  return rows;
}

// Parse a CSV buffer into an array of objects keyed by normalized header names.
// Returns { headers, rows } where headers are the raw header strings and
// rows are arrays of { raw: {...}, get(...aliases) } helpers.
function parseCsvToRecords(text) {
  const table = parseCsv(text);
  if (table.length === 0) return { headers: [], records: [] };

  const headers = table[0].map((h) => h.trim());
  const normalized = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const records = table.slice(1).map((row) => {
    const raw = {};
    headers.forEach((h, idx) => {
      raw[h] = (row[idx] ?? '').trim();
    });

    return {
      raw,
      get(...aliases) {
        const targets = aliases.map((alias) => alias.toLowerCase().replace(/[^a-z0-9]/g, ''));

        // Pass 1: exact header match
        for (const target of targets) {
          const idx = normalized.indexOf(target);
          if (idx !== -1) {
            const val = (row[idx] ?? '').trim();
            if (val !== '') return val;
          }
        }

        // Pass 2: fuzzy match — header contains the alias as a substring.
        // Helps with spreadsheet exports that have verbose/custom column names
        // (e.g. "Direction DON'T WRITE HERE", "Win / Loss DON'T WIRTE HERE").
        // Only for aliases of meaningful length to avoid false positives.
        for (const target of targets) {
          if (target.length < 4) continue;
          const idx = normalized.findIndex((h) => h.includes(target));
          if (idx !== -1) {
            const val = (row[idx] ?? '').trim();
            if (val !== '') return val;
          }
        }

        return undefined;
      },
    };
  });

  return { headers, records };
}

module.exports = { parseCsv, parseCsvToRecords };
