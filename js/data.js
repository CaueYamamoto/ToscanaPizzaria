/* ==========================================================================
   PIZZARIA TOSCANA — Dados do site (ARQUIVO EDITÁVEL)
   --------------------------------------------------------------------------
   COMO EDITAR
   1. Telefone, endereço e horário: objeto CONFIG abaixo.
   2. Preços e descrições: listas PIZZAS e ESFIRRAS.
      O preço da pizza vem da CATEGORIA (kind) e do tamanho: edite
      TOSCANA.pizzaPrices. O preço das esfirras vem do campo price do item.
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
  whatsapp: "5543991929937",
  phoneDisplay: "(43) 99192-9937",
  phoneHref: "tel:+5543991929937",
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

/* Tamanhos de pizza. */
TOSCANA.sizes = [
  { code: "P", label: "Pequena", detail: "6 fatias" },
  { code: "M", label: "Média", detail: "8 fatias" },
  { code: "G", label: "Grande", detail: "12 fatias" }
];

/* Preços das pizzas por CATEGORIA (kind) e tamanho. */
TOSCANA.pizzaPrices = {
  tradicional: { P: 59.00, M: 69.00, G: 75.00 },
  especial:    { P: 69.00, M: 79.00, G: 89.00 },
  doce:        { P: 69.00, M: 79.00, G: 89.00 }
};

/* Pizzas. Campos: id, name, desc, img, kind.
   kind: "tradicional" | "especial" | "doce".
   O preço NÃO fica aqui: vem de TOSCANA.pizzaPrices pela categoria. */
TOSCANA.pizzas = [
  /* ---- Tradicionais ---- */
  { id: "pz-mussarela",    name: "Mussarela",          desc: "Molho de tomate, mussarela e rodelas de tomate.", img: "assets/pizza-margherita.jpg", kind: "tradicional" },
  { id: "pz-alho-oleo",    name: "Alho e Óleo",        desc: "Molho de tomate, mussarela e alho frito.", img: "assets/pizza-4queijos.jpg",   kind: "tradicional" },
  { id: "pz-calabresa",    name: "Calabresa",          desc: "Molho de tomate, mussarela, calabresa e cebola fatiada.", img: "assets/pizza-calabresa.jpg",  kind: "tradicional" },
  { id: "pz-napolitana",   name: "Napolitana",         desc: "Molho de tomate, mussarela, presunto e tomate-cereja.", img: "assets/pizza-margherita.jpg", kind: "tradicional" },
  { id: "pz-milho",        name: "Milho Verde",        desc: "Molho de tomate, mussarela, milho, tomate em rodelas e parmesão.", img: "assets/pizza-frango.jpg",     kind: "tradicional" },
  { id: "pz-bacon-milho",  name: "Bacon com Milho",    desc: "Molho de tomate, mussarela, tomate, bacon e milho verde.", img: "assets/pizza-pepperoni.jpg",  kind: "tradicional" },
  { id: "pz-baiana",       name: "Baiana",             desc: "Molho de tomate, presunto, mussarela, calabresa em cubos, cebola, ovos e molho de pimenta vermelha.", img: "assets/pizza-calabresa.jpg",  kind: "tradicional" },
  { id: "pz-frango-queijo", name: "Frango com Queijo", desc: "Molho de tomate, frango desfiado, mussarela e rodelas de tomate.", img: "assets/pizza-frango.jpg",     kind: "tradicional" },
  { id: "pz-frango-catupiry", name: "Frango com Catupiry", desc: "Molho de tomate, frango desfiado, mussarela e Catupiry.", img: "assets/pizza-frango.jpg",     kind: "tradicional" },
  { id: "pz-portuguesa",   name: "Portuguesa",         desc: "Molho de tomate, presunto, mussarela, cebola, ervilha fresca, milho, ovos e tomate.", img: "assets/pizza-portuguesa.jpg", kind: "tradicional" },
  { id: "pz-brocolis",     name: "Brócolis",           desc: "Molho de tomate, mussarela, brócolis, bacon, alho frito e tomate.", img: "assets/pizza-toscana.jpg",    kind: "tradicional" },
  { id: "pz-palmito",      name: "Palmito",            desc: "Molho de tomate, mussarela, palmito, Catupiry e tomate.", img: "assets/pizza-4queijos.jpg",   kind: "tradicional" },
  { id: "pz-atum",         name: "Atum",               desc: "Molho de tomate, mussarela, atum, cebola fatiada e tomate.", img: "assets/pizza-portuguesa.jpg", kind: "tradicional" },
  /* ---- Especiais ---- */
  { id: "pz-caprese",      name: "Caprese Toscana",    desc: "Molho de tomate, mussarela de búfala, tomate-cereja, manjericão fresco e parmesão.", img: "assets/pizza-margherita.jpg", kind: "especial" },
  { id: "pz-calabresa-esp", name: "Calabresa Especial", desc: "Molho de tomate, mussarela, calabresa, cebola roxa laminada, Catupiry e tomate.", img: "assets/pizza-calabresa.jpg",  kind: "especial" },
  { id: "pz-champ-toscana", name: "Champignon Toscana", desc: "Molho de tomate, frango desfiado, mussarela, Catupiry, champignon, milho e tomate.", img: "assets/pizza-frango.jpg",     kind: "especial" },
  { id: "pz-oro",          name: "Oro di Toscana",     desc: "Molho de tomate, mussarela, frango desfiado, milho, bacon, cheddar e tomate.", img: "assets/pizza-pepperoni.jpg",  kind: "especial" },
  { id: "pz-lucca",        name: "Lucca Bianca",       desc: "Molho de tomate, mussarela, lombo canadense, tomate-cereja e Catupiry.", img: "assets/pizza-toscana.jpg",    kind: "especial" },
  { id: "pz-carne-seca",   name: "Carne-Seca Especial", desc: "Molho de tomate, carne-seca desfiada, mussarela, cebola roxa fatiada, pimentão em fatias e tomate.", img: "assets/pizza-toscana.jpg",    kind: "especial" },
  { id: "pz-champ-mista",  name: "Champignon Mista",   desc: "Molho de tomate, mussarela, presunto, palmito, ervilha fresca, milho, bacon, tomate e cebola.", img: "assets/pizza-portuguesa.jpg", kind: "especial" },
  { id: "pz-strogonoff",   name: "Strogonoff de Carne", desc: "Molho de tomate, strogonoff de carne, mussarela e batata palha.", img: "assets/pizza-frango.jpg",     kind: "especial" },
  { id: "pz-chef",        name: "Toscana do Chef",   desc: "Molho de tomate, ragu de linguiça, mussarela de búfala, cebola roxa fatiada e tomate-cereja.", img: "assets/pizza-toscana.jpg",    kind: "especial" },
  { id: "pz-4queijos",     name: "4 Queijos",          desc: "Molho de tomate, mussarela, provolone, gorgonzola e parmesão.", img: "assets/pizza-4queijos.jpg",   kind: "especial" },
  /* ---- Doces ---- */
  { id: "pz-brigadeiro",   name: "Brigadeiro",         desc: "Creme especial de chocolate ao leite cremoso, mussarela e granulado.", img: "assets/pizza-chocolate.jpg",  kind: "doce" },
  { id: "pz-banana",       name: "Banana",             desc: "Doce de leite cremoso, banana em rodelas, mussarela e canela.", img: "assets/pizza-chocolate.jpg",  kind: "doce" },
  { id: "pz-cocadinha",    name: "Cocadinha",          desc: "Creme branco especial, mussarela, cocada e coco ralado.", img: "assets/pizza-chocolate.jpg",  kind: "doce" },
  { id: "pz-mm",           name: "M&M",                desc: "Creme de chocolate ao leite, mussarela e M&M.", img: "assets/pizza-chocolate.jpg",  kind: "doce" },
  { id: "pz-nevada",       name: "Nevada",             desc: "Creme de morango, creme de chocolate ao leite, morangos frescos laminados, finalizada com Leite Ninho.", img: "assets/pizza-chocolate.jpg",  kind: "doce" }
];

/* Esfirras (preço por unidade). */
TOSCANA.esfirras = [
  { id: "es-carne",          name: "Carne",              desc: "Carne moída temperada com tomate, cebola e toque de limão.", price: 8.90,  img: "assets/esfirra-carne.jpg",     kind: "salgada" },
  { id: "es-queijo",         name: "Queijo",             desc: "Mussarela gratinada com orégano.", price: 8.90,  img: "assets/esfirra-queijo.jpg",    kind: "salgada" },
  { id: "es-napolitana",     name: "Napolitana",         desc: "Molho de tomate, mussarela, presunto e tomate.", price: 8.90,  img: "assets/esfirra-queijo.jpg",    kind: "salgada" },
  { id: "es-frango",         name: "Frango",             desc: "Frango desfiado com queijo.", price: 8.90,  img: "assets/esfirra-frango.jpg",    kind: "salgada" },
  { id: "es-frango-catupiry", name: "Frango com Catupiry", desc: "Frango desfiado, mussarela e catupiry.", price: 8.90,  img: "assets/esfirra-frango.jpg",    kind: "salgada" },
  { id: "es-calabresa",      name: "Calabresa",          desc: "Calabresa moída, cebola e mussarela.", price: 8.90,  img: "assets/esfirra-calabresa.jpg", kind: "salgada" },
  { id: "es-brocolis",       name: "Brócolis",           desc: "Mussarela, brócolis, alho frito e tomate.", price: 8.90,  img: "assets/esfirra-calabresa.jpg", kind: "salgada" },
  { id: "es-atum",           name: "Atum",               desc: "Atum, cebola fatiada e queijo cremoso.", price: 8.90,  img: "assets/esfirra-calabresa.jpg", kind: "salgada" },
  { id: "es-brigadeiro",     name: "Brigadeiro",         desc: "Chocolate ao leite cremoso com granulado.", price: 10.00, img: "assets/esfirra-chocolate.jpg", kind: "doce" },
  { id: "es-prestigio",      name: "Prestígio",          desc: "Chocolate, coco ralado e leite condensado.", price: 10.00, img: "assets/esfirra-prestigio.jpg", kind: "doce" },
  { id: "es-sensacao",       name: "Sensação",           desc: "Chocolate ao leite com morango e leite condensado.", price: 10.00, img: "assets/esfirra-prestigio.jpg", kind: "doce" },
  { id: "es-mm",             name: "M&M",                desc: "Chocolate ao leite com M&M.", price: 10.00, img: "assets/esfirra-chocolate.jpg", kind: "doce" }
];

/* Bebidas (preço por unidade).
   kind: "refrigerante" | "cerveja" | "suco". */
TOSCANA.bebidas = [
  /* ---- Refrigerantes ---- */
  { id: "beb-coca-2l",      name: "Coca-Cola 2 L",            desc: "Garrafa de 2 litros, bem gelada.", price: 15.00, kind: "refrigerante" },
  { id: "beb-coca-1l",      name: "Coca-Cola 1 L",            desc: "Garrafa de 1 litro, bem gelada.", price: 10.00, kind: "refrigerante" },
  { id: "beb-fanta-2l",     name: "Fanta Laranja 2 L",        desc: "Garrafa de 2 litros, bem gelada.", price: 12.00, kind: "refrigerante" },
  { id: "beb-guarana-2l",   name: "Guaraná 2 L",              desc: "Garrafa de 2 litros, bem gelada.", price: 12.00, kind: "refrigerante" },
  { id: "beb-sprite-2l",    name: "Sprite 2 L",               desc: "Garrafa de 2 litros, bem gelada.", price: 12.00, kind: "refrigerante" },
  /* ---- Latas (todas R$ 8,00) ---- */
  { id: "beb-coca-lata",    name: "Coca-Cola Lata",           desc: "Lata 350 ml, gelada.", price: 8.00, kind: "refrigerante" },
  { id: "beb-fanta-lata",   name: "Fanta Laranja Lata",       desc: "Lata 350 ml, gelada.", price: 8.00, kind: "refrigerante" },
  { id: "beb-guarana-lata", name: "Guaraná Lata",             desc: "Lata 350 ml, gelada.", price: 8.00, kind: "refrigerante" },
  { id: "beb-sprite-lata",  name: "Sprite Lata",              desc: "Lata 350 ml, gelada.", price: 8.00, kind: "refrigerante" },
  { id: "beb-schweppes-lata", name: "Schweppes Citrus Lata",  desc: "Lata 350 ml, gelada.", price: 8.00, kind: "refrigerante" },
  /* ---- Cervejas ---- */
  { id: "beb-heineken",     name: "Heineken Long Neck",       desc: "Long neck 330 ml, gelada.", price: 12.00, kind: "cerveja" },
  { id: "beb-skol-lata",     name: "Skol Lata",               desc: "Lata 350 ml, gelada.", price: 8.00, kind: "cerveja" },
  /* ---- Sucos ---- */
  { id: "beb-suco-laranja", name: "Suco de Laranja Natural 1 L", desc: "Suco natural de laranja, feito na hora.", price: 15.00, kind: "suco" }
];

/* Ids exibidos em "As mais pedidas" na pagina inicial. */
TOSCANA.featured = ["pz-calabresa", "pz-4queijos", "pz-chef", "es-carne"];
