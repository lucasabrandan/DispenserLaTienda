// Fuente única (Google Sheets publicado como CSV o cualquier CSV público)
// Debe incluir columnas: sku, nombre, precio, stock, y opcionalmente image, image_2, image_3 ... o "images"
export const PRODUCTS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSxr9dAydjN08MnZu7HGds7AOFHkt7xSzAaZH79zLETJryg_QgyUN4__eeUM5-PJaSagcarCxMEWEo8/pub?gid=1205375456&single=true&output=csv";

// Teléfono WhatsApp (sin "+")
export const WAPP_PHONE = "5491166082608";

// Códigos de cupón (MAYÚSCULAS) -> % de descuento
export const COUPONS = {
  "CLIENTEVIP": 10,
  "AMIGOS": 5,
};

// Tags/Referencias que detectamos y permitimos filtrar (en minúsculas)
export const TAG_FILTERS = [
  "bacope", "tria", "ushuaia", "termoplast", "livore", "huayi", "non-spill", "red", "bidón"
];
