/* Wuré usage log, for the publisher's dashboard (admin.html).
   One short line per event. It never holds an email, a password or a player name.
   Anonymous lines carry only a random device code; signed-in players also appear in /wure/seen. */
(function () {
  "use strict";
  var C = window.WURE_CONFIG || {};
  var DB = String(C.databaseURL || "").replace(/\/+$/, "");
  if (!DB) return;

  var dev = "";
  try { dev = localStorage.getItem("wure-did") || ""; } catch (e) {}
  if (!/^[a-z0-9]{10}$/.test(dev)) {
    dev = "";
    while (dev.length < 10) dev += Math.random().toString(36).slice(2);
    dev = dev.replace(/[^a-z0-9]/g, "").slice(0, 10);
    try { localStorage.setItem("wure-did", dev); } catch (e) {}
  }

  function day() { return new Date().toISOString().slice(0, 10); }
  function guessCc() {
    var z = ""; try { z = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    if (/^Europe\/(Paris|Brussels|Luxembourg|Monaco)/.test(z)) return "33";
    if (/^Europe\/(Rome|Vatican|San_Marino)/.test(z)) return "39";
    if (/^America\//.test(z)) return "1";
    return "221";
  }
  function platform() {
    var s = false;
    try { s = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) {}
    return s ? "app" : "web";
  }
  function device() {
    var ua = navigator.userAgent || "", t = (navigator.maxTouchPoints || 0) > 0;
    var m = Math.min(screen.width || 0, screen.height || 0);
    return !t ? "desktop" : (m >= 600 || /iPad|Tablet/i.test(ua) ? "tablet" : "phone");
  }
  var game = null;           // WureGame hooks, set lazily
  function lang() { try { return window.WureGame.lang(); } catch (e) { return ""; } }
  function uid() { try { var u = window.WureOnline && window.WureOnline.user(); return u ? u.uid : ""; } catch (e) { return ""; } }

  var count = 0;
  function ev(e, more) {
    if (count >= 90) return;
    count++;
    var o = { e: e, t: Date.now(), d: dev, cc: guessCc(), pf: platform(), b: String(C.build || ""), l: lang(), dv: device() };
    var u = uid(); if (u) o.u = u;
    if (more) Object.keys(more).forEach(function (k) { if (more[k] !== undefined && more[k] !== null) o[k] = more[k]; });
    try {
      fetch(DB + "/wure/events/" + day() + ".json", { method: "POST", body: JSON.stringify(o), keepalive: true }).catch(function () {});
    } catch (x) {}
  }

  /* ----- signed-in players: one small record each ----- */
  var seenBusy = false;
  function touch(add) {
    var O = window.WureOnline; if (!O || !O.user || !O.db) return;
    var u = O.user(); if (!u || seenBusy) return;
    seenBusy = true;
    var path = "/wure/seen/" + u.uid;
    O.db("GET", path).then(function (r) {
      r = r || {};
      var now = Date.now();
      var doc = {
        n: String(O.name() || r.n || "").slice(0, 20), cc: guessCc(), pf: platform(), b: String(C.build || ""),
        first: r.first || now, last: now, ses: (r.ses || 0) + (add && add.ses ? 1 : 0),
        g: (r.g || 0) + (add && add.g ? 1 : 0), w: (r.w || 0) + (add && add.w ? 1 : 0)
      };
      return O.db("PUT", path, doc);
    }).catch(function () {}).then(function () { seenBusy = false; });
  }

  /* ----- one game at a time ----- */
  var cur = null;
  function levelOf(S) { return S.mode === "cpu" ? S.level : undefined; }
  function start(S) {
    if (cur && !cur.ended && Date.now() - cur.t0 > 15000) ev("game_left", { gm: cur.mode, lv: cur.level, min: Math.round((Date.now() - cur.t0) / 6000) / 10 });
    cur = { mode: S.mode, level: levelOf(S), t0: Date.now(), ended: false };
    ev("game_start", { gm: cur.mode, lv: cur.level });
  }
  function end(S, how) {
    if (!cur || cur.ended) return;
    cur.ended = true;
    var seat = S.online ? S.online.seat : 0, a = S.score[0], b = S.score[1];
    var mine = seat === 0 ? a : b, theirs = seat === 0 ? b : a;
    var r = how === "left" ? "left" : (mine > theirs ? "w" : (mine < theirs ? "l" : "d"));
    var min = Math.round((Date.now() - cur.t0) / 6000) / 10;
    ev("game_end", { gm: cur.mode, lv: cur.level, r: r, min: min, sc: mine + "-" + theirs });
    if (uid()) touch({ g: 1, w: r === "w" ? 1 : 0 });
    // The host reports a finished online game once, without names.
    var O = window.WureOnline, info = O && O.info && O.info();
    if (S.online && info && info.seat === 0 && how !== "left" && O.db) {
      O.db("PUT", "/wure/history/" + info.code, {
        t: Date.now(), u: [info.host || "", info.guest || ""], s: [a, b], min: min, cc: guessCc(), b: String(C.build || "")
      }).catch(function () {});
    }
  }

  window.addEventListener("error", function (e) {
    if (count > 60) return;
    ev("js_error", { m: String((e && e.message) || "").slice(0, 160), w: String((e && e.filename) || "").split("/").pop().slice(0, 40) + ":" + ((e && e.lineno) || 0) });
  });

  window.WureStats = {
    ev: ev, touch: touch, start: start, end: end,
    boot: function () {
      ev("app_open");
      ["planet-auto-hub", "nioro-farms", "jollof-ventures"].forEach(function (s) { ev("sp_view", { sp: s }); });
      if (uid()) touch({ ses: 1 });
    }
  };
})();
