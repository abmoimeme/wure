/* Wuré online: sign in (same accounts as Ludo Teranga), private two-player games with a code, chat. */
(function () {
"use strict";
var G = window.WureGame;
if (!G) return;
var C = window.WURE_CONFIG || {};
var DB = String(C.databaseURL || "").replace(/\/+$/, "");
var API = String(C.apiKey || "");
var GID = String(C.googleClientId || "");
var AUTH = String(C.authUrl || "https://identitytoolkit.googleapis.com/v1").replace(/\/+$/, "");
var TOKURL = String(C.tokenUrl || "https://securetoken.googleapis.com/v1").replace(/\/+$/, "");
var ON = !!(DB && API);

function $(id) { return document.getElementById(id); }
function lang() { var l = G.lang(); return l === "fr" || l === "it" ? l : "en"; }

/* ---------- Text ---------- */
var X = {
  en: {
    title: "Play online", close: "Close", notReady: "Online play is not set up yet.",
    intro: "Sign in with the same account you use in Ludo Teranga, or create one. Your email is never shown to other players.",
    email: "Email", password: "Password", signIn: "Sign in", create: "Create account", or: "or", forgot: "Forgot your password?",
    resetSent: "If that email has an account, a message to reset the password is on its way.",
    signedIn: "Signed in as", signOut: "Sign out", yourName: "Your name",
    newGame: "Create a game", joinHead: "Join a friend's game", code: "Game code", join: "Join",
    waitTitle: "Waiting for your friend", waitNote: "Send this code. The game starts as soon as your friend joins.",
    copy: "Copy code", copied: "Copied", share: "Share", cancel: "Cancel game",
    inGame: "You are in game", leave: "Leave game",
    errEmail: "Type a valid email.", errPw: "Type your password.", errWeak: "Choose a password of at least 8 characters.",
    errBad: "Email or password not recognised.", errExists: "That email already has an account. Tap Sign in.",
    errMany: "Too many attempts. Wait a few minutes and try again.", errOff: "Email sign-in is not switched on yet.",
    errNet: "Could not reach the game server. Check your connection and try again.",
    errSetup: "Online games are not switched on yet. The owner needs to update the database rules.",
    errName: "Type your name (1 to 12 letters) first.", errCode: "Type the 6-letter code.",
    errNone: "No game with that code. Check it and try again.", errFull: "That game already has two players.",
    errEnded: "That game has ended.", google: "Google sign-in failed. Try again.",
    oppLeft: function (n) { return n + " left the game."; },
    youWin: function (n) { return n + " left the game. You win."; },
    joined: function (n) { return n + " joined the game."; },
    chatPh: "Say something (short)", send: "Send", offline: "Connection lost. Trying again…",
    sharetext: function (c) { return "Play Wuré with me. Game code: " + c; }
  },
  fr: {
    title: "Jouer en ligne", close: "Fermer", notReady: "Le jeu en ligne n'est pas encore configuré.",
    intro: "Connectez-vous avec le même compte que dans Ludo Teranga, ou créez-en un. Votre e-mail n'est jamais montré aux autres joueurs.",
    email: "E-mail", password: "Mot de passe", signIn: "Se connecter", create: "Créer un compte", or: "ou", forgot: "Mot de passe oublié ?",
    resetSent: "Si cet e-mail a un compte, un message pour changer le mot de passe est en route.",
    signedIn: "Connecté en tant que", signOut: "Se déconnecter", yourName: "Votre nom",
    newGame: "Créer une partie", joinHead: "Rejoindre la partie d'un ami", code: "Code de la partie", join: "Rejoindre",
    waitTitle: "En attente de votre ami", waitNote: "Envoyez ce code. La partie commence dès que votre ami la rejoint.",
    copy: "Copier le code", copied: "Copié", share: "Partager", cancel: "Annuler la partie",
    inGame: "Vous êtes dans la partie", leave: "Quitter la partie",
    errEmail: "Écrivez un e-mail valide.", errPw: "Écrivez votre mot de passe.", errWeak: "Choisissez un mot de passe d'au moins 8 caractères.",
    errBad: "E-mail ou mot de passe non reconnu.", errExists: "Cet e-mail a déjà un compte. Touchez Se connecter.",
    errMany: "Trop d'essais. Attendez quelques minutes puis réessayez.", errOff: "La connexion par e-mail n'est pas encore activée.",
    errNet: "Impossible de joindre le serveur du jeu. Vérifiez votre connexion et réessayez.",
    errSetup: "Les parties en ligne ne sont pas encore activées. Le propriétaire doit mettre à jour les règles de la base de données.",
    errName: "Écrivez d'abord votre nom (1 à 12 lettres).", errCode: "Écrivez le code de 6 lettres.",
    errNone: "Aucune partie avec ce code. Vérifiez et réessayez.", errFull: "Cette partie a déjà deux joueurs.",
    errEnded: "Cette partie est terminée.", google: "La connexion Google a échoué. Réessayez.",
    oppLeft: function (n) { return n + " a quitté la partie."; },
    youWin: function (n) { return n + " a quitté la partie. Vous gagnez."; },
    joined: function (n) { return n + " a rejoint la partie."; },
    chatPh: "Écrivez un mot (court)", send: "Envoyer", offline: "Connexion perdue. Nouvel essai…",
    sharetext: function (c) { return "Jouez au Wuré avec moi. Code de la partie : " + c; }
  },
  it: {
    title: "Gioca online", close: "Chiudi", notReady: "Il gioco online non è ancora configurato.",
    intro: "Accedi con lo stesso account che usi in Ludo Teranga, oppure creane uno. La tua e-mail non viene mai mostrata agli altri giocatori.",
    email: "E-mail", password: "Password", signIn: "Accedi", create: "Crea account", or: "oppure", forgot: "Password dimenticata?",
    resetSent: "Se questa e-mail ha un account, sta arrivando un messaggio per reimpostare la password.",
    signedIn: "Accesso come", signOut: "Esci", yourName: "Il tuo nome",
    newGame: "Crea una partita", joinHead: "Entra nella partita di un amico", code: "Codice della partita", join: "Entra",
    waitTitle: "In attesa del tuo amico", waitNote: "Invia questo codice. La partita inizia appena il tuo amico entra.",
    copy: "Copia il codice", copied: "Copiato", share: "Condividi", cancel: "Annulla la partita",
    inGame: "Sei nella partita", leave: "Lascia la partita",
    errEmail: "Scrivi un'e-mail valida.", errPw: "Scrivi la tua password.", errWeak: "Scegli una password di almeno 8 caratteri.",
    errBad: "E-mail o password non riconosciute.", errExists: "Questa e-mail ha già un account. Tocca Accedi.",
    errMany: "Troppi tentativi. Aspetta qualche minuto e riprova.", errOff: "L'accesso con e-mail non è ancora attivo.",
    errNet: "Impossibile raggiungere il server del gioco. Controlla la connessione e riprova.",
    errSetup: "Le partite online non sono ancora attive. Il proprietario deve aggiornare le regole del database.",
    errName: "Scrivi prima il tuo nome (da 1 a 12 lettere).", errCode: "Scrivi il codice di 6 lettere.",
    errNone: "Nessuna partita con questo codice. Controlla e riprova.", errFull: "Questa partita ha già due giocatori.",
    errEnded: "Questa partita è finita.", google: "Accesso con Google non riuscito. Riprova.",
    oppLeft: function (n) { return n + " ha lasciato la partita."; },
    youWin: function (n) { return n + " ha lasciato la partita. Hai vinto."; },
    joined: function (n) { return n + " è entrato nella partita."; },
    chatPh: "Scrivi qualcosa (breve)", send: "Invia", offline: "Connessione persa. Nuovo tentativo…",
    sharetext: function (c) { return "Gioca a Wuré con me. Codice della partita: " + c; }
  }
};
function T(k) { return X[lang()][k]; }

/* ---------- Sign-in (Firebase Auth, same project as Ludo Teranga) ---------- */
var A = null, tok = null, tokP = null, busy = false, note = "", err = "", view = "";
function readJSON(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
function writeJSON(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function validAuth(a) { return a && typeof a === "object" && a.rt && a.uid && /^[A-Za-z0-9]{10,40}$/.test(a.uid); }
A = readJSON("wure-auth");
if (!validAuth(A)) {
  A = null;
  // Same phone, same site, same account: bring the Ludo Teranga sign-in along.
  var L = readJSON("ludo-auth");
  if (validAuth(L)) { A = { rt: L.rt, uid: L.uid, email: L.email || "" }; writeJSON("wure-auth", A); }
}
function saveAuth() { writeJSON("wure-auth", A); }

function authCall(path, body) {
  return fetch(AUTH + "/" + path + "?key=" + encodeURIComponent(API), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
  }).then(function (r) {
    return r.json().then(function (j) {
      if (!r.ok) { var e = new Error(String((j && j.error && j.error.message) || "net")); e.auth = 1; throw e; }
      return j;
    });
  });
}
function token() {
  if (!A) return Promise.reject(new Error("signin"));
  if (tok && tok.exp > Date.now()) return Promise.resolve(tok.t);
  if (tokP) return tokP;
  var me = A;
  tokP = fetch(TOKURL + "/token?key=" + encodeURIComponent(API), {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(me.rt)
  }).then(function (r) {
    return r.json().then(function (j) {
      tokP = null;
      if (!r.ok || !j.id_token) {
        if (/TOKEN_EXPIRED|USER_DISABLED|USER_NOT_FOUND|INVALID_REFRESH_TOKEN/.test(String((j && j.error && j.error.message) || ""))) { signedOutNow(); throw new Error("signin"); }
        throw new Error("net");
      }
      if (A === me) { A.rt = j.refresh_token || A.rt; saveAuth(); }
      tok = { t: j.id_token, exp: Date.now() + (parseInt(j.expires_in, 10) || 3600) * 1000 - 300000 };
      return tok.t;
    });
  }, function (e) { tokP = null; throw e; });
  return tokP;
}
function signedOutNow() { A = null; tok = null; saveAuth(); profile = null; if (O) leave(true); render(); }
function afterSignIn(j, email) {
  A = { rt: j.refreshToken, uid: j.localId, email: email || j.email || "" };
  saveAuth();
  tok = { t: j.idToken, exp: Date.now() + (parseInt(j.expiresIn, 10) || 3600) * 1000 - 300000 };
  profile = null; busy = false; err = ""; note = "";
  return loadProfile().then(render);
}
function authMsg(e) {
  var m = String((e && e.message) || "");
  if (/EMAIL_EXISTS/.test(m)) return T("errExists");
  if (/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND|INVALID_EMAIL/.test(m)) return T("errBad");
  if (/WEAK_PASSWORD/.test(m)) return T("errWeak");
  if (/TOO_MANY_ATTEMPTS/.test(m)) return T("errMany");
  if (/OPERATION_NOT_ALLOWED|PASSWORD_LOGIN_DISABLED/.test(m)) return T("errOff");
  return T("errNet");
}
function emailOk(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e); }
function doEmail(create) {
  var email = String($("on-mail").value || "").trim().toLowerCase(), pw = String($("on-pw").value || "");
  err = ""; note = "";
  if (busy) return;
  if (!emailOk(email)) { err = T("errEmail"); render(); return; }
  if (!pw) { err = T("errPw"); render(); return; }
  if (create && pw.length < 8) { err = T("errWeak"); render(); return; }
  busy = true; render();
  authCall(create ? "accounts:signUp" : "accounts:signInWithPassword", { email: email, password: pw, returnSecureToken: true })
    .then(function (j) {
      if (create) authCall("accounts:sendOobCode", { requestType: "VERIFY_EMAIL", idToken: j.idToken }).catch(function () {});
      return afterSignIn(j, email);
    })
    .catch(function (e) { busy = false; err = e && e.auth ? authMsg(e) : T("errNet"); render(); });
}
function doGoogle(idToken) {
  if (busy || !idToken) return;
  busy = true; err = ""; render();
  authCall("accounts:signInWithIdp", {
    postBody: "id_token=" + encodeURIComponent(idToken) + "&providerId=google.com",
    requestUri: String(window.location.href), returnSecureToken: true
  }).then(function (j) { return afterSignIn(j, j.email); })
    .catch(function () { busy = false; err = T("google"); render(); });
}
function doReset() {
  var email = String($("on-mail").value || "").trim().toLowerCase();
  err = ""; note = "";
  if (!emailOk(email)) { err = T("errEmail"); render(); return; }
  authCall("accounts:sendOobCode", { requestType: "PASSWORD_RESET", email: email })
    .then(function () { note = T("resetSent"); render(); })
    .catch(function () { note = T("resetSent"); render(); });
}

/* ---------- Database (REST) ---------- */
function dbx(method, path, body) {
  return token().then(function (t) {
    var opt = { method: method, headers: {} };
    if (body !== undefined) { opt.body = JSON.stringify(body); opt.headers["Content-Type"] = "application/json"; }
    return fetch(DB + path + ".json?auth=" + encodeURIComponent(t), opt).then(function (r) {
      if (!r.ok) { var e = new Error("db"); e.status = r.status; throw e; }
      return r.json();
    });
  });
}
function setupOrNet(e) { return e && (e.status === 401 || e.status === 403) ? T("errSetup") : T("errNet"); }

/* ---------- Profile: the name shown to the other player ---------- */
var profile = null, nameDraft = "", codeDraft = "", mailDraft = "";
function cleanName(s) { return String(s || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 12); }
function loadProfile() {
  if (!A) return Promise.resolve();
  return dbx("GET", "/wure/profiles/" + A.uid).then(function (p) { return p && p.name ? String(p.name) : null; }, function () { return null; })
    .then(function (n) {
      if (n) return n;
      return dbx("GET", "/accounts/" + A.uid).then(function (a) { return a && a.name ? String(a.name) : ""; }, function () { return ""; });
    })
    .then(function (n) { profile = { name: cleanName(n) || cleanName(G.name()) }; });
}
function saveName(n) {
  n = cleanName(n);
  if (!n) return Promise.reject(new Error("name"));
  if (profile && profile.name === n && profile.saved) return Promise.resolve(n);
  return dbx("PUT", "/wure/profiles/" + A.uid, { name: n, t: Date.now() }).then(function () {
    profile = { name: n, saved: true }; return n;
  });
}

/* ---------- Online game ---------- */
var O = null; // {code, seat, room, applied, queue, pending, outbox, es, poll, started, chatSeen, flushing}
var CODE_CH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode() {
  var a = new Uint8Array(6); (window.crypto || window.msCrypto).getRandomValues(a);
  var s = ""; for (var i = 0; i < 6; i++) s += CODE_CH.charAt(a[i] % CODE_CH.length); return s;
}
function movesOf(room) {
  var m = room && room.moves, out = [];
  if (!m) return out;
  if (Array.isArray(m)) return m.slice();
  Object.keys(m).map(Number).sort(function (a, b) { return a - b; }).forEach(function (k) { out[k] = m[k]; });
  return out;
}
function createGame() {
  var nm = cleanName($("on-name").value);
  err = ""; if (!nm) { err = T("errName"); render(); return; }
  if (busy) return; busy = true; render();
  saveName(nm).then(function () {
    var code = newCode();
    var room = { v: 1, host: { uid: A.uid, name: nm }, first: Math.random() < 0.5 ? 0 : 1, status: "waiting", t: Date.now() };
    return dbx("GET", "/wure/rooms/" + code).then(function (ex) {
      if (ex) throw new Error("again");
      return dbx("PUT", "/wure/rooms/" + code, room);
    }).then(function () { busy = false; enter(code, 0, room); });
  }).catch(function (e) { busy = false; err = e && e.message === "name" ? T("errName") : setupOrNet(e); render(); });
}
function joinGame(raw, silent) {
  var code = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!silent) {
    err = "";
    var nm = cleanName($("on-name").value);
    if (!nm) { err = T("errName"); render(); return Promise.resolve(); }
    if (code.length !== 6) { err = T("errCode"); render(); return Promise.resolve(); }
  }
  if (busy) return Promise.resolve();
  var name = silent ? (profile && profile.name) || "" : cleanName($("on-name").value);
  busy = true; if (!silent) render();
  return (silent ? Promise.resolve() : saveName(name)).then(function () {
    return dbx("GET", "/wure/rooms/" + code);
  }).then(function (room) {
    if (!room || !room.host) throw new Error("none");
    if (room.over && !(silent)) throw new Error("ended");
    if (room.host.uid === A.uid) return [room, 0];
    if (room.guest && room.guest.uid === A.uid) return [room, 1];
    if (room.guest) throw new Error("full");
    if (room.over) throw new Error("ended");
    return dbx("PUT", "/wure/rooms/" + code + "/guest", { uid: A.uid, name: name || "?" }).then(function () {
      return dbx("GET", "/wure/rooms/" + code + "/guest");
    }).then(function (g) {
      if (!g || g.uid !== A.uid) throw new Error("full");
      room.guest = g; return [room, 1];
    });
  }).then(function (r) { busy = false; enter(code, r[1], r[0]); })
    .catch(function (e) {
      busy = false; writeJSON("wure-room", null);
      if (silent) return;
      var m = e && e.message;
      err = m === "name" ? T("errName") : m === "none" ? T("errNone") : m === "full" ? T("errFull") : m === "ended" ? T("errEnded") : setupOrNet(e);
      render();
    });
}
function enter(code, seat, room) {
  if (O) closeNet();
  O = { code: code, seat: seat, room: null, applied: 0, queue: [], pending: {}, outbox: [], es: null, poll: null, started: false, chatSeen: 0, flushing: false, sseTree: null, retry: null };
  writeJSON("wure-room", { code: code, seat: seat });
  view = "wait";
  openStream();
  O.poll = setInterval(pollNow, 4000);
  onRoom(room);
  render();
  if (!G.S.over && O.started) closeDialog();
}
function closeNet() {
  if (!O) return;
  clearInterval(O.poll); clearTimeout(O.retry);
  if (O.es) { try { O.es.close(); } catch (e) {} O.es = null; }
}
function pollNow() {
  if (!O || !A) return;
  var code = O.code;
  dbx("GET", "/wure/rooms/" + code).then(function (room) { if (O && O.code === code) onRoom(room); }, function () {});
}
// Firebase streaming: the server sends changes as they happen.
function setAt(tree, parts, data) {
  if (!parts.length) return data;
  if (tree === null || typeof tree !== "object" || Array.isArray(tree)) tree = {};
  var k = parts[0];
  if (parts.length === 1) { if (data === null) delete tree[k]; else tree[k] = data; }
  else {
    var child = setAt(tree[k] === undefined ? null : tree[k], parts.slice(1), data);
    if (child === null || (typeof child === "object" && !Object.keys(child).length)) delete tree[k]; else tree[k] = child;
  }
  return Object.keys(tree).length ? tree : null;
}
function openStream() {
  if (!O || !window.EventSource) return;
  var me = O;
  token().then(function (t) {
    if (O !== me) return;
    var es;
    try { es = new EventSource(DB + "/wure/rooms/" + me.code + ".json?auth=" + encodeURIComponent(t)); } catch (e) { return; }
    me.es = es; me.sseTree = null;
    function ev(path, data, merge) {
      var parts = String(path || "/").split("/").filter(Boolean);
      if (merge) { Object.keys(data || {}).forEach(function (k) { me.sseTree = setAt(me.sseTree, parts.concat(k.split("/").filter(Boolean)), data[k]); }); }
      else me.sseTree = setAt(me.sseTree, parts, data);
      if (O === me) onRoom(me.sseTree);
    }
    es.addEventListener("put", function (e) { try { var d = JSON.parse(e.data); ev(d.path, d.data, false); } catch (x) {} });
    es.addEventListener("patch", function (e) { try { var d = JSON.parse(e.data); ev(d.path, d.data, true); } catch (x) {} });
    es.addEventListener("auth_revoked", function () { try { es.close(); } catch (x) {} me.es = null; tok = null; me.retry = setTimeout(function () { if (O === me) openStream(); }, 500); });
    es.onerror = function () {
      try { es.close(); } catch (x) {} if (me.es === es) me.es = null;
      me.retry = setTimeout(function () { if (O === me && !me.es) openStream(); }, 5000);
    };
  }).catch(function () {});
}

function onRoom(room) {
  if (!O) return;
  if (!room) {
    // the room is gone: if the game is still running, the other player has left
    if (O.started && !G.S.over) G.endWith(T("youWin")(oppName()));
    if (O.started || O.sawRoom) { /* wait for the player to leave */ }
    return;
  }
  O.sawRoom = true;
  O.room = room;
  if (!O.started && room.host && room.guest) {
    O.started = true;
    var names = [room.host.name || "", room.guest.name || ""];
    G.startOnline({ seat: O.seat, names: names, first: room.first === 1 ? 1 : 0 });
    var mv = movesOf(room), n = 0;
    while (mv[n] !== undefined && mv[n] !== null) { G.silentMove(mv[n]); n++; }
    O.applied = n;
    G.render();
    if (!G.S.over) closeDialog();
    view = "game"; render(); chatShow(true);
  }
  if (O.started) {
    var nm = [room.host && room.host.name || "", room.guest && room.guest.name || ""];
    if (G.S.online && (G.S.online.names[0] !== nm[0] || G.S.online.names[1] !== nm[1])) G.setNames(nm);
    var m2 = movesOf(room);
    while (m2[O.applied] !== undefined && m2[O.applied] !== null) {
      var idx = O.applied; O.applied++;
      if (O.pending[idx]) { delete O.pending[idx]; continue; }
      O.queue.push(m2[idx]);
    }
    pump();
    if (room.over && room.over.left !== O.seat && !G.S.over) G.endWith(T("youWin")(oppName()));
    chatUpdate(room);
  } else if (room.over && room.over.left !== O.seat && view === "wait") {
    err = T("errEnded"); leave(true); render();
  }
  if (view === "wait") render();
}
function oppName() { var r = O && O.room; if (!r) return "?"; var o = O.seat === 0 ? r.guest : r.host; return (o && o.name) || "?"; }
function pump() {
  if (!O || !O.started) return;
  while (O.queue.length && !G.isBusy()) {
    if (G.remoteMove(O.queue[0])) { O.queue.shift(); return; }
    O.queue.shift(); // not a legal move: ignore it
  }
}
function sendMove(i) {
  if (!O || !O.started) return false;
  var n = O.applied; O.applied++; O.pending[n] = 1;
  O.outbox.push({ n: n, i: i }); flush();
  return true;
}
function flush() {
  if (!O || O.flushing || !O.outbox.length) return;
  var me = O, job = me.outbox[0]; me.flushing = true;
  dbx("PUT", "/wure/rooms/" + me.code + "/moves/" + job.n, job.i).then(function () {
    me.flushing = false; me.outbox.shift(); if (O === me) flush();
  }).catch(function () {
    me.flushing = false;
    G.toast(T("offline"));
    setTimeout(function () { if (O === me) flush(); }, 2000);
  });
}
function leave(silent) {
  var me = O;
  if (me) {
    var done = G.S.over || !me.started;
    closeNet(); O = null;
    writeJSON("wure-room", null);
    if (A && me.room) {
      if (done) dbx("DELETE", "/wure/rooms/" + me.code).catch(function () {});
      else dbx("PUT", "/wure/rooms/" + me.code + "/over", { left: me.seat, t: Date.now() }).catch(function () {});
    }
  }
  chatShow(false);
  if (G.S.online) G.stopOnline();
  view = "";
  if (!silent) render();
}

/* ---------- Chat ---------- */
var BADW = ("fuck fucker fucking motherfucker shit shitty bullshit bitch asshole bastard cunt pussy whore slut nigger nigga faggot retard wanker twat " +
  "merde putain pute salope salaud connard connasse encule enculer nique niquer ntm fdp batard petasse couille " +
  "cazzo vaffanculo fanculo stronzo stronza puttana troia merda minchia coglione bastardo").split(" ");
function clean(s) {
  return String(s).replace(/[A-Za-zÀ-ɏ0-9@$]+/g, function (w) {
    var k = w.toLowerCase().replace(/@/g, "a").replace(/\$/g, "s").replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/(.)\1{2,}/g, "$1");
    try { k = k.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) {}
    for (var i = 0; i < BADW.length; i++) if (k === BADW[i] || (BADW[i].length > 4 && k.indexOf(BADW[i]) === 0)) return "★★★";
    return w;
  });
}
var EMOJIS = ["👍", "👏", "😂", "😮", "🔥", "🙏"];
var lastSend = 0;
function chatShow(on) {
  var c = $("chat"); if (!c) return;
  c.hidden = !on;
  if (!on) $("chatMsgs").textContent = "";
}
function chatSend(text) {
  if (!O || !O.started) return;
  text = clean(String(text || "").replace(/[<>]/g, "").trim()).slice(0, 40);
  if (!text || Date.now() - lastSend < 1200) return;
  lastSend = Date.now();
  dbx("POST", "/wure/rooms/" + O.code + "/chat", { s: O.seat, m: text, t: Date.now() }).catch(function () {});
}
function chatUpdate(room) {
  var msgs = $("chatMsgs"); if (!msgs || !room.chat) return;
  var list = Object.keys(room.chat).map(function (k) { return room.chat[k]; }).filter(function (m) { return m && typeof m.m === "string" && typeof m.t === "number"; })
    .sort(function (a, b) { return a.t - b.t; });
  var fresh = list.filter(function (m) { return m.t > O.chatSeen; });
  if (!fresh.length) return;
  O.chatSeen = list[list.length - 1].t;
  fresh.forEach(function (m) {
    var d = document.createElement("div"), b = document.createElement("b");
    var nm = m.s === 0 ? (room.host && room.host.name) : (room.guest && room.guest.name);
    b.textContent = (nm || "?") + ": "; d.appendChild(b);
    d.appendChild(document.createTextNode(clean(m.m).slice(0, 40)));
    msgs.appendChild(d);
  });
  while (msgs.children.length > 30) msgs.removeChild(msgs.firstChild);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ---------- Dialog ---------- */
var dlg = $("dlgOnline");
function openDialog() { try { dlg.showModal(); } catch (e) { dlg.setAttribute("open", ""); } }
function closeDialog() { try { dlg.close(); } catch (e) { dlg.removeAttribute("open"); } }
function el(tag, attrs, kids) {
  var e = document.createElement(tag);
  Object.keys(attrs || {}).forEach(function (k) {
    if (k === "text") e.textContent = attrs[k]; else if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]);
  });
  (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
  return e;
}
function mask(em) { em = String(em || ""); var i = em.indexOf("@"); return i > 1 ? em.charAt(0) + "•••" + em.slice(i) : em; }
function render() {
  var body = $("onBody"); if (!body) return;
  $("onTitle").textContent = T("title");
  $("onClose").textContent = T("close");
  body.textContent = "";
  var st = el("div", { class: "stack" });
  if (!ON) { st.appendChild(el("p", { class: "note", text: T("notReady") })); body.appendChild(st); return; }
  if (O && O.started) {
    st.appendChild(el("p", { text: T("inGame") + " " + O.code + "." }));
    var lv = el("button", { type: "button", class: "cta", text: T("leave") });
    lv.addEventListener("click", function () { leave(); closeDialog(); });
    st.appendChild(lv); body.appendChild(st); return;
  }
  if (O && !O.started) {
    st.appendChild(el("p", { text: T("waitTitle") }));
    st.appendChild(el("div", { class: "codebig", text: O.code }));
    st.appendChild(el("p", { class: "note", text: T("waitNote") }));
    var cp = el("button", { type: "button", class: "cta", text: T("copy") });
    cp.addEventListener("click", function () {
      var done = function () { cp.textContent = T("copied"); setTimeout(function () { cp.textContent = T("copy"); }, 1500); };
      try { navigator.clipboard.writeText(O.code).then(done, done); } catch (e) { done(); }
    });
    st.appendChild(cp);
    if (navigator.share) {
      var sh = el("button", { type: "button", class: "ghost", text: T("share") });
      sh.addEventListener("click", function () { try { navigator.share({ text: X[lang()].sharetext(O.code) }).catch(function () {}); } catch (e) {} });
      st.appendChild(sh);
    }
    var cn = el("button", { type: "button", class: "ghost", text: T("cancel") });
    cn.addEventListener("click", function () { leave(); closeDialog(); });
    st.appendChild(cn); body.appendChild(st);
    if (err) body.appendChild(el("p", { class: "err", role: "alert", text: err }));
    return;
  }
  if (!A) {
    st.appendChild(el("p", { class: "note", text: T("intro") }));
    var mailIn = el("input", { class: "fld", id: "on-mail", type: "email", inputmode: "email", autocomplete: "username", autocapitalize: "off", spellcheck: "false", maxlength: "120", placeholder: T("email"), "aria-label": T("email"), value: mailDraft });
    mailIn.addEventListener("input", function () { mailDraft = mailIn.value; });
    st.appendChild(mailIn);
    st.appendChild(el("input", { class: "fld", id: "on-pw", type: "password", autocomplete: "current-password", maxlength: "100", placeholder: T("password"), "aria-label": T("password") }));
    var si = el("button", { type: "button", class: "cta", text: T("signIn") }), cr = el("button", { type: "button", class: "ghost", text: T("create") });
    if (busy) { si.disabled = true; cr.disabled = true; }
    si.addEventListener("click", function () { doEmail(false); });
    cr.addEventListener("click", function () { doEmail(true); });
    st.appendChild(si); st.appendChild(cr);
    if (GID) { st.appendChild(el("div", { class: "or", text: T("or") })); st.appendChild(el("div", { id: "on-g" })); }
    var fg = el("button", { type: "button", class: "linkbtn", text: T("forgot") });
    fg.addEventListener("click", doReset); st.appendChild(fg);
    body.appendChild(st);
    if (note) body.appendChild(el("p", { class: "note", role: "status", text: note }));
    if (err) body.appendChild(el("p", { class: "err", role: "alert", text: err }));
    if (GID) mountGoogle();
    return;
  }
  st.appendChild(el("p", { class: "note", text: T("signedIn") + " " + mask(A.email) }));
  st.appendChild(el("label", { class: "note", for: "on-name", text: T("yourName") }));
  var nameIn = el("input", { class: "fld", id: "on-name", type: "text", maxlength: "12", autocomplete: "nickname", value: nameDraft || (profile && profile.name) || cleanName(G.name()) });
  nameIn.addEventListener("input", function () { nameDraft = nameIn.value; });
  st.appendChild(nameIn);
  var ng = el("button", { type: "button", class: "cta", text: T("newGame") });
  if (busy) ng.disabled = true;
  ng.addEventListener("click", createGame); st.appendChild(ng);
  st.appendChild(el("p", { class: "note", text: T("joinHead") }));
  var codeIn = el("input", { class: "fld", id: "on-code", type: "text", maxlength: "6", autocomplete: "off", autocapitalize: "characters", spellcheck: "false", placeholder: T("code"), "aria-label": T("code"), value: codeDraft });
  codeIn.addEventListener("input", function () { codeDraft = codeIn.value; });
  st.appendChild(codeIn);
  var jn = el("button", { type: "button", class: "ghost", text: T("join") });
  if (busy) jn.disabled = true;
  jn.addEventListener("click", function () { joinGame($("on-code").value, false); }); st.appendChild(jn);
  var so = el("button", { type: "button", class: "linkbtn", text: T("signOut") });
  so.addEventListener("click", function () { signOutUser(); }); st.appendChild(so);
  body.appendChild(st);
  if (note) body.appendChild(el("p", { class: "note", role: "status", text: note }));
  if (err) body.appendChild(el("p", { class: "err", role: "alert", text: err }));
}
function signOutUser() {
  if (O) leave(true);
  A = null; tok = null; profile = null; saveAuth(); err = ""; note = ""; render();
}
var gsiTried = false;
function mountGoogle() {
  var box = $("on-g"); if (!box) return;
  function go() {
    try {
      window.google.accounts.id.initialize({ client_id: GID, callback: function (r) { doGoogle(r && r.credential); } });
      window.google.accounts.id.renderButton(box, { theme: "outline", size: "large", width: 260, text: "continue_with" });
    } catch (e) {}
  }
  if (window.google && window.google.accounts && window.google.accounts.id) { go(); return; }
  if (gsiTried) return; gsiTried = true;
  var s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
  s.onload = function () { gsiTried = false; if (!A && $("on-g")) go(); };
  s.onerror = function () { gsiTried = false; };
  document.head.appendChild(s);
}

/* ---------- Wiring ---------- */
$("btnOnline").addEventListener("click", function () {
  G.audio(); err = ""; note = "";
  if (A && !profile) loadProfile().then(render);
  render(); openDialog();
});
$("onClose").addEventListener("click", closeDialog);
$("chatForm").addEventListener("submit", function (e) { e.preventDefault(); var i = $("chatIn"); chatSend(i.value); i.value = ""; });
EMOJIS.forEach(function (em) {
  var b = el("button", { type: "button", text: em, "aria-label": em });
  b.addEventListener("click", function () { chatSend(em); });
  $("chatEmojis").appendChild(b);
});
document.addEventListener("visibilitychange", function () { if (!document.hidden && O) { pollNow(); if (!O.es) openStream(); } });
window.addEventListener("online", function () { if (O) { pollNow(); if (!O.es) openStream(); flush(); } });

window.WureOnline = {
  sendMove: sendMove, pump: pump, leave: leave,
  relang: function () { $("chatIn").placeholder = T("chatPh"); $("chatSend").textContent = T("send"); render(); }
};
window.WureOnline.relang();

// Coming back to a game that was in progress (page reloaded, app reopened)
var saved = readJSON("wure-room");
if (ON && A && saved && /^[A-Z0-9]{6}$/.test(saved.code || "")) {
  loadProfile().then(function () { return joinGame(saved.code, true); });
}
})();
