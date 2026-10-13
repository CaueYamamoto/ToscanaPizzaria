/* ==========================================================================
   PIZZARIA TOSCANA — Camada de interface (app)
   --------------------------------------------------------------------------
   Responsabilidades: pintar vitrines, drawer do carrinho, checkout,
   filtros, navegacao mobile. Regras de negocio vivem em store.js.
   ========================================================================== */
(function () {
  "use strict";

  var store = TOSCANA.store;
  var cfg = TOSCANA.config;

  /* ---------------- icones (conteudo dinamico) ---------------- */
  var I = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h15l-1.5 12.5a1 1 0 0 1-1 .5H8.5a1 1 0 0 1-1-.5L6 8Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7"/></svg>'
  };

  /* ---------------- utilidades ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var toastTimer = null;
  function toast(msg) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 2600);
  }

  /* ---------------- hidratacao (telefone, endereco, links) ---------------- */
  function hydrate() {
    $all("[data-bind='phone']").forEach(function (el) { el.textContent = cfg.phoneDisplay; });
    $all("[data-bind='address']").forEach(function (el) { el.textContent = cfg.address; });
    $all("[data-bind='hours']").forEach(function (el) { el.textContent = cfg.hours; });
    $all("a[data-bind='phone-href']").forEach(function (el) { el.href = cfg.phoneHref; });
    $all("a[data-bind='wa']").forEach(function (el) {
      el.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent("Ola, Pizzaria Toscana! Quero fazer um pedido.");
      el.target = "_blank";
      el.rel = "noopener";
    });
    var map = $("#mapEmbed");
    if (map && !map.src) map.src = cfg.mapsEmbed;
    var route = $("#btnRotas");
    if (route) { route.href = cfg.mapsUrl; route.target = "_blank"; route.rel = "noopener"; }
    var year = $("#ano");
    if (year) year.textContent = new Date().getFullYear();
    document.title = document.title.replace("Toscana", cfg.name);
  }

  /* ---------------- vitrines ---------------- */
  function priceFor(product, sizeCode) {
    if (TOSCANA.store.isPizza(product.id)) {
      var mult = 1;
      (TOSCANA.sizes || []).forEach(function (s) { if (s.code === sizeCode) mult = s.mult; });
      return product.price * mult;
    }
    return product.price;
  }

  function cardHTML(product, type) {
    var isPizza = type === "pizza";
    var pills = isPizza
      ? '<div class="size-row" data-size-group="' + esc(product.id) + '">' +
        (TOSCANA.sizes || []).map(function (s, i) {
          return '<button type="button" class="size-pill' + (i === 0 ? " is-active" : "") + '"' +
            ' data-size="' + esc(s.code) + '" title="' + esc(s.label + " · " + s.detail) + '">' + esc(s.code) + "</button>";
        }).join("") + "</div>"
      : "";
    var badge = product.badge
      ? '<span class="flag' + (product.badge === "Mais pedida" ? " flag--gold" : "") + '">' + esc(product.badge) + "</span>"
      : "";
    var hint = isPizza ? "a partir de" : "unidade";
    return (
      '<article class="product-card" data-kind="' + esc(product.kind || "") + '">' +
        '<div class="product-media">' +
          '<img src="' + esc(product.img) + '" alt="' + esc(product.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'assets/hero.jpg\'">' +
          badge +
        "</div>" +
        '<div class="product-body">' +
          "<h3>" + esc(product.name) + "</h3>" +
          '<p class="product-desc">' + esc(product.desc) + "</p>" +
          pills +
          '<div class="product-foot">' +
            '<span class="product-price" data-price data-base="' + product.price + '" data-id="' + esc(product.id) + '">' +
              store.money(product.price) + "<small>" + hint + "</small>" +
            "</span>" +
            '<button type="button" class="add-btn" data-add="' + esc(product.id) + '" data-type="' + type + '">' + I.plus + "Adicionar</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function productById(id) {
    return store.find(id);
  }

  function renderMenus() {
    $all("[data-menu]").forEach(function (box) {
      var kind = box.getAttribute("data-menu");
      var limit = parseInt(box.getAttribute("data-limit") || "0", 10);
      var list = [];
      if (kind === "pizzas") list = TOSCANA.pizzas || [];
      else if (kind === "esfirras") list = TOSCANA.esfirras || [];
      else if (kind === "featured") {
        list = (TOSCANA.featured || []).map(productById).filter(Boolean);
      }
      if (limit > 0) list = list.slice(0, limit);
      var typeOf = function (p) {
        return (TOSCANA.pizzas || []).indexOf(p) !== -1 ? "pizza" : "esfirra";
      };
      box.innerHTML = list.map(function (p) { return cardHTML(p, typeOf(p)); }).join("");
    });
  }

  /* ---------------- carrinho (drawer) ---------------- */
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
        "<p><strong>Seu carrinho esta vazio.</strong><br>Que tal comecar por uma das mais pedidas?</p></div>";
    } else {
      box.innerHTML = items.map(function (it, idx) {
        var p = store.find(it.id);
        if (!p) return "";
        var unit = store.unitPrice(it);
        var meta = store.isPizza(it.id)
          ? "Pizza · tamanho " + esc(it.size) + " — " + store.money(unit)
          : "Esfirra · unidade — " + store.money(unit);
        return (
          '<div class="cart-item">' +
            '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" onerror="this.onerror=null;this.src=\'assets/hero.jpg\'">' +
            "<div><h4>" + esc(p.name) + "</h4>" +
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

    var totalEl = $("#cartTotal");
    if (totalEl) totalEl.textContent = store.money(store.total());
    var checkoutBtn = $("#btnCheckout");
    if (checkoutBtn) checkoutBtn.disabled = !items.length;
  }

  function openCart() {
    renderCart();
    $("#cartDrawer").classList.add("is-open");
    $("#cartScrim").classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    $("#cartDrawer").classList.remove("is-open");
    $("#cartScrim").classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  /* ---------------- checkout ---------------- */
  function openCheckout() {
    if (!store.items().length) { toast("Adicione um item antes de finalizar."); return; }
    closeCart();
    var lines = store.items().map(function (it) {
      var p = store.find(it.id);
      var name = p ? (store.isPizza(it.id) ? p.name : "Esfirra de " + p.name) : it.id;
      var size = store.isPizza(it.id) ? " (" + it.size + ")" : "";
      return it.qty + "x " + name + size + " — " + store.money(store.unitPrice(it) * it.qty);
    });
    $("#orderResume").textContent = lines.join("\n") + "\n\nTOTAL: " + store.money(store.total());
    $("#checkoutTotal").textContent = store.money(store.total());
    $("#checkoutModal").classList.add("is-open");
  }

  function closeCheckout() {
    $("#checkoutModal").classList.remove("is-open");
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function requireField(id) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + "-err");
    var ok = fieldValue(id).length > 0;
    if (input) input.classList.toggle("is-invalid", !ok);
    if (err) err.classList.toggle("is-visible", !ok);
    return ok;
  }

  function submitCheckout(ev) {
    ev.preventDefault();
    var ok = true;
    ok = requireField("fName") && ok;
    ok = requireField("fAddress") && ok;
    ok = requireField("fDistrict") && ok;
    if (!ok) { toast("Preencha nome, endereco e bairro."); return; }

    var customer = {
      name: fieldValue("fName"),
      address: fieldValue("fAddress"),
      district: fieldValue("fDistrict"),
      notes: fieldValue("fNotes")
    };
    window.open(store.checkoutUrl(customer), "_blank", "noopener");
    toast("Abrindo o WhatsApp com seu pedido...");
  }

  /* ---------------- eventos globais ---------------- */
  function bind() {
    document.addEventListener("click", function (ev) {
      var t = ev.target;

      var pill = t.closest ? t.closest(".size-pill") : null;
      if (pill) {
        var group = pill.closest("[data-size-group]");
        $all(".size-pill", group).forEach(function (b) { b.classList.remove("is-active"); });
        pill.classList.add("is-active");
        var card = pill.closest(".product-card");
        var priceEl = card ? $(".product-price", card) : null;
        if (priceEl) {
          var base = parseFloat(priceEl.getAttribute("data-base"));
          var sizeId = priceEl.getAttribute("data-id");
          var prod = productById(sizeId);
          if (prod) {
            var code = pill.getAttribute("data-size");
            priceEl.innerHTML = store.money(priceFor(prod, code)) + "<small>tamanho " + esc(code) + "</small>";
          }
        }
        return;
      }

      var add = t.closest ? t.closest("[data-add]") : null;
      if (add) {
        var id = add.getAttribute("data-add");
        var cardEl = add.closest(".product-card");
        var active = cardEl ? $(".size-pill.is-active", cardEl) : null;
        var size = active ? active.getAttribute("data-size") : "M";
        if (store.add(id, size)) toast("Adicionado ao pedido.");
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
        store.removeAt(parseInt(del.getAttribute("data-del"), 10));
        renderCart();
        return;
      }

      if (t.closest && t.closest("[data-open-cart]")) { openCart(); return; }
      if (t.closest && t.closest("[data-close-cart]")) { closeCart(); return; }
      if (t.closest && t.closest("[data-open-checkout]")) { openCheckout(); return; }
      if (t.closest && t.closest("[data-close-checkout]")) { closeCheckout(); return; }
      if (t.closest && t.closest("#mobileOpen")) { $("#mobileNav").classList.add("is-open"); $("#cartScrim").classList.add("is-visible"); return; }
      if (t.closest && (t.closest("#mobileClose") || t.classList.contains("mobile-link"))) {
        $("#mobileNav").classList.remove("is-open");
        if (!$("#cartDrawer").classList.contains("is-open")) $("#cartScrim").classList.remove("is-visible");
        return;
      }
    });

    var scrim = $("#cartScrim");
    if (scrim) scrim.addEventListener("click", function () {
      closeCart();
      $("#mobileNav").classList.remove("is-open");
      scrim.classList.remove("is-visible");
    });

    var form = $("#checkoutForm");
    if (form) form.addEventListener("submit", submitCheckout);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        closeCart(); closeCheckout();
        $("#mobileNav").classList.remove("is-open");
        $("#cartScrim").classList.remove("is-visible");
        document.body.style.overflow = "";
      }
    });

    /* Filtros salgada / doce */
    $all("[data-filters]").forEach(function (bar) {
      var targetId = bar.getAttribute("data-filters");
      $all(".filter-btn", bar).forEach(function (btn) {
        btn.addEventListener("click", function () {
          $all(".filter-btn", bar).forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          var f = btn.getAttribute("data-filter");
          var grid = document.getElementById(targetId);
          if (!grid) return;
          $all(".product-card", grid).forEach(function (card) {
            card.style.display = (f === "all" || card.getAttribute("data-kind") === f) ? "" : "none";
          });
        });
      });
    });

    /* Sombra do header ao rolar */
    var header = $("#siteHeader");
    var onScroll = function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    hydrate();
    renderMenus();
    bind();
    renderCart();
  });
})();
