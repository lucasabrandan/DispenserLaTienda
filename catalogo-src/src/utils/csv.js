// CSV parser robusto (comillas, comas, saltos de línea)
export function parseCSV(text) {
  const rows = [];
  let row = [], field = "", i = 0, inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== '\r') field += c;
    }
    i++;
  }
  row.push(field); rows.push(row);
  if (!rows.length) return [];
  const [header, ...data] = rows;
  const keys = header.map(h => (h || "").trim().toLowerCase());
  return data
    .filter(r => r.some(v => (v || "").trim() !== ""))
    .map(r => {
      const obj = {};
      for (let k = 0; k < keys.length; k++) obj[keys[k]] = (r[k] ?? "").trim();
      return obj;
    });
}

// "12.345,67" o "12345.67" -> número
export function parseNumberLikeARS(v) {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const s = String(v).replace(/\s/g, "");
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
