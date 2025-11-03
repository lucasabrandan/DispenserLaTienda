import React, { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS_CSV_URL, WAPP_PHONE, COUPONS } from "./config";
import { parseCSV, parseNumberLikeARS } from "./utils/csv";
import { DEFAULT_PRODUCTS } from "./data/products";
import logo from "./logo.png";

const ARS = (n) =>
  (Number(n) || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
const enc = encodeURIComponent;

/* ========= Helpers ========= */
function convertDriveUrl(u) {
  if (!u) return "";
  const m = String(u).match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  return m ? `https://drive.google.com/uc?export=view&id=${m[1]}` : u;
}
function splitAndSanitizeImages(rawList) {
  if (!rawList) return [];
  return rawList
    .split(/[;|,]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => convertDriveUrl(s))
    .filter((s) => /^https?:\/\//i.test(s));
}

/* ========= Normalizadores ========= */
function normalizeSheet(row) {
  const pick = (...keys) => {
    for (const k of keys) {
      const v = row[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return "";
  };
  const sku = pick("sku", "codigo", "cod", "id");
  const name = pick("name", "nombre", "titulo");
  const price = parseNumberLikeARS(pick("price", "precio"));
  const stock = parseNumberLikeARS(pick("stock", "cantidad", "existencias"));

  const imgKeys = Object.keys(row).filter((k) =>
    /^(images?|image_url|imagen|image|foto)(_?\d+)?$/i.test(k)
  );
  let images = [];
  if (imgKeys.length) {
    const multiCols = imgKeys
      .map((k) => row[k])
      .filter(Boolean)
      .join("|");
    const listCol = pick("images");
    images = splitAndSanitizeImages([multiCols, listCol].filter(Boolean).join("|"));
  }

  const desc = pick("description", "descripcion", "detalle") || "";

  return {
    id: sku || "",
    nombre: name || "Producto",
    categoria: pick("category", "categoria") || "General",
    descripcion: desc,
    images,
    precio: price,
    iva: 0.21,
    stock: Number.isFinite(stock) ? stock : 0,
    unidad: "unidad",
  };
}
function normalizeLocal(p) {
  return {
    id: p.sku,
    nombre: p.name,
    categoria: p.category || "General",
    descripcion: p.description || "",
    images: p.images?.length ? p.images : [],
    precio: p.price,
    iva: p.iva ?? 0.21,
    stock: p.stock ?? 0,
    unidad: p.unidad || "unidad",
  };
}

/* ========= WhatsApp ========= */
function buildWhatsappText({ cliente, carrito, nota, couponCode, couponPct }) {
  const fecha = new Date().toLocaleDateString("es-AR");
  const header = `*Pedido desde el catálogo*%0A*Precios vigentes revisados:* ${fecha}%0ACliente: ${enc(
    cliente || "—"
  )}%0A%0A`;
  const lines = carrito
    .map((it, i) => {
      const unit = Math.round(it.precio * (1 + it.iva) * 100) / 100;
      const subtotal = unit * it.cantidad;
      return `${i + 1}. ${enc(it.nombre)} (SKU ${enc(it.id)}) x${it.cantidad} — ${enc(
        ARS(unit)
      )} c/u — Subtotal ${enc(ARS(subtotal))}`;
    })
    .join("%0A");

  const bruto = carrito.reduce(
    (a, it) => a + it.precio * (1 + it.iva) * it.cantidad,
    0
  );
  const pct = Math.max(0, Math.min(100, Number(couponPct) || 0));
  const descMonto = bruto * (pct / 100);
  const total = bruto - descMonto;

  const couponTxt = pct
    ? `%0ADescuento: ${pct}% (${enc(ARS(descMonto))}) ${
        couponCode ? `— Cupón: *${enc(couponCode)}*` : ""
      }`
    : "";

  const footer = `%0A%0ATotal: ${enc(ARS(total))}%0APrecio final (IVA incluido)${couponTxt}${
    nota ? `%0ANota: ${enc(nota)}` : ""
  }`;

  return `${header}${lines}${footer}`;
}

export default function App() {
  /* ===== datos ===== */
  const [productos, setProductos] = useState(() =>
    DEFAULT_PRODUCTS.map(normalizeLocal)
  );

  /* ===== búsqueda / sugerencias ===== */
  const [q, setQ] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(-1);
  const inputRef = useRef(null);

  /* ===== back-to-top / buscador flotante ===== */
  const [showFloatSearch, setShowFloatSearch] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  /* ===== carrito ===== */
  const [carrito, setCarrito] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("carrito-disp")) || [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ===== cupón + pedido ===== */
  const [askCoupon, setAskCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponPct, setCouponPct] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [cliente, setCliente] = useState("");
  const [nota, setNota] = useState("");

  /* ===== modal ===== */
  const [selected, setSelected] = useState(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  /* ===== avisos ===== */
  const [noStockId, setNoStockId] = useState(null);

  /* ===== sync ===== */
  const [lastSync, setLastSync] = useState(null);
  const [syncError, setSyncError] = useState(null);

  /* Persistencia carrito */
  useEffect(() => {
    localStorage.setItem("carrito-disp", JSON.stringify(carrito));
  }, [carrito]);

  /* Scroll: buscador flotante + back-to-top */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShowFloatSearch(y > 80);
      setShowBackTop(y > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Prefill desde ?q= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preQ = params.get("q");
    if (preQ) setQ(preQ);
  }, []);

  /* ---- carga desde Sheets ---- */
  const loadFromSheets = async () => {
    try {
      setSyncError(null);
      const cb = `&_=${Date.now()}`;
      const prodText = await (await fetch(PRODUCTS_CSV_URL + cb)).text();
      const prodRows = parseCSV(prodText);
      const parsed = prodRows.map((r) => normalizeSheet(r));
      if (parsed.length) {
        setProductos(parsed);
        setLastSync(new Date());
      }
    } catch (e) {
      setSyncError("No se pudo revisar precios en Sheets. Usando datos locales.");
      console.warn("Sheets falló, uso fallback local.", e);
      setProductos(DEFAULT_PRODUCTS.map(normalizeLocal));
    }
  };
  useEffect(() => {
    loadFromSheets();
  }, []);
  useEffect(() => {
    const id = setInterval(() => loadFromSheets(), 120000);
    return () => clearInterval(id);
  }, []);

  /* ---- derivados ---- */
  const baseFiltered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return productos.filter(
      (p) =>
        !term ||
        p.nombre.toLowerCase().includes(term) ||
        String(p.id).toLowerCase().includes(term) ||
        (p.descripcion || "").toLowerCase().includes(term)
    );
  }, [productos, q]);

  const suggestions = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    const score = (p) => {
      if (String(p.id).toLowerCase().startsWith(t)) return 3;
      if (p.nombre.toLowerCase().startsWith(t)) return 2;
      if ((p.descripcion || "").toLowerCase().includes(t)) return 1;
      return 0;
    };
    return [...productos]
      .map((p) => ({ p, s: score(p) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((x) => x.p);
  }, [productos, q]);

  const bruto = useMemo(
    () =>
      carrito.reduce(
        (a, it) => a + it.precio * (1 + it.iva) * (it.cantidad || 1),
        0
      ),
    [carrito]
  );
  const descAmount = useMemo(
    () => (Math.max(0, Math.min(100, Number(couponPct) || 0)) / 100) * bruto,
    [bruto, couponPct]
  );
  const total = useMemo(() => bruto - descAmount, [bruto, descAmount]);

  /* ---- Cupón ---- */
  const applyCoupon = () => {
    const code = (couponCode || "").trim().toUpperCase();
    if (!code) {
      setCouponPct(0);
      setCouponError("");
      return;
    }
    const pct = COUPONS[code];
    if (!pct) {
      setCouponPct(0);
      setCouponError("Cupón inválido");
      return;
    }
    setCouponPct(pct);
    setCouponError("");
  };

  /* ---- carrito con tope por stock ---- */
  const add = (p, cantidad = 1) => {
    const available = Math.max(0, p.stock ?? 0);
    if (available <= 0) {
      setNoStockId(p.id);
      setTimeout(() => setNoStockId(null), 2500);
      return;
    }
    setCarrito((c) => {
      const i = c.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const n = [...c];
        const current = n[i].cantidad || 1;
        n[i] = { ...n[i], cantidad: Math.min(current + cantidad, available) };
        return n;
      }
      return [...c, { ...p, cantidad: Math.min(cantidad, available) }];
    });
    setDrawerOpen(true);
  };
  const inc = (id) =>
    setCarrito((c) =>
      c.map((x) => {
        if (x.id !== id) return x;
        const available = Math.max(0, x.stock ?? 0);
        return { ...x, cantidad: Math.min((x.cantidad || 1) + 1, available) };
      })
    );
  const dec = (id) =>
    setCarrito((c) =>
      c.map((x) =>
        x.id === id ? { ...x, cantidad: Math.max((x.cantidad || 1) - 1, 1) } : x
      )
    );
  const delItem = (id) => setCarrito((c) => c.filter((x) => x.id !== id));
  const clear = () => setCarrito([]);

  /* ---- WhatsApp ---- */
  const wappURL = `https://wa.me/${WAPP_PHONE}?text=${buildWhatsappText({
    cliente,
    carrito,
    nota,
    couponCode: couponPct ? (couponCode || "").toUpperCase() : "",
    couponPct,
  })}`;

  /* ---- modal arrows ---- */
  useEffect(() => {
    const totalImgs = selected?.images?.length || 0;
    setCanPrev(previewIdx > 0);
    setCanNext(previewIdx < Math.max(0, totalImgs - 1));
  }, [selected, previewIdx]);

  const onInputKeyDown = (e) => {
    if (!suggestOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (suggestIndex >= 0) {
        e.preventDefault();
        const s = suggestions[suggestIndex];
        setQ(s.nombre);
        setSuggestOpen(false);
        setSuggestIndex(-1);
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
      setSuggestIndex(-1);
    }
  };

  /* ===== UI ===== */
  return (
    <>
      {/* Header */}
      <header className="site-header">
        <div className="inner">
          <img src={logo} alt="Dispenser La Tienda" className="logo" />
          <div className="site-title">Catálogo</div>

          <div className="search">
            <div style={{ position: "relative", flex: 1 }}>
              <input
                ref={inputRef}
                className="input"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSuggestOpen(true);
                  setSuggestIndex(-1);
                }}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() =>
                  setTimeout(() => {
                    setSuggestOpen(false);
                    setSuggestIndex(-1);
                  }, 150)
                }
                onKeyDown={onInputKeyDown}
                placeholder="Buscar por nombre o SKU…"
              />
              {suggestOpen && suggestions.length > 0 && (
                <div className="suggest-box">
                  {suggestions.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={() => {
                        setQ(`${s.nombre}`);
                        setSuggestOpen(false);
                        setSuggestIndex(-1);
                      }}
                      className={`suggest-item ${i === suggestIndex ? "active" : ""}`}
                      title={`SKU ${s.id}`}
                    >
                      <span
                        className="suggest-thumb"
                        style={{
                          backgroundImage: s.images?.[0] ? `url(${s.images[0]})` : "none",
                        }}
                      />
                      <span className="suggest-name">{s.nombre}</span>
                      <span className="suggest-sku">SKU {s.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn btn-success"
              type="button"
              onClick={() => setDrawerOpen(true)}
            >
              Carrito —{" "}
              {ARS(
                carrito.reduce(
                  (a, b) => a + b.precio * (1 + b.iva) * (b.cantidad || 1),
                  0
                )
              )}{" "}
              {carrito.length
                ? `(${carrito.reduce((a, b) => a + (b.cantidad || 1), 0)})`
                : ""}
            </button>
          </div>
        </div>

        {/* Sync (solo fecha) */}
        <div className="syncbar small">
          {syncError ? (
            <span style={{ color: "#ef4444" }}>{syncError}</span>
          ) : (
            <span>
              Precios vigentes revisados:{" "}
              {lastSync ? lastSync.toLocaleDateString("es-AR") : "—"}
            </span>
          )}
        </div>
      </header>

      {/* Grid */}
      <div className="products">
        {baseFiltered.map((p) => (
          <div
            key={p.id}
            className="product"
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelected(p);
              setPreviewIdx(0);
              setQty(1);
              document.body.style.overflow = "hidden";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelected(p);
                setPreviewIdx(0);
                setQty(1);
                document.body.style.overflow = "hidden";
              }
            }}
          >
            <div
              className="image"
              style={{
                backgroundImage: p.images?.[0] ? `url(${p.images[0]})` : "none",
              }}
            />
            <div className="info">
              <div>
                <h2>{p.nombre}</h2>
                <div className="meta">SKU {p.id}</div>
                {p.descripcion && <div className="desc">{p.descripcion}</div>}
              </div>

              <div className="price-row">
                <div className="price">{ARS(p.precio * (1 + p.iva))}</div>
                <span
                  className={`badge ${
                    (p.stock ?? 0) <= 0 ? "none" : p.stock <= 5 ? "low" : "ok"
                  }`}
                >
                  {(p.stock ?? 0) <= 0
                    ? "Sin stock"
                    : p.stock <= 5
                    ? "Bajo stock"
                    : "Disponible"}
                </span>
              </div>

              {noStockId === p.id && (
                <div className="inline-error">
                  No hay stock disponible para este producto.
                </div>
              )}

              <div className="card-actions">
                <button
                  className={`btn btn-add ${noStockId === p.id ? "shake" : ""}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    add(p);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  Agregar
                </button>
              </div>
              <div className="small">Precio final (IVA incluido)</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sin resultados */}
      {baseFiltered.length === 0 && (
        <div className="no-results">
          <div className="no-results-card">
            <div className="no-results-title">No encontramos resultados</div>
            {q.trim() ? (
              <div className="no-results-sub">
                No hay productos que coincidan con “{q}”.
              </div>
            ) : (
              <div className="no-results-sub">No hay productos para mostrar.</div>
            )}

            {suggestions.length > 0 && (
              <>
                <div className="no-results-sub" style={{ marginTop: 8 }}>
                  Tal vez buscabas:
                </div>
                <div className="no-results-list">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="suggest-chip"
                      onClick={() => setQ(s.nombre)}
                      title={`SKU ${s.id}`}
                    >
                      {s.nombre}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="no-results-actions">
              <button className="btn" type="button" onClick={() => setQ("")}>
                Limpiar búsqueda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Carrito (mobile) — se oculta cuando el drawer está abierto */}
      {!drawerOpen && (
        <div className="fab-cart">
          <button
            className="btn btn-success"
            type="button"
            onClick={() => setDrawerOpen(true)}
          >
            Carrito —{" "}
            {ARS(
              carrito.reduce(
                (a, b) => a + b.precio * (1 + b.iva) * (b.cantidad || 1),
                0
              )
            )}{" "}
            {carrito.length
              ? `(${carrito.reduce((a, b) => a + (b.cantidad || 1), 0)})`
              : ""}
          </button>
        </div>
      )}

      {/* Buscador flotante (mobile + desktop) */}
      {showFloatSearch && (
        <div
          className="floating-search"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="floating-wrap">
            <input
              className="input"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSuggestOpen(true);
                setSuggestIndex(-1);
              }}
              onFocus={() => setSuggestOpen(true)}
              onBlur={() =>
                setTimeout(() => {
                  setSuggestOpen(false);
                  setSuggestIndex(-1);
                }, 150)
              }
              onKeyDown={onInputKeyDown}
              placeholder="Buscar por nombre o SKU…"
              aria-label="Buscar productos"
              autoFocus
            />
            {suggestOpen && suggestions.length > 0 && (
              <div className="suggest-box">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={() => {
                      setQ(`${s.nombre}`);
                      setSuggestOpen(false);
                      setSuggestIndex(-1);
                    }}
                    className={`suggest-item ${i === suggestIndex ? "active" : ""}`}
                    title={`SKU ${s.id}`}
                  >
                    <span
                      className="suggest-thumb"
                      style={{
                        backgroundImage: s.images?.[0] ? `url(${s.images[0]})` : "none",
                      }}
                    />
                    <span className="suggest-name">{s.nombre}</span>
                    <span className="suggest-sku">SKU {s.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="bar">
              <div>Tu pedido</div>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="body">
              {carrito.length === 0 && (
                <div className="small">El carrito está vacío.</div>
              )}
              {carrito.map((it) => (
                <div key={it.id} className="item">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{it.nombre}</div>
                      <div className="small">SKU {it.id}</div>
                    </div>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => delItem(it.id)}
                    >
                      Quitar
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <div className="qty">
                      <button type="button" onClick={() => dec(it.id)}>
                        −
                      </button>
                      <span>{it.cantidad}</span>
                      <button type="button" onClick={() => inc(it.id)}>
                        +
                      </button>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {ARS(it.precio * (1 + it.iva) * it.cantidad)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="footer">
              {/* Solo cupón + nombre + nota */}
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <label className="small" style={{ minWidth: 140 }}>
                  ¿Tenés cupón de descuento?
                </label>
                <input
                  type="checkbox"
                  checked={askCoupon}
                  onChange={(e) => {
                    setAskCoupon(e.target.checked);
                    if (!e.target.checked) {
                      setCouponCode("");
                      setCouponPct(0);
                      setCouponError("");
                    }
                  }}
                />
              </div>

              {askCoupon && (
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <input
                    className="input"
                    placeholder="Ingresá tu cupón"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onBlur={applyCoupon}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyCoupon();
                    }}
                    style={{ maxWidth: 220 }}
                  />
                  <button className="btn" type="button" onClick={applyCoupon}>
                    Aplicar
                  </button>
                  {couponError && (
                    <span className="small" style={{ color: "#ef4444" }}>
                      {couponError}
                    </span>
                  )}
                  {couponPct > 0 && (
                    <span className="small" style={{ color: "var(--ok)" }}>
                      Cupón aplicado: {couponPct}%
                    </span>
                  )}
                </div>
              )}

              <div className="row" style={{ gap: 8 }}>
                <input
                  className="input"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Cliente / Razón social"
                />
                <input
                  className="input"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Nota (opcional)"
                />
              </div>

              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="small">Total</span>
                <strong>{ARS(total)}</strong>
              </div>

              <div className="row" style={{ gap: 8 }}>
                <button
                  className="btn btn-success"
                  type="button"
                  disabled={!carrito.length}
                  onClick={() => window.open(wappURL, "_blank")}
                >
                  Enviar por WhatsApp
                </button>
                <button
                  className="btn"
                  type="button"
                  disabled={!carrito.length}
                  onClick={clear}
                >
                  Vaciar
                </button>
              </div>

              <div className="small">
                Precios sujetos a cambios sin previo aviso.
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {selected && (
        <>
          <div
            className="overlay"
            onClick={() => {
              setSelected(null);
              document.body.style.overflow = "";
            }}
          />
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-bar">
              <div className="modal-title">{selected.nombre}</div>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setSelected(null);
                  document.body.style.overflow = "";
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-media">
                <div
                  className="modal-hero"
                  style={{
                    backgroundImage: selected.images?.[previewIdx]
                      ? `url(${selected.images[previewIdx]})`
                      : "none",
                  }}
                >
                  {canPrev && (
                    <button
                      className="nav-arrow left"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewIdx((i) => Math.max(0, i - 1));
                      }}
                      aria-label="Anterior"
                    >
                      ‹
                    </button>
                  )}
                  {canNext && (
                    <button
                      className="nav-arrow right"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewIdx((i) => {
                          const tot = selected?.images?.length || 0;
                          return Math.min(tot - 1, i + 1);
                        });
                      }}
                      aria-label="Siguiente"
                    >
                      ›
                    </button>
                  )}
                </div>

                {selected.images?.length > 1 && (
                  <div className="thumbs">
                    {selected.images.slice(0, 12).map((src, i) => (
                      <button
                        key={i}
                        className={`thumb ${i === previewIdx ? "active" : ""}`}
                        style={{ backgroundImage: `url(${src})` }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewIdx(i);
                        }}
                        aria-label={`Imagen ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-info">
                <div className="small">SKU {selected.id}</div>
                {selected.descripcion && (
                  <p className="modal-desc">{selected.descripcion}</p>
                )}

                <div className="price-row" style={{ marginTop: 8 }}>
                  <div className="price">
                    {ARS(selected.precio * (1 + selected.iva))}
                  </div>
                  <span
                    className={`badge ${
                      (selected.stock ?? 0) <= 0
                        ? "none"
                        : selected.stock <= 5
                        ? "low"
                        : "ok"
                    }`}
                  >
                    {(selected.stock ?? 0) <= 0
                      ? "Sin stock"
                      : selected.stock <= 5
                      ? "Bajo stock"
                      : "Disponible"}
                  </span>
                </div>
                <div className="small">Precio final (IVA incluido)</div>

                {(selected.stock ?? 0) <= 0 && (
                  <div className="inline-error" style={{ marginTop: 6 }}>
                    No hay stock disponible para este producto.
                  </div>
                )}

                <div className="row" style={{ marginTop: 14 }}>
                  <div className="qty">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(999, q + 1))}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button
                    className={`btn btn-add ${
                      noStockId === selected.id ? "shake" : ""
                    }`}
                    type="button"
                    onClick={() => {
                      add(selected, qty);
                      if ((selected.stock ?? 0) > 0) {
                        setSelected(null);
                        document.body.style.overflow = "";
                      }
                    }}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Volver arriba */}
      {showBackTop && (
        <button
          className="back-top"
          type="button"
          aria-label="Volver arriba"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}

      <div className="center small" style={{ padding: 18 }}>
        © {new Date().getFullYear()} Dispenser La Tienda — Catálogo
      </div>
    </>
  );
}
