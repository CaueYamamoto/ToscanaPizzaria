/* ==========================================================================
   PIZZARIA TOSCANA — Carrinho (store)
   --------------------------------------------------------------------------
   Camada de dados: sem DOM aqui. Persistencia em localStorage.
   Formato do item: { id, size, qty }  (size = "M"|"G"|"F" p/ pizza, "UN" p/ esfiha)
   ========================================================================== */
var TOSCANA = TOSCANA || {};

TOSCANA.store = (function () {
  "use strict";

  var KEY = "toscana_cart_v2";
  var memory = [];

  function storage() {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (e) { /* modo privado: usa memoria */ }
    return null;
  }

  function load() {
    var s = storage();
    if (!s) return memory.slice();
    try {
      var raw = s.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    var s = storage();
    if (!s) { memory = list.slice(); return; }
    try { s.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignora */ }
  }

  function allProducts() {
    return (TOSCANA.pizzas || []).concat(TOSCANA.esfirras || []);
  }

  function find(id) {
    var list = allProducts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function isPizza(id) {
    return (TOSCANA.pizzas || []).some(function (p) { return p.id === id; });
  }

  function sizeMult(code) {
    var sizes = TOSCANA.sizes || [];
    for (var i = 0; i < sizes.length; i++) {
      if (sizes[i].code === code) return sizes[i].mult;
    }
    return 1;
  }

  function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

  function unitPrice(item) {
    var p = find(item.id);
    if (!p) return 0;
    if (isPizza(item.id)) return round2(p.price * sizeMult(item.size || "M"));
    return round2(p.price);
  }

  function normalizeSize(id, size) {
    return isPizza(id) ? (size || "M") : "UN";
  }

  /* ---------------- API publica ---------------- */

  function items() { return load(); }

  function count() {
    return load().reduce(function (acc, it) { return acc + (it.qty || 0); }, 0);
  }

  function total() {
    return round2(load().reduce(function (acc, it) {
      return acc + unitPrice(it) * (it.qty || 0);
    }, 0));
  }

  function add(id, size) {
    var product = find(id);
    if (!product) return false;
    var cart = load();
    var s = normalizeSize(id, size);
    var line = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id && cart[i].size === s) { line = cart[i]; break; }
    }
    if (line) line.qty += 1;
    else cart.push({ id: id, size: s, qty: 1 });
    save(cart);
    return true;
  }

  function setQty(index, qty) {
    var cart = load();
    if (!cart[index]) return;
    cart[index].qty = Number(qty) || 0;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    save(cart);
  }

  function removeAt(index) {
    var cart = load();
    if (!cart[index]) return;
    cart.splice(index, 1);
    save(cart);
  }

  function clear() { save([]); }

  function lineLabel(item) {
    var p = find(item.id);
    if (!p) return item.id;
    if (isPizza(item.id)) return p.name + " (" + (item.size || "M") + ")";
    return "Esfirra de " + p.name;
  }

  function money(n) {
    try {
      return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    } catch (e) {
      return "R$ " + Number(n).toFixed(2).replace(".", ",");
    }
  }

  /* Monta o texto do pedido para o WhatsApp. */
  function buildMessage(customer) {
    var cart = load();
    var lines = cart.map(function (it) {
      var p = find(it.id);
      var name = p ? (isPizza(it.id) ? p.name : "Esfirra de " + p.name) : it.id;
      var size = isPizza(it.id) ? " (" + it.size + ")" : "";
      return it.qty + "x " + name + size + " — " + money(unitPrice(it) * it.qty);
    });
    var parts = [
      "NOVO PEDIDO — PIZZARIA TOSCANA",
      "--------------------------------",
      lines.join("\n"),
      "--------------------------------",
      "TOTAL: " + money(total()),
      "--------------------------------",
      "Nome: " + customer.name,
      "Endereco: " + customer.address,
      "Bairro: " + customer.district
    ];
    if (customer.notes) parts.push("Obs: " + customer.notes);
    return parts.join("\n");
  }

  function checkoutUrl(customer) {
    var text = buildMessage(customer);
    return "https://wa.me/" + TOSCANA.config.whatsapp + "?text=" + encodeURIComponent(text);
  }

  return {
    items: items,
    count: count,
    total: total,
    add: add,
    setQty: setQty,
    removeAt: removeAt,
    clear: clear,
    find: find,
    isPizza: isPizza,
    unitPrice: unitPrice,
    lineLabel: lineLabel,
    money: money,
    buildMessage: buildMessage,
    checkoutUrl: checkoutUrl
  };
})();
