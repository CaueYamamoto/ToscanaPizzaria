(function () {
  "use strict";

  var store = TOSCANA.store;
  var cfg = TOSCANA.config;

  var I = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h15l-1.5 12.5a1 1 0 0 1-1 .5H8.5a1 1 0 0 1-1-.5L6 8Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>'
  };

  var CATEGORY_LABEL = {
    tradicional: "Tradicional",
    especial: "Especial",
    doce: "Doce",
    salgada: "Salgada"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var toastTimer = null, undoTimer = null, lastRemoved = null;
  var scrollLocks = 0;
  function lockScroll() {
    scrollLocks++;
    document.body.style.overflow = "hidden";
  }
  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (!scrollLocks) document.body.style.overflow = "";
  }
  function forceUnlockScroll() {
    scrollLocks = 0;
    document.body.style.overflow = "";
  }
  function debounce(fn, wait) {
    var t = null;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
    };
  }
  function toast(msg, withUndo) {
    var el = $("#toast");
    if (!el) return;
    el.innerHTML = "";
    el.appendChild(document.createTextNode(msg));
    if (withUndo) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "Desfazer";
      b.className = "toast-undo";
      b.addEventListener("click", function () {
        if (lastRemoved) {
          store.restoreAt(lastRemoved.index, lastRemoved.item);
          lastRemoved = null;
          renderCart();
          renderStickyBar();
        }
        el.classList.remove("is-visible");
      });
      el.appendChild(b);
    }
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, withUndo ? 5000 : 2600);
  }

 
  function hydrate() {
    $all("[data-bind='phone']").forEach(function (el) { el.textContent = cfg.phoneDisplay; });
    $all("[data-bind='address']").forEach(function (el) { el.textContent = cfg.address; });
    $all("[data-bind='hours']").forEach(function (el) { el.textContent = cfg.hours; });
    $all("a[data-bind='phone-href']").forEach(function (el) { el.href = cfg.phoneHref; });
    $all("a[data-bind='ig']").forEach(function (el) {
      el.href = cfg.instagram || "https://instagram.com/";
      el.target = "_blank";
      el.rel = "noopener";
    });
    $all("[data-bind='ig-handle']").forEach(function (el) { el.textContent = cfg.instagramHandle || "@toscana.cambe"; });
    $all("a[data-bind='wa']").forEach(function (el) {
      el.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent("Olá, Pizzaria Toscana! Quero fazer um pedido.");
      el.target = "_blank";
      el.rel = "noopener";
    });
    $all("a[data-bind='reviews']").forEach(function (el) {
      el.href = cfg.reviewsUrl || "https://www.google.com/maps";
      el.target = "_blank";
      el.rel = "noopener";
    });
    var map = $("#mapEmbed");
    if (map && !map.src) map.src = cfg.mapsEmbed;
    var route = $("#btnRotas");
    if (route) { route.href = cfg.mapsUrl; route.target = "_blank"; route.rel = "noopener"; }
    var year = $("#ano");
    if (year) year.textContent = new Date().getFullYear();
    var opener = $("#mobileOpen");
    if (opener) { opener.setAttribute("aria-expanded", "false"); opener.setAttribute("aria-controls", "mobileNav"); }
    renderOpenBadge();
    fillDistrictOptions();
    fillProfile();
    renderReorderBtn();
  }

  function renderOpenBadge() {
    var open = store.isOpenNow();
    $all("[data-open-badge]").forEach(function (el) {
      el.textContent = open ? "Aberto agora · até 23h30" : "Fechado · abre 18h (ter–dom)";
      el.classList.toggle("is-closed", !open);
      el.classList.toggle("is-open", open);
    });
    var co = $("#btnCheckout");
    if (co && !open) co.setAttribute("title", "Estamos fechados agora — você pode montar o pedido e chamar no WhatsApp mesmo assim.");
  }

  /* ---------------- preços / cards ---------------- */
  function priceFor(product, sizeCode) {
    if (store.isPizza(product.id)) return store.basePrice(product, sizeCode);
    return product.price;
  }

  function priceListHTML(product) {
    if (!store.isPizza(product.id)) return "";
    var parts = (TOSCANA.sizes || []).map(function (s) {
      return s.code + " " + store.money(priceFor(product, s.code));
    });
    return '<p class="price-list">' + esc(parts.join(" · ")) + "</p>";
  }

  function cardHTML(product, type) {
    var isPizza = type === "pizza";
    var pills = isPizza
      ? '<div class="size-row" role="group" aria-label="Tamanho da pizza ' + esc(product.name) + '" data-size-group="' + esc(product.id) + '">' +
        (TOSCANA.sizes || []).map(function (s, i) {
          var full = s.label + " · " + s.detail + " · " + store.money(priceFor(product, s.code));
          return '<button type="button" class="size-pill' + (i === 0 ? " is-active" : "") + '"' +
            ' data-size="' + esc(s.code) + '" aria-pressed="' + (i === 0 ? "true" : "false") + '"' +
            ' aria-label="' + esc(full) + '"' +
            ' title="' + esc(full) + '">' + esc(s.code + " · " + s.detail) + "</button>";
        }).join("") + "</div>"
      : "";
    var hint = isPizza ? "a partir de" : "unidade";
    var halfBtn = isPizza
      ? '<button type="button" class="link-half" data-half="' + esc(product.id) + '">½ meia-a-meia</button>'
      : "";
    var catLabel = CATEGORY_LABEL[product.kind] || "";
    return (
      '<article class="product-card" data-kind="' + esc(product.kind || "") + '" data-name="' + esc((product.name + " " + product.desc).toLowerCase()) + '">' +
        '<div class="product-body">' +
          '<div class="pc-head">' +
            "<h3>" + esc(product.name) + "</h3>" +
            (catLabel ? '<span class="cat-tag">' + esc(catLabel) + "</span>" : "") +
          "</div>" +
          '<p class="product-desc">' + esc(product.desc) + "</p>" +
          priceListHTML(product) +
          pills + halfBtn +
          '<div class="product-foot">' +
            '<span class="product-price" data-price data-base="' + priceFor(product, "P") + '" data-id="' + esc(product.id) + '">' +
              store.money(priceFor(product, "P")) + "<small>" + hint + "</small>" +
            "</span>" +
            '<button type="button" class="add-btn" data-add="' + esc(product.id) + '" data-type="' + type + '" aria-label="Adicionar ' + esc(product.name) + ' ao pedido">' + I.plus + "Adicionar</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function productById(id) { return store.find(id); }

  function renderMenus() {
    $all("[data-menu]").forEach(function (box) {
      var kind = box.getAttribute("data-menu");
      var limit = parseInt(box.getAttribute("data-limit") || "0", 10);
      var list = [];
      if (kind === "pizzas") list = store.activeProducts(TOSCANA.pizzas);
      else if (kind === "esfirras") list = store.activeProducts(TOSCANA.esfirras);
      else if (kind === "featured") {
        list = (TOSCANA.featured || []).map(productById).filter(function (p) { return p && !p.paused; });
      }
      if (limit > 0) list = list.slice(0, limit);
      var typeOf = function (p) {
        return (TOSCANA.pizzas || []).indexOf(p) !== -1 ? "pizza" : "esfirra";
      };
      box.innerHTML = list.length
        ? list.map(function (p) { return cardHTML(p, typeOf(p)); }).join("")
        : '<p class="menu-empty">Nenhum sabor disponível no momento.</p>';
      applySearchFilter(box);
    });
    updateCounts();
  }

  /* ---------------- busca + filtros ---------------- */
  function currentSearch(box) {
    var wrap = box.closest(".menu-block") || document;
    var input = wrap.querySelector("[data-search]") || document.querySelector("[data-search='" + box.id + "']");
    // fallback: procura input irmão anterior
    if (!input) {
      var section = box.closest("section") || box.closest(".container");
      input = section ? section.querySelector("[data-search]") : document.querySelector("[data-search]");
    }
    return input ? input.value.trim().toLowerCase() : "";
  }

  function applySearchFilter(box) {
    var q = currentSearch(box);
    var bar = document.querySelector("[data-filters='" + box.id + "']");
    var f = bar ? ($(".filter-btn.is-active", bar) || {}).getAttribute?.("data-filter") || "all" : "all";
    var n = 0;
    $all(".product-card", box).forEach(function (card) {
      var okKind = (f === "all" || card.getAttribute("data-kind") === f);
      var okQ = (!q || (card.getAttribute("data-name") || "").indexOf(q) !== -1);
      var show = okKind && okQ;
      card.style.display = show ? "" : "none";
      if (show) n++;
    });
    var count = document.querySelector("[data-count='" + box.id + "']");
    if (count) count.textContent = n + (n === 1 ? " sabor" : " sabores");
    var empty = box.parentElement ? box.parentElement.querySelector("[data-search-empty]") : null;
    if (empty) empty.style.display = n ? "none" : "";
  }

  function updateCounts() {
    $all("[data-menu]").forEach(applySearchFilter);
  }

  /* ---------------- meia-a-meia ---------------- */
  var halfState = { baseId: null, size: "P" };

  function openHalf(baseId, size) {
    halfState.baseId = baseId;
    halfState.size = size || "P";
    var modal = $("#halfModal");
    if (!modal) return;
    var base = store.find(baseId);
    $("#halfTitle").textContent = base ? ("Meia-a-meia: " + base.name + " (" + halfState.size + ")") : "Montar meia-a-meia";
    var fee = Number((TOSCANA.config || {}).halfFee) || 0;
    $("#halfFee").textContent = fee ? ("Preço da maior metade + " + store.money(fee) + " de montagem") : "Vale o preço da metade mais cara";
    var opts = store.activeProducts(TOSCANA.pizzas).filter(function (p) { return p.id !== baseId; });
    $("#halfOptions").innerHTML = opts.map(function (p) {
      var price = store.basePrice(p, halfState.size);
      return '<label class="half-opt"><input type="radio" name="half" value="' + esc(p.id) + '"><span><strong>' + esc(p.name) + "</strong><small>" + esc(p.desc) + " — " + store.money(price) + "</small></span></label>";
    }).join("");
    var notes = $("#halfNotes");
    if (notes) notes.value = "";
    modal.classList.add("is-open");
    $("#cartScrim").classList.add("is-visible");
    lockScroll();
  }

  function closeHalf() {
    var modal = $("#halfModal");
    if (modal && modal.classList.contains("is-open")) {
      modal.classList.remove("is-open");
      unlockScroll();
    }
    var sc = $("#cartScrim");
    if (sc && !($("#cartDrawer") || {}).classList?.contains("is-open") && !($("#checkoutModal") || {}).classList?.contains("is-open") && !($("#mobileNav") || {}).classList?.contains("is-open")) sc.classList.remove("is-visible");
  }

  function confirmHalf() {
    var sel = $("#halfOptions input:checked");
    if (!sel) {
      toast("Escolha a segunda metade.");
      var first = $("#halfOptions input");
      if (first) first.focus();
      return;
    }
    var notesEl = $("#halfNotes");
    var notes = notesEl ? notesEl.value.trim().slice(0, 80) : "";
    if (store.add(halfState.baseId, halfState.size, { halfId: sel.value, notes: notes })) {
      toast("Meia-a-meia adicionada.");
      closeHalf();
      renderCart();
      renderStickyBar();
    }
  }

  /* ---------------- carrinho ---------------- */
  function districtOfCheckout() {
    var sel = document.getElementById("fDistrict");
    return sel ? sel.value : "";
  }

  function renderCart() {
    var items = store.items();
    var totalQty = store.count();

    $all("[data-cart-count]").forEach(function (el) {
      el.textContent = totalQty;
      el.style.display = totalQty ? "grid" : "none";
    });

    var box = $("#cartItems");
    if (!box) return;

    if (!items.length) {
      box.innerHTML =
        '<div class="cart-empty">' + I.bag +
        "<p><strong>Seu carrinho está vazio.</strong><br>Que tal começar por uma das mais pedidas?</p>" +
        '<a class="btn btn--wine btn--sm" href="/pizzas">Ver cardápio</a></div>';
    } else {
      box.innerHTML = items.map(function (it, idx) {
        var p = store.find(it.id);
        if (!p) return "";
        var unit = store.unitPrice(it);
        var meta = store.isPizza(it.id)
          ? "Pizza " + esc(store.lineLabel(it)) + " — " + store.money(unit) + (it.notes ? "<br>Obs: " + esc(it.notes) : "")
          : "Esfirra · unidade — " + store.money(unit);
        return (
          '<div class="cart-item">' +
            "<div><h4>" + esc(p.name) + (it.halfId && store.find(it.halfId) ? " / " + esc(store.find(it.halfId).name) : "") + "</h4>" +
              '<p class="meta">' + meta + "</p>" +
              '<div class="qty">' +
                '<button type="button" data-dec="' + idx + '" aria-label="Diminuir quantidade">' + I.minus + "</button>" +
                "<strong>" + it.qty + "</strong>" +
                '<button type="button" data-inc="' + idx + '" aria-label="Aumentar quantidade">' + I.plus + "</button>" +
              "</div>" +
              '<button type="button" class="link-danger" data-del="' + idx + '">remover</button>' +
            "</div>" +
            '<span class="line-total">' + store.money(unit * it.qty) + "</span>" +
          "</div>"
        );
      }).join("");
    }

    var sub = store.subtotal();
    var totalEl = $("#cartTotal");
    if (totalEl) totalEl.textContent = store.money(sub);
    var checkoutBtn = $("#btnCheckout");
    if (checkoutBtn) checkoutBtn.disabled = !items.length;
    renderStickyBar();
  }

  function renderStickyBar() {
    var bar = $("#stickyBar");
    if (!bar) return;
    var n = store.count();
    document.body.classList.toggle("has-items", n > 0);
    if (!n) { bar.classList.remove("is-visible"); return; }
    bar.classList.add("is-visible");
    $("#stickyTotal").textContent = store.money(store.subtotal());
    $("#stickyCount").textContent = n + (n === 1 ? " item" : " itens");
  }

  function renderReorderBtn() {
    var btn = $("#btnReorder");
    if (!btn) return;
    var last = store.loadLast();
    btn.style.display = (last && last.items && last.items.length) ? "" : "none";
  }

  function openCart() {
    renderCart();
    $("#cartDrawer").classList.add("is-open");
    $("#cartScrim").classList.add("is-visible");
    lockScroll();
    document.body.classList.add("cart-open");
    var close = $("[data-close-cart]");
    if (close) close.focus();
  }

  function closeCart() {
    var d = $("#cartDrawer");
    if (d && d.classList.contains("is-open")) {
      d.classList.remove("is-open");
      unlockScroll();
    }
    var s = $("#cartScrim");
    if (s && !($("#mobileNav") || {}).classList?.contains("is-open")) s.classList.remove("is-visible");
    document.body.classList.remove("cart-open");
  }

  /* ---------------- checkout ---------------- */
  function fillDistrictOptions() {
    var sel = document.getElementById("fDistrict");
    if (!sel || sel.options.length > 1) return;
    var fees = TOSCANA.fees || { districts: [] };
    sel.innerHTML = '<option value="">Selecione o bairro…</option>' + (fees.districts || []).map(function (d) {
      return '<option value="' + esc(d.name) + '">' + esc(d.name) + " — entrega " + store.money(d.fee) + "</option>";
    }).join("");
  }

  function fillProfile() {
    var p = store.loadProfile() || {};
    var set = function (id, v) { var el = document.getElementById(id); if (el && v) el.value = v; };
    set("fName", p.name); set("fPhone", p.phone);
    set("fAddress", p.address); set("fDistrict", p.district);
    set("fPayment", p.payment); set("fChange", p.changeFor); set("fNotes", p.notes);
    updateFeePreview();
  }

  function updateFeePreview() {
    var prev = $("#feePreview");
    if (!prev) return;
    var d = districtOfCheckout();
    if (!d) { prev.textContent = ""; return; }
    var list = (TOSCANA.fees.districts || []);
    var found = list.filter(function (x) { return x.name === d; })[0];
    var fee = store.feeFor(d);
    var sub = store.subtotal();
    prev.textContent = "Entrega " + store.money(fee) + (found && found.eta ? " · " + found.eta : "") + " · Total " + store.money(sub + fee);
  }

  function openCheckout() {
    if (!store.items().length) { toast("Adicione um item antes de finalizar."); return; }
    closeCart();
    refreshResume();
    $("#checkoutModal").classList.add("is-open");
    $("#cartScrim").classList.add("is-visible");
    lockScroll();
    document.body.classList.add("cart-open");
  }

  function refreshResume() {
    var lines = store.items().map(function (it) {
      var extra = it.notes ? " (" + it.notes + ")" : "";
      return it.qty + "x " + store.lineLabel(it) + extra + " — " + store.money(store.unitPrice(it) * it.qty);
    });
    var d = districtOfCheckout();
    var fee = d ? store.feeFor(d) : 0;
    var sub = store.subtotal();
    var txt = lines.join("\n") + "\n\nSubtotal: " + store.money(sub) +
      (d ? "\nEntrega (" + d + "): " + store.money(fee) + "\nTOTAL: " + store.money(sub + fee) : "\nTOTAL: " + store.money(sub) + " (+ entrega)");
    var r = $("#orderResume");
    if (r) r.textContent = txt;
    var t = $("#checkoutTotal");
    if (t) t.textContent = store.money(sub + fee);
  }

  function closeCheckout() {
    var m = $("#checkoutModal");
    if (m && m.classList.contains("is-open")) {
      m.classList.remove("is-open");
      unlockScroll();
    }
    var sc = $("#cartScrim");
    if (sc && !($("#cartDrawer") || {}).classList?.contains("is-open") && !($("#mobileNav") || {}).classList?.contains("is-open")) sc.classList.remove("is-visible");
    document.body.classList.remove("cart-open");
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function requireField(id, test) {
    var input = document.getElementById(id);
    if (!input) return true;
    var err = document.getElementById(id + "-err");
    var v = fieldValue(id);
    var ok = test ? test(v) : v.length > 0;
    // bairro é select: exige seleção
    if (input.tagName === "SELECT") ok = v.length > 0;
    input.classList.toggle("is-invalid", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    if (err) err.classList.toggle("is-visible", !ok);
    return ok;
  }

  function maskPhone(v) {
    var d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
  }

  function submitCheckout(ev) {
    ev.preventDefault();
    var ok = true;
    ok = requireField("fName") && ok;
    ok = requireField("fPhone", function (v) { return v.replace(/\D/g, "").length >= 10; }) && ok;
    ok = requireField("fAddress") && ok;
    ok = requireField("fDistrict") && ok;
    var pay = fieldValue("fPayment");
    if (document.getElementById("fPayment")) ok = requireField("fPayment") && ok;
    if (pay === "Dinheiro") {
      // troco opcional, mas se preenchido precisa ser válido
      var ch = fieldValue("fChange");
      if (ch && !/^(\d+([.,]\d{1,2})?)$/.test(ch.replace("R$", "").trim())) {
        toast("Troco inválido. Ex: 100 ou 50,00.");
        return;
      }
    }
    if (!ok) {
      toast("Preencha nome, telefone, endereço, bairro e pagamento.");
      var firstBad = document.querySelector("#checkoutForm .is-invalid");
      if (firstBad) {
        firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
        if (firstBad.focus) firstBad.focus({ preventScroll: true });
      }
      return;
    }

    var customer = {
      name: fieldValue("fName"),
      phone: fieldValue("fPhone"),
      address: fieldValue("fAddress"),
      district: fieldValue("fDistrict"),
      payment: pay || "",
      changeFor: fieldValue("fChange"),
      notes: fieldValue("fNotes"),
      orderId: "T-" + Date.now().toString().slice(-6)
    };
    store.saveProfile({ name: customer.name, phone: customer.phone, address: customer.address, district: customer.district, payment: customer.payment, changeFor: customer.changeFor, notes: customer.notes });
    store.saveLast({ items: store.items(), customer: { name: customer.name, district: customer.district }, at: Date.now() });
    window.open(store.checkoutUrl(customer), "_blank", "noopener");
    showSuccess(customer);
  }

  function showSuccess(customer) {
    closeCheckout();
    store.clear();
    renderCart();
    renderReorderBtn();
    var m = $("#successModal");
    if (!m) { toast("Abrindo o WhatsApp com seu pedido..."); return; }
    var d = customer.district;
    var fee = d ? store.feeFor(d) : 0;
    $("#successText").textContent = "Pedido " + customer.orderId + " pronto para enviar no WhatsApp. " + customer.name + ", entrega em " + (customer.address + " — " + d) + " (" + store.money(fee) + ").";
    m.classList.add("is-open");
    $("#cartScrim").classList.add("is-visible");
    lockScroll();
    toast("Abrindo o WhatsApp com seu pedido...");
  }

  /* ---------------- eventos ---------------- */
  function bind() {
    document.addEventListener("click", function (ev) {
      var t = ev.target;

      var pill = t.closest ? t.closest(".size-pill") : null;
      if (pill) {
        var group = pill.closest("[data-size-group]");
        $all(".size-pill", group).forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        pill.classList.add("is-active");
        pill.setAttribute("aria-pressed", "true");
        var card = pill.closest(".product-card");
        var priceEl = card ? $(".product-price", card) : null;
        if (priceEl) {
          var base = parseFloat(priceEl.getAttribute("data-base"));
          var sizeId = priceEl.getAttribute("data-id");
          var prod = productById(sizeId);
          if (prod) {
            var code = pill.getAttribute("data-size");
            var detail = (TOSCANA.sizes || []).filter(function (s) { return s.code === code; })[0] || {};
            priceEl.innerHTML = store.money(priceFor(prod, code)) + "<small>tamanho " + esc(code) + (detail.detail ? " · " + esc(detail.detail) : "") + "</small>";
          }
        }
        return;
      }

      var half = t.closest ? t.closest("[data-half]") : null;
      if (half) {
        var cardEl2 = half.closest(".product-card");
        var active = cardEl2 ? $(".size-pill.is-active", cardEl2) : null;
        openHalf(half.getAttribute("data-half"), active ? active.getAttribute("data-size") : "P");
        return;
      }

      var add = t.closest ? t.closest("[data-add]") : null;
      if (add) {
        var id = add.getAttribute("data-add");
        var cardEl = add.closest(".product-card");
        var act = cardEl ? $(".size-pill.is-active", cardEl) : null;
        var size = act ? act.getAttribute("data-size") : "P";
        var prod = productById(id);
        if (store.add(id, size)) {
          toast(prod && store.isPizza(id) ? ("Adicionado: " + prod.name + " (" + size + ").") : "Adicionado ao pedido.");
        }
        renderCart();
        return;
      }

      var inc = t.closest ? t.closest("[data-inc]") : null;
      if (inc) {
        var i1 = parseInt(inc.getAttribute("data-inc"), 10);
        var cur1 = store.items()[i1];
        if (cur1) store.setQty(i1, cur1.qty + 1);
        renderCart();
        return;
      }
      var dec = t.closest ? t.closest("[data-dec]") : null;
      if (dec) {
        var i2 = parseInt(dec.getAttribute("data-dec"), 10);
        var cur2 = store.items()[i2];
        if (cur2) store.setQty(i2, cur2.qty - 1);
        renderCart();
        return;
      }
      var del = t.closest ? t.closest("[data-del]") : null;
      if (del) {
        var idx = parseInt(del.getAttribute("data-del"), 10);
        var removed = store.removeAt(idx);
        if (removed) {
          lastRemoved = { index: idx, item: removed };
          toast("Item removido.", true);
          clearTimeout(undoTimer);
          undoTimer = setTimeout(function () { lastRemoved = null; }, 5000);
        }
        renderCart();
        return;
      }

      if (t.closest && t.closest("[data-open-cart]")) { openCart(); return; }
      if (t.closest && t.closest("[data-close-cart]")) { closeCart(); return; }
      if (t.closest && t.closest("[data-open-checkout]")) { openCheckout(); return; }
      if (t.closest && t.closest("[data-close-checkout]")) { closeCheckout(); return; }
      if (t.closest && t.closest("[data-close-half]")) { closeHalf(); return; }
      if (t.closest && t.closest("[data-confirm-half]")) { confirmHalf(); return; }
      if (t.closest && t.closest("[data-close-success]")) {
        var m = $("#successModal");
        if (m && m.classList.contains("is-open")) {
          m.classList.remove("is-open");
          unlockScroll();
        }
        var sc2 = $("#cartScrim");
        if (sc2 && !($("#cartDrawer") || {}).classList?.contains("is-open") && !($("#mobileNav") || {}).classList?.contains("is-open")) sc2.classList.remove("is-visible");
        document.body.classList.remove("cart-open");
        return;
      }
      if (t.closest && t.closest("#mobileOpen")) {
        var nav = $("#mobileNav");
        nav.classList.add("is-open");
        $("#cartScrim").classList.add("is-visible");
        lockScroll();
        var opener = $("#mobileOpen");
        if (opener) opener.setAttribute("aria-expanded", "true");
        var firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
        return;
      }
      if (t.closest && (t.closest("#mobileClose") || (t.closest("#mobileNav") && t.closest("a")))) {
        var nav2 = $("#mobileNav");
        if (nav2 && nav2.classList.contains("is-open")) {
          nav2.classList.remove("is-open");
          unlockScroll();
        }
        var drawer = $("#cartDrawer");
        if (!drawer || !drawer.classList.contains("is-open")) $("#cartScrim").classList.remove("is-visible");
        var opener2 = $("#mobileOpen");
        if (opener2) { opener2.setAttribute("aria-expanded", "false"); opener2.focus(); }
        return;
      }
      if (t.closest && t.closest("#btnReorder")) {
        if (store.reorderLast()) { renderCart(); openCart(); toast("Último pedido recuperado."); }
        else toast("Nenhum pedido anterior encontrado.");
        return;
      }
    });

    var scrim = $("#cartScrim");
    if (scrim) scrim.addEventListener("click", function () {
      var had = false;
      var dw = $("#cartDrawer");
      if (dw && dw.classList.contains("is-open")) { dw.classList.remove("is-open"); unlockScroll(); had = true; }
      var co = $("#checkoutModal");
      if (co && co.classList.contains("is-open")) { co.classList.remove("is-open"); unlockScroll(); had = true; }
      var ha = $("#halfModal");
      if (ha && ha.classList.contains("is-open")) { ha.classList.remove("is-open"); unlockScroll(); had = true; }
      var su = $("#successModal");
      if (su && su.classList.contains("is-open")) { su.classList.remove("is-open"); unlockScroll(); had = true; }
      var mn = $("#mobileNav");
      if (mn && mn.classList.contains("is-open")) {
        mn.classList.remove("is-open");
        unlockScroll();
        var opener = $("#mobileOpen");
        if (opener) opener.setAttribute("aria-expanded", "false");
        had = true;
      }
      document.body.classList.remove("cart-open");
      if (!had) forceUnlockScroll();
      scrim.classList.remove("is-visible");
    });

    var form = $("#checkoutForm");
    if (form) {
      form.addEventListener("submit", submitCheckout);
      ["fName", "fPhone", "fAddress", "fDistrict", "fPayment", "fChange"].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", function () {
          el.classList.remove("is-invalid");
          var err = document.getElementById(id + "-err");
          if (err) err.classList.remove("is-visible");
          if (id === "fDistrict") { updateFeePreview(); refreshResume(); }
          if (id === "fPayment") {
            var ch = document.getElementById("fChangeWrap");
            if (ch) ch.style.display = (el.value === "Dinheiro") ? "" : "none";
          }
        });
        el.addEventListener("change", function () {
          if (id === "fDistrict") { updateFeePreview(); refreshResume(); }
          if (id === "fPayment") {
            var ch2 = document.getElementById("fChangeWrap");
            if (ch2) ch2.style.display = (el.value === "Dinheiro") ? "" : "none";
          }
        });
      });
      var phone = document.getElementById("fPhone");
      if (phone) phone.addEventListener("input", function () { phone.value = maskPhone(phone.value); });
    }

    // Busca (com debounce para não travar o teclado no celular)
    var debouncedCounts = debounce(updateCounts, 150);
    $all("[data-search]").forEach(function (input) {
      input.addEventListener("input", debouncedCounts);
    });
    $all("[data-clear-search]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-clear-search");
        var input = target ? document.querySelector("[data-search='" + target + "']") : document.querySelector("[data-search]");
        if (!input) input = btn.closest(".menu-block")?.querySelector("[data-search]") || document.querySelector("[data-search]");
        if (input) { input.value = ""; updateCounts(); input.focus(); }
      });
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        closeCart(); closeCheckout(); closeHalf();
        var sm = $("#successModal");
        if (sm && sm.classList.contains("is-open")) { sm.classList.remove("is-open"); unlockScroll(); }
        var mn = $("#mobileNav");
        if (mn && mn.classList.contains("is-open")) {
          mn.classList.remove("is-open");
          unlockScroll();
          var opener = $("#mobileOpen");
          if (opener) opener.setAttribute("aria-expanded", "false");
        }
        var sc = $("#cartScrim");
        if (sc) sc.classList.remove("is-visible");
        forceUnlockScroll();
        document.body.classList.remove("cart-open");
      }
    });

    /* Filtros */
    $all("[data-filters]").forEach(function (bar) {
      var targetId = bar.getAttribute("data-filters");
      $all(".filter-btn", bar).forEach(function (btn) {
        btn.addEventListener("click", function () {
          $all(".filter-btn", bar).forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");
          var grid = document.getElementById(targetId);
          if (!grid) return;
          applySearchFilter(grid);
        });
      });
    });

    var header = $("#siteHeader");
    var onScroll = function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    setInterval(renderOpenBadge, 60000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    hydrate();
    renderMenus();
    bind();
    renderCart();
    updateFeePreview();
  });
})();
