/* Back in the Game: shared header, footer and tick-off logic for every page.
   Edit the header or footer here once and every page updates. */
(function () {
  // ---------- Shared navigation header ----------
  var NAV = [
    { key: "home", href: "index.html", label: "Home" },
    { key: "recognise", href: "recognise.html", label: "Recognise" },
    { key: "assess", href: "assess.html", label: "Assess &amp; Refer" },
    { key: "rehabilitate", href: "rehabilitate.html", label: "Rehabilitate" },
    { key: "return", href: "return.html", label: "Return to Sport" },
    { key: "about", href: "about.html", label: "About" },
    { key: "references", href: "references.html", label: "References" },
  ];
  var current = document.body.dataset.page || "home";

  var header =
    '<header class="top"><div class="wrap">' +
    '<a class="brand" href="index.html">Back in the Game</a>' +
    '<nav aria-label="Sections">' +
    NAV.map(function (n) {
      return (
        '<a href="' +
        n.href +
        '"' +
        (n.key === current ? ' aria-current="page"' : "") +
        ">" +
        n.label +
        "</a>"
      );
    }).join("") +
    "</nav></div></header>";

  // ---------- Shared footer ----------
  var footer =
    '<footer class="site-footer wrap">' +
    "Back in the Game is an educational resource for clinicians. It is not a substitute for clinical judgement." +
    "</footer>";

  var h = document.getElementById("site-header");
  var f = document.getElementById("site-footer");
  if (h) h.outerHTML = header;
  if (f) f.outerHTML = footer;

  // ---------- Tick-off outcome measures (saved in this browser) ----------
  var mem = {};
  function get(k) {
    try {
      var v = localStorage.getItem("bitg:" + k);
      return v === null ? mem[k] : v;
    } catch (e) {
      return mem[k];
    }
  }
  function set(k, v) {
    mem[k] = v;
    try {
      localStorage.setItem("bitg:" + k, v);
    } catch (e) {}
  }

  function update(grp) {
    var el = document.querySelector('.progress[data-grp="' + grp + '"]');
    if (!el) return;
    var n = +el.dataset.n,
      c = 0;
    for (var i = 0; i < n; i++) {
      var b = document.querySelector('[data-k="' + grp + "-" + i + '"]');
      var on = get(grp + "-" + i) === "1";
      if (b) b.setAttribute("aria-pressed", on ? "true" : "false");
      if (on) c++;
    }
    el.querySelector("i").style.width = (100 * c) / n + "%";
    el.querySelector(".status").textContent = c + " of " + n + " met" + (c === n ? ": ready to move on" : "");
    var m = /^ph([1-4])$/.exec(grp);
    if (m) {
      var ph = +m[1];
      var box = document.querySelector('.progress-next[data-next="' + ph + '"]');
      if (box) {
        box.innerHTML =
          c === n
            ? ph < 4
              ? '<a class="next" href="phase-' + (ph + 1) + '.html">Start Phase ' + (ph + 1) + " →</a>"
              : '<a class="next" href="return.html">Go to Return to Sport →</a>'
            : "";
      }
    }
  }

  // Phase bar: mark phases already completed (ticks are shared across pages)
  function markPhaseBar() {
    var counts = { 1: 6, 2: 7, 3: 6, 4: 6 };
    document.querySelectorAll(".phasebar a[data-ph]").forEach(function (a) {
      var ph = a.dataset.ph,
        done = true;
      for (var i = 0; i < counts[ph]; i++)
        if (get("ph" + ph + "-" + i) !== "1") {
          done = false;
          break;
        }
      a.classList.toggle("done", done);
    });
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest(".tickbtn");
    if (t && t.classList.contains("bonus")) {
      var bk = t.dataset.k;
      set(bk, get(bk) === "1" ? "0" : "1");
      t.setAttribute("aria-pressed", get(bk) === "1" ? "true" : "false");
      return;
    }
    if (t) {
      var k = t.dataset.k;
      set(k, get(k) === "1" ? "0" : "1");
      update(k.replace(/-\d+$/, ""));
      markPhaseBar();
      return;
    }
    var r = e.target.closest(".reset");
    if (r) {
      r.dataset.reset.split(",").forEach(function (g) {
        document.querySelectorAll('.tickbtn.bonus[data-g="' + g + '"]').forEach(function (b) {
          set(b.dataset.k, "0");
          b.setAttribute("aria-pressed", "false");
        });
        var el = document.querySelector('.progress[data-grp="' + g + '"]');
        if (!el) return;
        for (var i = 0; i < +el.dataset.n; i++) set(g + "-" + i, "0");
        update(g);
      });
      markPhaseBar();
    }
  });

  document.querySelectorAll(".progress[data-grp]").forEach(function (p) {
    update(p.dataset.grp);
  });
  document.querySelectorAll(".tickbtn.bonus").forEach(function (b) {
    b.setAttribute("aria-pressed", get(b.dataset.k) === "1" ? "true" : "false");
  });
  markPhaseBar();

  // ---------- Suspicion indicator counter (Assess & Refer page) ----------
  var ind = document.querySelectorAll("#ind input");
  var count = document.getElementById("indcount");
  ind.forEach(function (i) {
    i.addEventListener("change", function () {
      var c = 0;
      ind.forEach(function (x) {
        if (x.checked) c++;
      });
      count.textContent = c;
    });
  });
})();
