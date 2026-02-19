// js/tonwallet.js — TON Connect UI (vanilla) for Alpha Husky WebApp
// Requires: <script src="https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js"></script>
// HTML: <div id="ton-connect"></div> <div id="ton-wallet-status"></div>
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _tcui = null;

  const el = (id) => document.getElementById(id);
  const log = (...a) => { if (_dbg) console.log("[TON]", ...a); };

  function rid(prefix = "ton") {
    try { return `${prefix}:${crypto.randomUUID()}`; }
    catch { return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e6)}`; }
  }

  function shortAddr(addr) {
    const a = String(addr || "");
    if (a.length <= 14) return a;
    return a.slice(0, 6) + "…" + a.slice(-6);
  }

  function setStatus(text) {
    const s = el("ton-wallet-status");
    if (s) s.textContent = text || "";
  }

  function saveAddr(addr) {
    try { localStorage.setItem("ah_ton_addr", addr || ""); } catch (_) {}
  }

  function loadAddr() {
    try { return localStorage.getItem("ah_ton_addr") || ""; } catch (_) { return ""; }
  }

  // TON amount "0.25" -> "250000000" nanotons (string)
  function tonToNano(ton) {
    const v = String(ton ?? "").trim();
    if (!v) return "0";
    const [iRaw, fRaw = ""] = v.split(".");
    const i = (iRaw || "0").replace(/^0+(?=\d)/, "") || "0";
    const f = (fRaw + "000000000").slice(0, 9);
    return String(BigInt(i) * 1000000000n + BigInt(f || "0"));
  }

  async function linkWalletToBackend(wallet) {
    if (!_apiPost) return;
    const address = wallet?.account?.address || "";
    if (!address) return;

    const payload = {
      run_id: rid("wallet_link"),
      address,
      chain: wallet?.account?.chain || "",
      walletApp: wallet?.device?.appName || "",
      walletPlatform: wallet?.device?.platform || ""
    };

    try {
      const res = await _apiPost("/webapp/wallet/link", payload);
      log("link ok:", res);
    } catch (e) {
      console.warn("[TON] /wallet/link failed:", e?.message || e);
    }
  }

  async function unlinkWalletToBackend() {
    if (!_apiPost) return;
    try {
      await _apiPost("/webapp/wallet/unlink", { run_id: rid("wallet_unlink") });
    } catch (e) {
      console.warn("[TON] /wallet/unlink failed:", e?.message || e);
    }
  }

  async function sendTon(toAddress, tonAmount) {
    if (!_tcui) throw new Error("TonConnect UI not initialized");
    const wallet = _tcui.wallet;
    if (!wallet?.account?.address) throw new Error("Wallet not connected");

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 120,
      messages: [{
        address: String(toAddress || "").trim(),
        amount: tonToNano(tonAmount)
      }]
    };

    log("sendTransaction:", tx);
    return await _tcui.sendTransaction(tx);
  }

  // opcjonalny helper — podmień receiver/price jak będziesz gotowy
  async function buySupportPack() {
    const receiver = "EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // TODO: Twój adres
    const priceTon = "0.25";
    const res = await sendTon(receiver, priceTon);
    setStatus("Payment sent ✅");
    return res;
  }

  async function init(opts = {}) {
    _apiPost = opts.apiPost || _apiPost || window.apiPost || window.S?.apiPost || null;
    _tg = opts.tg || _tg || window.Telegram?.WebApp || null;
    _dbg = !!(opts.dbg ?? _dbg);

    const buttonRootId = opts.buttonRootId || "ton-connect";
    const manifestUrl = opts.manifestUrl || (location.origin + "/tonconnect-manifest.json");

    if (!_apiPost) console.warn("[TON] apiPost missing");
    if (!_tg) log("tg missing (ok for browser testing)");
    if (!window.TON_CONNECT_UI?.TonConnectUI) {
      console.warn("[TON] TON Connect UI not found. CDN script missing?");
      return null;
    }

    if (!_tcui) {
      _tcui = new window.TON_CONNECT_UI.TonConnectUI({
        manifestUrl,
        buttonRootId
      });

      // init status
      const w = _tcui.wallet;
      if (w?.account?.address) {
        saveAddr(w.account.address);
        setStatus("Connected: " + shortAddr(w.account.address));
      } else {
        const cached = loadAddr();
        setStatus(cached ? ("Last: " + shortAddr(cached)) : "Wallet: not connected");
      }

      _tcui.onStatusChange(async (wallet) => {
        if (!wallet) {
          saveAddr("");
          setStatus("Wallet: disconnected");
          await unlinkWalletToBackend();
          return;
        }
        const addr = wallet.account?.address || "";
        saveAddr(addr);
        setStatus("Connected: " + shortAddr(addr));
        await linkWalletToBackend(wallet);
      });

      log("TonWallet ready", { manifestUrl, buttonRootId });
    }

    return _tcui;
  }

  window.TonWallet = {
    init,
    sendTon,
    buySupportPack,
    unlink: unlinkWalletToBackend,
    getAddress: () => _tcui?.wallet?.account?.address || null,
    isConnected: () => !!_tcui?.wallet?.account?.address,
    shortAddr
  };
})();
