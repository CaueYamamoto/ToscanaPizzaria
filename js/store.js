/* ==========================================================================
   PIZZARIA TOSCANA — Carrinho (store)
   --------------------------------------------------------------------------
   Camada de dados: sem DOM aqui. Persistencia em localStorage.
   Item: { id, halfId?, size, qty, notes? } (size P|M|G p/ pizza, UN p/ esfiha)
   ========================================================================== */
var TOSCANA = TOSCANA || {};

TOSCANA.store = (function () {
  "use strict";

  var KEY = "toscana_cart_v4";
  var OLD_KEYS = ["toscana_cart_v3", "toscana_cart_v2"];
  var PROFILE_KEY = "toscana_profile_v1";
  var LAST_KEY = "toscana_last_order_v1";
  var memory = [];
  var memoryProfile = null;

  function storage() {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (e) { /* modo privado: usa memoria */ }
    return null;
  }

  function migrate() {
    var s = storage();
    if (!s) return;
    try {
      if (!s.getItem(KEY)) {
        for (var i = 0; i < OLD_KEYS.length; i++) {
          var raw = s.getItem(OLD_KEYS[i]);
          if (raw) { s.setItem(KEY, raw); break; }
        }
      }
    } catch (e) { /* ignora */ }
  }

  function load() {
    migrate();
    var s = storage();
    if (!s) return memory.slice();
    try {
      var raw = s.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      // Sanitiza: remove itens de produtos que não existem mais ou pausados
      return list.filter(function (it) {
        return it && find(it.id) && !find(it.id).paused && (it.qty || 0) > 0;
      });
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

  function activeProducts(list) {
    return (list || []).filter(function (p) { return p && !p.paused; });
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

  function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

  function basePrice(p, size) {
    if (isPizza(p.id)) {
      var table = (TOSCANA.pizzaPrices || {})[p.kind] || {};
      var code = size || "P";
      if (table[code] != null) return round2(table[code]);
    }
    return round2(p.price);
  }

  function unitPrice(item) {
    var p = find(item.id);
    if (!p) return 0;
    if (isPizza(item.id)) {
      var a = basePrice(p, item.size);
      if (item.halfId) {
        var q = find(item.halfId);
        var b = q ? basePrice(q, item.size) : a;
        var fee = (TOSCANA.config && Number(TOSCANA.config.halfFee)) || 0;
        return round2(Math.max(a, b) + fee);
      }
      return a;
    }
    return round2(p.price);
  }

  function normalizeSize(id, size) {
    return isPizza(id) ? (size || "P") : "UN";
  }

  /* ---------------- API publica ---------------- */

  function items() { return load(); }

  function count() {
    return load().reduce(function (acc, it) { return acc + (it.qty || 0); }, 0);
  }

  function subtotal() {
    return round2(load().reduce(function (acc, it) {
      return acc + unitPrice(it) * (it.qty || 0);
    }, 0));
  }

  function feeFor(district) {
    var fees = TOSCANA.fees || { defaultFee: 0, districts: [] };
    var list = fees.districts || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === district) return Number(list[i].fee) || 0;
    }
    return Number(fees.defaultFee) || 0;
  }

  function total(district) {
    var sub = subtotal();
    if (!district) return sub;
    return round2(sub + feeFor(district));
  }

  function add(id, size, opts) {
    var product = find(id);
    if (!product || product.paused) return false;
    opts = opts || {};
    var cart = load();
    var s = normalizeSize(id, size);
    var halfId = (opts.halfId && find(opts.halfId) && opts.halfId !== id) ? opts.halfId : null;
    // Meia-a-meio só vale para pizza; esfiha ignora halfId
    if (!isPizza(id)) halfId = null;
    var notes = (opts.notes || "").toString().slice(0, 80);
    var line = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id && cart[i].size === s &&
          (cart[i].halfId || null) === halfId &&
          (cart[i].notes || "") === notes) { line = cart[i]; break; }
    }
    if (line) line.qty += 1;
    else {
      var it = { id: id, size: s, qty: 1 };
      if (halfId) it.halfId = halfId;
      if (notes) it.notes = notes;
      cart.push(it);
    }
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
    if (!cart[index]) return null;
    var removed = cart.splice(index, 1)[0];
    save(cart);
    return removed;
  }

  function restoreAt(index, item) {
    var cart = load();
    cart.splice(Math.min(index, cart.length), 0, item);
    save(cart);
  }

  function clear() { save([]); }

  function lineLabel(item) {
    var p = find(item.id);
    if (!p) return item.id;
    if (isPizza(item.id)) {
      var second = item.halfId ? find(item.halfId) : null;
      var name = second ? (p.name + " / " + second.name) : p.name;
      return name + " (" + (item.size || "P") + ")";
    }
    return "Esfirra de " + p.name;
  }

  function money(n) {
    try {
      return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    } catch (e) {
      return "R$ " + Number(n).toFixed(2).replace(".", ",");
    }
  }

  /* ---------- perfil (pré-preenchimento, sem backend) ---------- */
  function loadProfile() {
    if (memoryProfile) return memoryProfile;
    var s = storage();
    if (!s) return {};
    try { return JSON.parse(s.getItem(PROFILE_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }

  function saveProfile(p) {
    memoryProfile = p;
    var s = storage();
    if (!s) return;
    try { s.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function saveLast(order) {
    var s = storage();
    try { if (s) s.setItem(LAST_KEY, JSON.stringify(order)); } catch (e) {}
  }

  function loadLast() {
    var s = storage();
    if (!s) return null;
    try { return JSON.parse(s.getItem(LAST_KEY) || "null"); }
    catch (e) { return null; }
  }

  function reorderLast() {
    var last = loadLast();
    if (!last || !last.items || !last.items.length) return false;
    var ok = last.items.filter(function (it) { return find(it.id) && !find(it.id).paused; });
    if (!ok.length) return false;
    save(ok);
    return true;
  }

  /* ---------- aberto / fechado ---------- */
  function isOpenNow(now) {
    try {
      var cfg = TOSCANA.config || {};
      var days = cfg.openDays || [0, 2, 3, 4, 5, 6];
      var d = now || new Date();
      if (days.indexOf(d.getDay()) === -1) return false;
      var hm = function (s) {
        var parts = String(s || "18:00").split(":");
        return (parseInt(parts[0], 10) * 60) + parseInt(parts[1] || "0", 10);
      };
      var cur = d.getHours() * 60 + d.getMinutes();
      return cur >= hm(cfg.openFrom) && cur <= hm(cfg.openTo);
    } catch (e) { return true; }
  }

  /* Monta o texto do pedido para o WhatsApp. */
  function buildMessage(customer) {
    var cart = load();
    var lines = cart.map(function (it) {
      var extra = it.notes ? " (" + it.notes + ")" : "";
      return it.qty + "x " + lineLabel(it) + extra + " — " + money(unitPrice(it) * it.qty);
    });
    var fee = customer.district ? feeFor(customer.district) : 0;
    var parts = [
      "NOVO PEDIDO — PIZZARIA TOSCANA",
      "--------------------------------",
      lines.join("\n"),
      "--------------------------------",
      "Subtotal: " + money(subtotal()),
      "Entrega (" + (customer.district || "a combinar") + "): " + money(fee),
      "TOTAL: " + money(round2(subtotal() + fee)),
      "--------------------------------",
      "Nome: " + customer.name,
      "Tel: " + (customer.phone || "-"),
      "Endereço: " + customer.address,
      "Bairro: " + customer.district
    ];
    if (customer.payment) parts.push("Pagamento: " + customer.payment + (customer.changeFor ? " (troco p/ " + customer.changeFor + ")" : ""));
    if (customer.notes) parts.push("Observações: " + customer.notes);
    if (customer.orderId) parts.push("Pedido: " + customer.orderId);
    return parts.join("\n");
  }

  function checkoutUrl(customer) {
    var text = buildMessage(customer);
    return "https://wa.me/" + TOSCANA.config.whatsapp + "?text=" + encodeURIComponent(text);
  }

  return {
    items: items,
    count: count,
    subtotal: subtotal,
    feeFor: feeFor,
    total: total,
    add: add,
    setQty: setQty,
    removeAt: removeAt,
    restoreAt: restoreAt,
    clear: clear,
    find: find,
    activeProducts: activeProducts,
    isPizza: isPizza,
    unitPrice: unitPrice,
    basePrice: basePrice,
    lineLabel: lineLabel,
    money: money,
    loadProfile: loadProfile,
    saveProfile: saveProfile,
    saveLast: saveLast,
    loadLast: loadLast,
    reorderLast: reorderLast,
    isOpenNow: isOpenNow,
    buildMessage: buildMessage,
    checkoutUrl: checkoutUrl
  };
})();
