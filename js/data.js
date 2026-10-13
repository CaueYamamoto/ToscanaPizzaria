/* ==========================================================================
   PIZZARIA TOSCANA — Dados do site (ARQUIVO EDITAVEL)
   --------------------------------------------------------------------------
   COMO EDITAR
   1. Telefone, endereco e horario: objeto CONFIG abaixo.
   2. Precos e descricoes: listas PIZZAS e ESFIRRAS.
   3. Fotos: troque o arquivo em assets/ mantendo o mesmo nome.
      As fotos atuais sao temporarias (Unsplash) — substitua pelas reais.
   4. Destaques da home: lista FEATURED (use os ids dos produtos).
   ========================================================================== */

var TOSCANA = TOSCANA || {};

TOSCANA.config = {
  name: "Pizzaria Toscana",
  tagline: "Forno a lenha · Massa artesanal",
  // WhatsApp: codigo do pais + DDD + numero, somente digitos.
  whatsapp: "5543988604583",
  phoneDisplay: "(43) 98860-4583",
  phoneHref: "tel:+5543988604583",
  address: "Av. Higienopolis, 1234 — Centro, Londrina/PR",
  hours: "Terca a domingo · 18h as 23h",
  mapsUrl: "https://maps.google.com/?q=Av.+Higienopolis,+1234,+Londrina+PR",
  mapsEmbed: "https://www.google.com/maps?q=Av.+Higienopolis+1234+Londrina+PR&output=embed",
  instagram: "https://instagram.com/"
};

/* Tamanhos de pizza. "mult" multiplica o preco base (M). */
TOSCANA.sizes = [
  { code: "M", label: "Media", detail: "6 fatias", mult: 1 },
  { code: "G", label: "Grande", detail: "8 fatias", mult: 1.35 },
  { code: "F", label: "Familia", detail: "12 fatias", mult: 1.7 }
];

/* Pizzas. Campos: id, name, desc, price (tamanho M), img, badge, kind. */
TOSCANA.pizzas = [
  { id: "pz-calabresa",  name: "Calabresa Toscana",    desc: "Calabresa artesanal, cebola roxa, azeitonas pretas e mucarela.", price: 49.90, img: "assets/pizza-calabresa.jpg",  badge: "Mais pedida", kind: "salgada" },
  { id: "pz-margherita", name: "Margherita",           desc: "Molho de tomate fresco, mucarela de bufala, manjericao e azeite.", price: 47.90, img: "assets/pizza-margherita.jpg", badge: "", kind: "salgada" },
  { id: "pz-portuguesa", name: "Portuguesa",           desc: "Presunto, ovos caipira, cebola, pimentao, azeitonas e mucarela.", price: 52.90, img: "assets/pizza-portuguesa.jpg", badge: "", kind: "salgada" },
  { id: "pz-4queijos",   name: "Quatro Queijos",       desc: "Mucarela, gorgonzola, parmesao e catupiry cremoso.", price: 56.90, img: "assets/pizza-4queijos.jpg",   badge: "Mais pedida", kind: "salgada" },
  { id: "pz-frango",     name: "Frango com Catupiry",  desc: "Frango desfiado temperado, catupiry original e milho verde.", price: 54.90, img: "assets/pizza-frango.jpg",     badge: "", kind: "salgada" },
  { id: "pz-pepperoni",  name: "Pepperoni",            desc: "Pepperoni crocante, mucarela e oregano fresco.", price: 58.90, img: "assets/pizza-pepperoni.jpg",  badge: "Edicao da casa", kind: "salgada" },
  { id: "pz-toscana",    name: "Toscana Especial",     desc: "Lombo, calabresa, bacon, cebola caramelizada e mucarela.", price: 62.90, img: "assets/pizza-toscana.jpg",    badge: "Edicao da casa", kind: "salgada" },
  { id: "pz-chocolate",  name: "Chocolate com Morango", desc: "Chocolate ao leite, morangos frescos e leite em po.", price: 49.90, img: "assets/pizza-chocolate.jpg",  badge: "", kind: "doce" }
];

/* Esfirras (preco por unidade). */
TOSCANA.esfirras = [
  { id: "es-carne",     name: "Carne",     desc: "Carne moida temperada com tomate, cebola e toque de limao.", price: 8.00,  img: "assets/esfirra-carne.jpg",     badge: "Mais pedida", kind: "salgada" },
  { id: "es-queijo",    name: "Queijo",    desc: "Mucarela gratinada com oregano.", price: 8.50,  img: "assets/esfirra-queijo.jpg",    badge: "", kind: "salgada" },
  { id: "es-frango",    name: "Frango",    desc: "Frango desfiado cremoso com catupiry.", price: 9.00,  img: "assets/esfirra-frango.jpg",    badge: "", kind: "salgada" },
  { id: "es-calabresa", name: "Calabresa", desc: "Calabresa moida, cebola e mucarela.", price: 9.00,  img: "assets/esfirra-calabresa.jpg", badge: "", kind: "salgada" },
  { id: "es-chocolate", name: "Chocolate", desc: "Chocolate ao leite cremoso.", price: 10.00, img: "assets/esfirra-chocolate.jpg", badge: "", kind: "doce" },
  { id: "es-prestigio", name: "Prestigio", desc: "Chocolate, coco ralado e leite condensado.", price: 11.00, img: "assets/esfirra-prestigio.jpg", badge: "Edicao da casa", kind: "doce" }
];

/* Ids exibidos em "As mais pedidas" na pagina inicial. */
TOSCANA.featured = ["pz-calabresa", "pz-4queijos", "pz-toscana", "es-carne"];
