/* ==========================================================================
   PIZZARIA TOSCANA — Dados do site (ARQUIVO EDITÁVEL)
   --------------------------------------------------------------------------
   COMO EDITAR
   1. Telefone, endereço e horário: objeto CONFIG abaixo.
   2. Preços e descrições: listas PIZZAS e ESFIRRAS.
      O preço de cada pizza é o da PEQUENA; Média = x1.3, Grande = x1.6
      (ajuste os multiplicadores em TOSCANA.sizes).
   3. Fotos: troque o arquivo em assets/ mantendo o mesmo nome.
   4. Destaques da home: lista FEATURED (use os ids dos produtos).
   5. Para pausar um sabor sem apagar: adicione paused:true no item.
   6. Taxa de entrega: edite TOSCANA.fees.districts abaixo.
   7. SEM BORDA RECHEADA neste projeto (decisão do dono).
   ========================================================================== */

var TOSCANA = TOSCANA || {};

TOSCANA.config = {
  name: "Pizzaria Toscana",
  tagline: "Mais tempo de fermentação, mais sabor em cada mordida.",
  // WhatsApp: código do país + DDD + número, somente dígitos.
  whatsapp: "5543991443669",
  phoneDisplay: "(43) 99144-3669",
  phoneHref: "tel:+5543991443669",
  address: "Cambé/PR",
  // Estruturado para o selo Aberto/Fechado (0=Dom ... 6=Sab). Segunda (1) fechado.
  hours: "Terça a domingo · 18h às 23h30",
  openDays: [0, 2, 3, 4, 5, 6],
  openFrom: "18:00",
  openTo: "23:30",
  mapsUrl: "https://maps.google.com/?q=Cambé+PR",
  mapsEmbed: "https://www.google.com/maps?q=Cambé+PR&output=embed",
  instagram: "https://instagram.com/toscana.cambe",
  instagramHandle: "@toscana.cambe",
  reviewsUrl: "https://www.google.com/maps/search/Pizzaria+Toscana+Cambé+PR",
  promoFreeAbove: 0, // ex: 99 para "frete grátis acima de R$99". 0 = desativado.
  // Taxa extra ao montar meia-a-meia (montagem). 0 = sem taxa.
  halfFee: 5.00
};

/* Taxa de entrega por bairro (sem backend: tabela editável).
   Bairro fora da lista cai em defaultFee. */
TOSCANA.fees = {
  defaultFee: 6.00,
  districts: [
    { name: "Centro", fee: 5.00, eta: "30–45 min" },
    { name: "Jardim Santo Amaro", fee: 6.00, eta: "30–45 min" },
    { name: "Jardim Ana Rosa", fee: 6.00, eta: "35–50 min" },
    { name: "Parque São Francisco", fee: 7.00, eta: "35–50 min" },
    { name: "São Miguel", fee: 7.00, eta: "35–55 min" },
    { name: "Outro / consultar", fee: 6.00, eta: "a combinar" }
  ]
};

TOSCANA.payments = ["Pix", "Cartão na entrega", "Dinheiro"];

/* Tamanhos de pizza. "mult" multiplica o preço base (PEQUENA). */
TOSCANA.sizes = [
  { code: "P", label: "Pequena", detail: "6 fatias", mult: 1 },
  { code: "M", label: "Média", detail: "8 fatias", mult: 1.3 },
  { code: "G", label: "Grande", detail: "12 fatias", mult: 1.6 }
];

/* Pizzas. Campos: id, name, desc, price (tamanho P), img, badge, kind.
   kind: "tradicional" | "especial" | "doce". */
TOSCANA.pizzas = [
  /* ---- Tradicionais ---- */
  { id: "pz-mussarela",    name: "Mussarela",          desc: "Molho de tomate, mussarela e rodelas de tomate.", price: 44.90, img: "assets/pizza-margherita.jpg", badge: "", kind: "tradicional" },
  { id: "pz-alho-oleo",    name: "Alho e Óleo",        desc: "Molho de tomate, mussarela e alho frito.", price: 46.90, img: "assets/pizza-4queijos.jpg",   badge: "", kind: "tradicional" },
  { id: "pz-calabresa",    name: "Calabresa",          desc: "Molho de tomate, mussarela, calabresa e cebola fatiada.", price: 48.90, img: "assets/pizza-calabresa.jpg",  badge: "Mais pedida", kind: "tradicional" },
  { id: "pz-napolitana",   name: "Napolitana",         desc: "Molho de tomate, mussarela, presunto e tomate-cereja.", price: 49.90, img: "assets/pizza-margherita.jpg", badge: "", kind: "tradicional" },
  { id: "pz-milho",        name: "Milho Verde",        desc: "Molho de tomate, mussarela, milho, tomate em rodelas e parmesão.", price: 49.90, img: "assets/pizza-frango.jpg",     badge: "", kind: "tradicional" },
  { id: "pz-bacon-milho",  name: "Bacon com Milho",    desc: "Molho de tomate, mussarela, tomate, bacon e milho verde.", price: 52.90, img: "assets/pizza-pepperoni.jpg",  badge: "", kind: "tradicional" },
  { id: "pz-baiana",       name: "Baiana",             desc: "Molho de tomate, presunto, mussarela, calabresa em cubos, cebola, ovos e molho de pimenta vermelha.", price: 52.90, img: "assets/pizza-calabresa.jpg",  badge: "", kind: "tradicional" },
  { id: "pz-frango-queijo", name: "Frango com Queijo", desc: "Molho de tomate, frango desfiado, mussarela e rodelas de tomate.", price: 52.90, img: "assets/pizza-frango.jpg",     badge: "Mais pedida", kind: "tradicional" },
  { id: "pz-portuguesa",   name: "Portuguesa",         desc: "Molho de tomate, presunto, mussarela, cebola, ervilha fresca, milho, ovos e tomate.", price: 53.90, img: "assets/pizza-portuguesa.jpg", badge: "Mais pedida", kind: "tradicional" },
  { id: "pz-brocolis",     name: "Brócolis",           desc: "Molho de tomate, mussarela, brócolis, bacon, alho frito e tomate.", price: 53.90, img: "assets/pizza-toscana.jpg",    badge: "", kind: "tradicional" },
  { id: "pz-palmito",      name: "Palmito",            desc: "Molho de tomate, mussarela, palmito, Catupiry e tomate.", price: 54.90, img: "assets/pizza-4queijos.jpg",   badge: "", kind: "tradicional" },
  { id: "pz-atum",         name: "Atum",               desc: "Molho de tomate, mussarela, atum, cebola fatiada e tomate.", price: 54.90, img: "assets/pizza-portuguesa.jpg", badge: "", kind: "tradicional" },
  /* ---- Especiais ---- */
  { id: "pz-caprese",      name: "Caprese Toscana",    desc: "Molho de tomate, mussarela de búfala, tomate-cereja, manjericão fresco e parmesão.", price: 59.90, img: "assets/pizza-margherita.jpg", badge: "Edição da casa", kind: "especial" },
  { id: "pz-calabresa-esp", name: "Calabresa Especial", desc: "Molho de tomate, mussarela, calabresa, cebola roxa laminada, Catupiry e tomate.", price: 62.90, img: "assets/pizza-calabresa.jpg",  badge: "Edição da casa", kind: "especial" },
  { id: "pz-champ-toscana", name: "Champignon Toscana", desc: "Molho de tomate, frango desfiado, mussarela, Catupiry, champignon, milho e tomate.", price: 64.90, img: "assets/pizza-frango.jpg",     badge: "", kind: "especial" },
  { id: "pz-oro",          name: "Oro di Toscana",     desc: "Molho de tomate, mussarela, frango desfiado, milho, bacon, cheddar e tomate.", price: 64.90, img: "assets/pizza-pepperoni.jpg",  badge: "", kind: "especial" },
  { id: "pz-lucca",        name: "Lucca Bianca",       desc: "Molho de tomate, mussarela, lombo canadense, tomate-cereja e Catupiry.", price: 62.90, img: "assets/pizza-toscana.jpg",    badge: "", kind: "especial" },
  { id: "pz-carne-seca",   name: "Carne-Seca Especial", desc: "Molho de tomate, carne-seca desfiada, mussarela, cebola roxa fatiada, pimentão em fatias e tomate.", price: 64.90, img: "assets/pizza-toscana.jpg",    badge: "", kind: "especial" },
  { id: "pz-champ-mista",  name: "Champignon Mista",   desc: "Molho de tomate, mussarela, presunto, palmito, ervilha fresca, milho, bacon, tomate e cebola.", price: 62.90, img: "assets/pizza-portuguesa.jpg", badge: "", kind: "especial" },
  { id: "pz-strogonoff",   name: "Strogonoff de Carne", desc: "Molho de tomate, strogonoff de carne, mussarela e batata palha.", price: 64.90, img: "assets/pizza-frango.jpg",     badge: "", kind: "especial" },
  { id: "pz-chef",        name: "Toscana do Chef",   desc: "Molho de tomate, ragu de linguiça, mussarela de búfala, cebola roxa fatiada e tomate-cereja.", price: 69.90, img: "assets/pizza-toscana.jpg",    badge: "Edição da casa", kind: "especial" },
  { id: "pz-4queijos",     name: "4 Queijos",          desc: "Molho de tomate, mussarela, provolone, gorgonzola e parmesão.", price: 59.90, img: "assets/pizza-4queijos.jpg",   badge: "Mais pedida", kind: "especial" },
  /* ---- Doces ---- */
  { id: "pz-brigadeiro",   name: "Brigadeiro",         desc: "Creme especial de chocolate ao leite cremoso, mussarela e granulado.", price: 49.90, img: "assets/pizza-chocolate.jpg",  badge: "", kind: "doce" },
  { id: "pz-banana",       name: "Banana",             desc: "Doce de leite cremoso, banana em rodelas, mussarela e canela.", price: 49.90, img: "assets/pizza-chocolate.jpg",  badge: "", kind: "doce" },
  { id: "pz-cocadinha",    name: "Cocadinha",          desc: "Creme branco especial, mussarela, cocada e coco ralado.", price: 52.90, img: "assets/pizza-chocolate.jpg",  badge: "", kind: "doce" },
  { id: "pz-mm",           name: "M&M",                desc: "Creme de chocolate ao leite, mussarela e M&M.", price: 52.90, img: "assets/pizza-chocolate.jpg",  badge: "", kind: "doce" },
  { id: "pz-nevada",       name: "Nevada",             desc: "Creme de morango, creme de chocolate ao leite, morangos frescos laminados, finalizada com Leite Ninho.", price: 54.90, img: "assets/pizza-chocolate.jpg",  badge: "Mais pedida", kind: "doce" }
];

/* Esfirras (preço por unidade). */
TOSCANA.esfirras = [
  { id: "es-carne",     name: "Carne",     desc: "Carne moída temperada com tomate, cebola e toque de limão.", price: 8.00,  img: "assets/esfirra-carne.jpg",     badge: "Mais pedida", kind: "salgada" },
  { id: "es-queijo",    name: "Queijo",    desc: "Mussarela gratinada com orégano.", price: 8.50,  img: "assets/esfirra-queijo.jpg",    badge: "", kind: "salgada" },
  { id: "es-frango",    name: "Frango",    desc: "Frango desfiado cremoso com catupiry.", price: 9.00,  img: "assets/esfirra-frango.jpg",    badge: "", kind: "salgada" },
  { id: "es-calabresa", name: "Calabresa", desc: "Calabresa moída, cebola e mussarela.", price: 9.00,  img: "assets/esfirra-calabresa.jpg", badge: "", kind: "salgada" },
  { id: "es-chocolate", name: "Chocolate", desc: "Chocolate ao leite cremoso.", price: 10.00, img: "assets/esfirra-chocolate.jpg", badge: "", kind: "doce" },
  { id: "es-prestigio", name: "Prestígio", desc: "Chocolate, coco ralado e leite condensado.", price: 11.00, img: "assets/esfirra-prestigio.jpg", badge: "Edição da casa", kind: "doce" }
];

/* Ids exibidos em "As mais pedidas" na pagina inicial. */
TOSCANA.featured = ["pz-calabresa", "pz-4queijos", "pz-chef", "es-carne"];
