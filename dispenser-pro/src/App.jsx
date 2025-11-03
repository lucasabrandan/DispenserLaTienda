import { useEffect, useMemo, useState } from "react";
import "./site.light.css"; // tu css limpio

/* ============== Marca / Config ============== */
const BRAND = {
  name: "Dispenser La Tienda",
  slogan: "Innovación en cada servicio.",
  primary: "#11A1B9",
  phone: "+54 11 6608-2608",
  email: "dispenserlatienda@gmail.com",
  coverage: "CABA y GBA",
  hours: "Lun a Vie 9–18h",
};

const WHATSAPP_NUMBER = "5491166082608";
const enc = encodeURIComponent;
const waBase = `https://wa.me/${WHATSAPP_NUMBER}?text=${enc(
  "Hola, vengo de la web (servicio técnico)."
)}`;

const peso = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/* ============== Data de Videos (Unificada) ============== */
const REELS_DATA = [
  {
    src: "/videos/caso2.mp4",
    poster: "/videos/posters/caso2.png",
    title: "Antes/Después 1",
  },
  {
    src: "/videos/caso1.mp4",
    poster: "/videos/posters/caso1.png",
    title: "Antes/Después 2",
  },
  {
    src: "/videos/caso3.mp4",
    poster: "/videos/posters/caso3.png",
    title: "Antes/Después 3",
  },
];

/* ============== App principal ============== */
export default function App() {
  useEffect(() => {
    document.title = `${BRAND.name} – Servicio técnico de dispensers`;
  }, []);

  // esto activa los reveal (ida y vuelta)
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="page">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <Process />
        <Videos />
        <ProductStrip /> {/* los 4 modelos */}
        <FAQ /> {/* Preguntas + calculadora */}
        <Contact /> {/* CTA */}
        <CatalogPreview /> {/* Catálogo */}
      </main>
      <Footer />
      <Schema />
      <WhatsAppFab />
    </div>
  );
}

/* ============== Header ============== */
function Header() {
  return (
    <header className="site-header">
      <div className="inner header-centered">
        <a href="#" className="brand">
          <img src="logo.png" className="logo" alt={BRAND.name} />
          <span className="brand-name">{BRAND.name}</span>
        </a>
        <nav className="nav">
          <a href="#servicios">Servicios</a>
          <a href="#proceso">Proceso</a>
          <a href="#videos">Casos</a>
          <a href="#equipos">Equipos</a>
          <a href="#faq">FAQ</a>
          <a href="#contacto">Contacto</a>
          <a href="#repuestos">Catálogo</a>
        </nav>
        <a href={waBase} className="btn btn-primary">
          WhatsApp
        </a>
      </div>
    </header>
  );
}

/* ============== Hero ============== */
function Hero() {
  return (
    <section className="section hero reveal" data-reveal="up">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="badge">
            Servicio a domicilio • {BRAND.coverage}
          </span>
          <h1 className="h1">
            Servicio técnico y mantenimiento de dispensers
          </h1>
          <p className="lead">
            Limpieza sanitaria, cambio de filtros, reparación y conversión a
            red. Atención a empresas y particulares desde 2018.
          </p>
          <div className="hero-cta">
            <a href={waBase} className="btn btn-primary">
              Quiero coordinar visita
            </a>
            <a href="#servicios" className="btn">
              Ver servicios
            </a>
          </div>
          <ul className="checks">
            <li>Respuesta en 24h</li>
            <li>Higiene con registro fotográfico</li>
            <li>Repuestos y soluciones reales</li>
          </ul>
        </div>
        <div className="media-frame aspect-video hero-media reveal" data-reveal="right">
          <img src="/imagen.png" alt="Dispenser en servicio" />
        </div>
      </div>
    </section>
  );
}

/* ============== Trust bar ============== */
function TrustBar() {
  return (
    <section className="strip reveal" data-reveal="up">
      <div className="container strip-inner">
        <div className="strip-item">Técnicos especializados</div>
        <div className="strip-item">Cobertura en CABA y GBA</div>
        <div className="strip-item">Turnos flexibles</div>
        <div className="strip-item">Atención a empresas</div>
      </div>
    </section>
  );
}

/* ============== Iconos ============== */
const IconCase = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconWrench = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 7l3 3" />
    <path d="M2 22l7-7" />
    <path d="M14.5 5.5a4 4 0 1 0 4 4l3-3-4-4-3 3z" />
  </svg>
);
const IconDrop = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />
  </svg>
);
const IconSparkle = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.5 5 5 2.5-5 2.5L12 18l-2.5-5-5-2.5 5-2.5L12 3z" />
  </svg>
);

/* ============== Servicios / Consultas rápidas ============== */
function Services() {
  const items = [
    {
      t: "¿Cada cuánto hay que hacer mantenimiento?",
      p: "Recomendado una vez al año para mantener la calidad del agua.",
      icon: <IconWrench />,
    },
    {
      t: "Sale poca agua o con olor raro",
      p: "Puede ser filtro vencido o falta de limpieza interna.",
      icon: <IconDrop />,
    },
    {
      t: "¿Conviene pasar de bidón a red?",
      p: "Instalamos el kit y te mostramos el ahorro.",
      icon: <IconCase />,
    },
    {
      t: "Pierde agua por abajo, ¿es grave?",
      p: "Chequeamos mangueras, flotante y conectores. Mejor no usarlo antes.",
      icon: <IconSparkle />,
    },
  ];

  return (
    <section id="servicios" className="section reveal" data-reveal="up">
      <div className="container">
        <header className="section-title">
          <h2 className="h2">Consultas frecuentes de servicio</h2>
          <p className="muted">
            Lo que más nos preguntan cuando un dispenser empieza a fallar.
          </p>
        </header>
        <div className="services">
          {items.map((s) => (
            <article className="card center" key={s.t}>
              <div className="icon">{s.icon}</div>
              <h3 className="card-title">{s.t}</h3>
              <p className="muted">{s.p}</p>
              {/* CTA cortito opcional */}
              <a href="#contacto" className="btn btn-sm">
                Consultar
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ============== Proceso ============== */
function Process() {
  const steps = [
    {
      n: 1,
      t: "Diagnóstico",
      d: "Revisamos el equipo y validamos el estado sanitario.",
    },
    {
      n: 2,
      t: "Limpieza / Reparación",
      d: "Higienizamos y reparamos con repuestos confiables.",
    },
    {
      n: 3,
      t: "Entrega y registro",
      d: "Pruebas, fotos del trabajo y recomendaciones.",
    },
  ];
  return (
    <section id="proceso" className="section reveal" data-reveal="up">
      <div className="container">
        <header className="section-title">
          <h2 className="h2">Cómo trabajamos</h2>
          <p className="muted">Rápido, claro y con registro fotográfico.</p>
        </header>
        <div className="process">
          {steps.map((s) => (
            <div className="step card reveal" data-reveal="up" key={s.n}>
              <div className="step-number">{s.n}</div>
              <div>
                <div className="card-title">{s.t}</div>
                <div className="muted">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== Videos (Casos reales) ============== */
function Videos() {
  return (
    <section id="videos" className="section reveal" data-reveal="up">
      <div className="container">
        <header className="section-title">
          <h2 className="h2">Casos reales</h2>
          <p className="muted">
            Limpieza, cambio de filtros y recuperación del equipo.
          </p>
        </header>
        <div className="carousel">
          {REELS_DATA.map((v, i) => (
            <figure key={i} className="tile reveal" data-reveal="up">
              <video
                className="reel-video"
                src={v.src}
                poster={v.poster}
                controls
                playsInline
                controlsList="nofullscreen" // <-- Deshabilita el fullscreen
              />
              <figcaption className="small muted">{v.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== Equipos (venta) ============== */
function ProductStrip() {
  const products = [
    {
      id: "zafiro",
      name: "Dispenser de agua (a red)",
      desc: "Frío/calor, para oficina o domicilio.",
      img: "/Proximamante.png",
    },
    {
      id: "bb168",
      name: "Dispenser de agua (a bidón)",
      desc: "Clásico con bidón, ideal 20 L.",
      img: "/Proximamante.png",
    },
    {
      id: "bf280",
      name: "Bebedero industrial acero inoxidable",
      desc: "Más robusto, gabinete metálico.",
      img: "/Proximamante.png",
    },
    {
      id: "miniantares",
      name: "Mini-Dispenser de mesada a red o bidón",
      desc: "Compacto a red para espacios chicos.",
      img: "/Proximamante.png",
    },
  ];

  return (
    <section id="equipos" className="section reveal" data-reveal="up">
      <div className="container">
        <header className="section-title">
          <h2 className="h2">Equipos que podés comprar</h2>
          <p className="muted">
            Los entregamos listos o te los instalamos en la visita técnica.
          </p>
        </header>
        <div className="carousel">
          {products.map((p) => (
            <article key={p.id} className="card tile reveal" data-reveal="up">
              <div className="equip-frame">
                <img
                  src={p.img}
                  alt={p.name}
                  className="equip-img"
                  loading="lazy"
                />
              </div>
              <div className="card-body">
                <h3 className="card-title">{p.name}</h3>
                <p className="muted">{p.desc}</p>
                <a
                  className="btn"
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${enc(
                    "Hola, quiero precio de: " + p.name
                  )}`}
                >
                  Pedir precio por WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== Calculadora ============== */
function Calculator() {
  const [pBidon, setPBidon] = useState(7500);
  const [bMes, setBMes] = useState(4);
  const [kit, setKit] = useState(120000);
  const [mant, setMant] = useState(140000);

  const calc = useMemo(() => {
    const anualBidon = pBidon * bMes * 12;
    const primerAnio = kit + mant;
    const siguienteAnio = mant;
    const ahorroAnio1 = anualBidon - primerAnio;
    const ahorroAnio2 = anualBidon - siguienteAnio;
    const payback =
      ahorroAnio2 > 0 ? Math.ceil(kit / (ahorroAnio2 / 12)) : Infinity;
    return {
      anualBidon,
      primerAnio,
      siguienteAnio,
      ahorroAnio1,
      ahorroAnio2,
      payback,
    };
  }, [pBidon, bMes, kit, mant]);

  return (
    <div className="card p6 mt">
      <h3 className="card-title">Calculadora de ahorro</h3>
      <div className="grid-2">
        <Num label="Precio del bidón (ARS)" v={pBidon} s={setPBidon} />
        <Num label="Bidones por mes" v={bMes} s={setBMes} />
        <Num label="Kit adaptación (ARS)" v={kit} s={setKit} />
        <Num label="Mantenimiento anual (ARS)" v={mant} s={setMant} />
      </div>
      <hr className="hr" />
      <dl className="dl">
        <Row l="Costo anual bidones" v={peso.format(calc.anualBidon)} />
        <Row l="1er año (kit + mant.)" v={peso.format(calc.primerAnio)} />
        <Row l="Años siguientes" v={peso.format(calc.siguienteAnio)} />
        <hr className="hr" />
        <Row l="Ahorro 1er año" v={peso.format(calc.ahorroAnio1)} />
        <Row
          l="Ahorro anual posterior"
          v={peso.format(calc.ahorroAnio2)}
          highlight
        />
        <Row
          l="Payback (meses)"
          v={
            calc.payback === Infinity ? "sin recuperación" : `${calc.payback}`
          }
        />
      </dl>
      <p className="small muted mt">
        *El <strong>payback</strong> indica en cuántos meses recuperás la
        inversión.
      </p>
    </div>
  );
}
function Num({ label, v, s }) {
  return (
    <label className="label">
      {label}
      <input
        type="number"
        value={v}
        onChange={(e) => s(parseFloat(e.target.value || 0))}
        className="input"
      />
    </label>
  );
}
function Row({ l, v, highlight }) {
  return (
    <div className="row between">
      <dt className="muted">{l}</dt>
      <dd className={highlight ? "strong-ok" : "strong"}>{v}</dd>
    </div>
  );
}

/* ============== FAQ ============== */
function FAQ() {
  const [open, setOpen] = useState({});
  const toggle = (i) => setOpen((s) => ({ ...s, [i]: !s[i] }));

  const items = [
    {
      q: "El agua tiene un gusto u olor extraño, ¿qué puede ser?",
      a: (
        <>
          <p>
            Un cambio en el sabor u olor del agua suele indicar{" "}
            <strong>filtro de carbón activado saturado</strong> o necesidad de{" "}
            <strong>limpieza interna profunda</strong>.
          </p>
          <p>
            👉 La solución es realizar un <strong>mantenimiento anual</strong>{" "}
            (limpieza + desinfección + filtro).
          </p>
          <p>
            <a href={waBase} className="btn mt">
              Coordinar visita
            </a>
          </p>
        </>
      ),
    },
    {
      q: "Mi dispenser me da corriente o sentí una descarga eléctrica, ¿qué debo hacer?",
      a: (
        <>
          <p>
            <strong>Desenchufá inmediatamente</strong> el equipo y no lo uses
            hasta que lo revise un técnico.
          </p>
          <p>
            Puede deberse a humedad interna, fallas de aislación o desgaste del
            cableado.
          </p>
          <p>
            <a href={waBase} className="btn mt">
              Solicitar revisión
            </a>
          </p>
        </>
      ),
    },
    {
      q: "Salió olor a quemado o humo del dispenser, ¿qué hago?",
      a: (
        <>
          <p>
            <strong>Desenchufá</strong> el equipo de inmediato. Puede
            ser sobrecalentamiento del compresor o fallas eléctricas internas.
          </p>
          <p>
            👉 No lo vuelvas a encender. Hacemos control de temperatura,
            limpieza interna y pruebas de seguridad.
          </p>
          <p>
            <a href={waBase} className="btn mt">
              Pedir diagnóstico
            </a>
          </p>
        </>
      ),
    },
    {
      q: "Mi dispenser pierde agua, ¿por qué sucede?",
      a: (
        <>
          <p>
            Puede tratarse de una <strong>pérdida en el botellón</strong>, una{" "}
            <strong>unión mal sellada</strong> o una{" "}
            <strong>falla del flotante interno</strong>.
          </p>
          <p>
            👉 Si la pérdida proviene del interior o del filtro, hace falta{" "}
            <strong>mantenimiento técnico</strong>.
          </p>
          <p>
            <a href={waBase} className="btn mt">
              Agendar mantenimiento
            </a>
          </p>
        </>
      ),
    },
    {
      q: "No sale agua ni fría ni caliente (equipo con filtro de carbón), ¿qué puede ser?",
      a: (
        <>
          <p>Las causas más comunes:</p>
          <ul className="small">
            <li>Baja presión en la red de agua</li>
            <li>Mangueras estranguladas o con aire</li>
            <li>Filtro saturado o vencido</li>
          </ul>
          <p>
            👉 Recomendamos solicitar <strong>revisión técnica</strong> y{" "}
            <strong>cambio de filtro</strong>.
          </p>
          <p>
            <a href={waBase} className="btn mt">
              Solicitar revisión
            </a>
          </p>
        </>
      ),
    },
    {
      q: "Mi dispenser no enfría o enfría poco, ¿qué hago?",
      a: (
        <>
          <p>
            Verificá si la parrilla trasera está caliente o tapada y dejá al
            menos 10 cm para ventilar.
          </p>
          <p>
            👉 Si persiste, puede ser falla del sistema de refrigeración o bajo
            nivel de gas.
          </p>
          <p>
            <a href={waBase} className="btn mt">
              Revisar sistema de frío
            </a>
          </p>
        </>
      ),
    },
    {
      q: "Mi dispenser no calienta el agua, ¿qué puede estar pasando?",
      a: (
        <>
          <p>
            Confirmá que el sistema de agua caliente esté encendido. Si no,
            puede fallar la resistencia o el termostato.
          </p>
          <p>
            👉 Recomendamos mantenimiento preventivo.
          </p>
          <p>
            <a href={waBase} className="btn mt">
              Pedir mantenimiento
            </a>
          </p>
        </>
      ),
    },
    {
      q: "A veces calienta o enfría, y otras veces no",
      a: (
        <>
          <p>
            Suele deberse a consumo excesivo o a una conexión eléctrica
            inestable. Dejá 20 minutos de recuperación.
          </p>
          <p>
            <a href={waBase} className="btn mt">
              Agendar diagnóstico
            </a>
          </p>
        </>
      ),
    },
    {
      q: "Tengo mi dispenser de bidón: ¿cuánto sale transformarlo a red y cuánto ahorro?",
      a: (
        <>
          <p className="small">
            El <strong>primer año</strong> incluye kit de adaptación + mano de
            obra + mantenimiento. Desde el 2.º año solo abonás mantenimiento.
          </p>
          {/* ACA LA CALCULADORA */}
          <Calculator />
          <p>
            <a href={waBase} className="btn btn-primary mt">
              Quiero reconvertir mi equipo
            </a>
          </p>
        </>
      ),
    },
    {
      q: "Ya revisé todo y el problema sigue, ¿qué puedo hacer?",
      a: (
        <>
          <p>
            Cuando hay fallas recurrentes, lo indicado es un{" "}
            <strong>mantenimiento integral</strong>:
          </p>
          <ul className="small">
            <li>Limpieza y desinfección interna</li>
            <li>Control del sistema eléctrico y de refrigeración</li>
            <li>Cambio de filtro y revisión de mangueras</li>
            <li>Prueba final de funcionamiento</li>
          </ul>
          <p className="small">
            👉 Contratá nuestro <strong>mantenimiento anual</strong> para
            asegurar un equipo seguro.
          </p>
          <p>
            <a href={waBase} className="btn btn-primary mt">
              Contactar por WhatsApp
            </a>
          </p>
        </>
      ),
    },
  ];

  return (
    <section id="faq" className="section reveal" data-reveal="up">
      <div className="container">
        <header className="section-title">
          <h2 className="h2">💧 Preguntas frecuentes sobre dispensers</h2>
          <p className="muted">
            Preparadas para el 90% de las consultas que recibimos a diario.
          </p>
        </header>

        {items.map((it, i) => (
          <div key={i} className="accordion">
            <button
              className="accordion-head"
              onClick={() => toggle(i)}
              aria-expanded={!!open[i]}
            >
              {open[i] ? "▾ " : "▸ "} {it.q}
            </button>
            {open[i] && <div className="accordion-body">{it.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============== Contacto ============== */
function Contact() {
  const [f, setF] = useState({
    nombre: "",
    institucion: "",
    ciudad: "",
    mensaje: "",
  });
  const on = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const text = `Consulta desde la web:

Nombre: ${f.nombre}
Institución: ${f.institucion}
Ciudad: ${f.ciudad}
Mensaje: ${f.mensaje}`;
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${enc(text)}`;
  };

  return (
    <section id="contacto" className="section reveal" data-reveal="up">
      <div className="container grid-2 contact-grid">
        <div>
          <header className="section-title">
            <h2 className="h2">Agendá un diagnóstico</h2>
            <p className="muted">Asegurá agua segura y disponible todo el año.</p>
          </header>
          <p>Tel: {BRAND.phone}</p>
          <p>Email: {BRAND.email}</p>
          <p>Horario: {BRAND.hours}</p>
        </div>
        <form className="card p6" onSubmit={submit}>
          <Field label="Nombre" v={f.nombre} onChange={on("nombre")} />
          <Field label="Institución" v={f.institucion} onChange={on("institucion")} />
          <Field label="Ciudad" v={f.ciudad} onChange={on("ciudad")} />
          <Field
            label="Mensaje"
            as="textarea"
            rows={4}
            v={f.mensaje}
            onChange={on("mensaje")}
          />
          <button type="submit" className="btn btn-primary wfull mt">
            Enviar por WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}
function Field({ label, as = "input", rows = 3, v, onChange }) {
  const El = as;
  return (
    <label className="label block">
      {label}
      <El className="input" rows={rows} value={v} onChange={onChange} />
    </label>
  );
}

/* ============== Catálogo ============== */
function CatalogPreview() {
  return (
    <section id="repuestos" className="section reveal" data-reveal="up">
      <div className="container">
        <header className="section-title">
          <h2 className="h2">Catálogo de repuestos</h2>
          <p className="muted">Venta exclusiva para clientes activos.</p>
        </header>
        <a
          href="/catalog/index.html"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
        >
          Ver catálogo completo
        </a>
      </div>
    </section>
  );
}

/* ============== Footer ============== */
function Footer() {
  return (
    <footer className="section">
      <div className="container footer">
        <div className="row gap">
          <img src="logo.png" className="logo-sm" alt="Logo" />
          <div>
            <div className="strong">{BRAND.name}</div>
            <div className="small muted">{BRAND.slogan}</div>
          </div>
        </div>
        <div className="small muted">
          © {new Date().getFullYear()} {BRAND.name}. {BRAND.coverage}.
        </div>
      </div>
    </footer>
  );
}

/* ============== Schema + WhatsAppFab ============== */
function Schema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BRAND.name,
    slogan: BRAND.slogan,
    areaServed: BRAND.coverage,
    telephone: BRAND.phone,
    email: BRAND.email,
    openingHours: BRAND.hours,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function WhatsAppFab() {
  return (
    <a className="wa-fab" href={waBase} aria-label="WhatsApp">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19.11 17.25c-.28-.14-1.64-.81-1.89-.9s-.44-.14-.62.14c-.18.28-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.2-.44-2.28-1.4-.84-.75-1.41-1.67-1.58-1.95-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.1-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.06-.22-.53-.45-.46-.62-.46h-.53c-.18 0-.46.07-.7.34s-.92.9-.92 2.2.95 2.55 1.08 2.73c.14.18 1.87 2.86 4.54 4.02.64.28 1.14.45 1.53.58.64.2 1.22.17 1.68.1.51-.08 1.64-.67 1.87-1.31.23-.64.23-1.19.16-1.31-.06-.12-.25-.2-.53-.34z"
        />
      </svg>
    </a>
  );
}
