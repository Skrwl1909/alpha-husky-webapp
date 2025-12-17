// js/arena.js — Pet Arena Replay (minimal)
(function () {
  function el(id) { return document.getElementById(id); }
  function esc(s){ return String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  window.Arena = {
    _apiPost: null,
    _tg: null,
    _dbg: false,

    init({ apiPost, tg, dbg }) {
      this._apiPost = apiPost || null;
      this._tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
      this._dbg = !!dbg;
    },

    async open(battleId) {
      document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach(x => x.style.display = "none");

      document.body.dataset.prevOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";

      const container = el("app") || document.body;
      container.innerHTML = `
        <style>
          @keyframes atkL {0%{transform:translateX(0);}50%{transform:translateX(28px);}100%{transform:translateX(0);}}
          @keyframes atkR {0%{transform:translateX(0);}50%{transform:translateX(-28px);}100%{transform:translateX(0);}}
          @keyframes hit  {0%,100%{transform:scale(1);}25%{transform:scale(1.06) rotate(-2deg);}75%{transform:scale(0.98) rotate(2deg);}}
          @keyframes fly  {0%{opacity:1; transform:translateY(0) scale(1);}100%{opacity:0; transform:translateY(-60px) scale(1.25);}}
          .atkL{animation:atkL .55s;}
          .atkR{animation:atkR .55s;}
          .hit{animation:hit .45s;}
          .dmg{position:absolute;font-weight:800;font-size:20px;pointer-events:none;animation:fly .8s forwards;}
          .bar{height:12px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);overflow:hidden;}
          .fill{height:100%;width:100%;transition:width .35s;}
          .card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;}
        </style>

        <div style="padding:14px;color:#fff;max-width:680px;margin:0 auto;font-family:system-ui;height:78vh;display:flex;flex-direction:column;gap:10px;">
          <div class="card">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
              <div style="min-width:0">
                <div style="font-weight:800">Pet Arena Replay</div>
                <div id="arena-meta" style="opacity:.85;font-size:13px;margin-top:2px;">loading…</div>
              </div>
              <button id="arena-close" type="button" style="padding:10px 12px;border-radius:12px;border:0;cursor:pointer;">Close</button>
            </div>
          </div>

          <div class="card" style="flex:1;min-height:0;position:relative;overflow:hidden;">
            <div style="display:flex;gap:10px;align-items:center;">
              <div style="flex:1;min-width:0">
                <div id="you-name" style="font-weight:800;"></div>
                <div class="bar" style="margin-top:6px;"><div id="you-fill" class="fill"></div></div>
              </div>
              <div style="flex:1;min-width:0;text-align:right">
                <div id="foe-name" style="font-weight:800;"></div>
                <div class="bar" style="margin-top:6px;"><div id="foe-fill" class="fill"></div></div>
              </div>
            </div>

            <div style="position:absolute;left:0;right:0;bottom:18px;display:flex;justify-content:space-between;padding:0 16px;">
              <div id="you-sprite" style="width:42%;height:64%;display:flex;align-items:flex-end;justify-content:center;position:relative;">
                <div id="you-icon" style="font-size:64px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.45));">🐺</div>
              </div>
              <div id="foe-sprite" style="width:42%;height:64%;display:flex;align-items:flex-end;justify-content:center;position:relative;">
                <div id="foe-icon" style="font-size:64px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.45));transform:scaleX(-1);">🐺</div>
              </div>
            </div>

            <div id="result" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
              font-weight:900;font-size:42px;opacity:0;transition:opacity .6s; text-shadow:0 10px 30px rgba(0,0,0,.6);">
            </div>
          </div>

          <button id="arena-replay" type="button" style="width:100%;padding:14px;border-radius:12px;border:0;cursor:pointer;">
            Replay Again
          </button>
        </div>
      `;

      el("arena-close").onclick = () => {
        document.body.style.overflow = document.body.dataset.prevOverflow || "";
        delete document.body.dataset.prevOverflow;
        if (window.Map?.open) return window.Map.open();
        window.location.reload();
      };

      el("arena-replay").onclick = () => this.open(battleId);

      const res = await this._apiPost("/webapp/arena/replay", { battle_id: battleId });
      if (!res?.ok) {
        el("arena-meta").textContent = "Replay not found.";
        return;
      }
      await this.play(res.data);
    },

    _stepPerspective(step, youAreP1) {
      const dmg = Number(step.dmg || 0);
      const crit = !!step.crit;
      const who = step.who; // "player" = p1
      const pHp = Number(step.pHp || 0);
      const eHp = Number(step.eHp || 0);

      if (youAreP1) {
        return { youAttacked: (who === "player"), dmg, crit, youHp: pHp, foeHp: eHp };
      } else {
        return { youAttacked: (who !== "player"), dmg, crit, youHp: eHp, foeHp: pHp };
      }
    },

    async play(data) {
      const youAreP1 = !!data.you_are_p1;

      const you = youAreP1 ? data.p1 : data.p2;
      const foe = youAreP1 ? data.p2 : data.p1;

      el("you-name").textContent = you?.name || "You";
      el("foe-name").textContent = foe?.name || "Enemy";

      const wager = Number(data.match_wager || 0);
      el("arena-meta").textContent = `Wager: ${wager} • Turns: ${(data.steps||[]).length}`;

      // HP setup
      const youMax = Math.max(1, Number(you?.hpMax || 100));
      const foeMax = Math.max(1, Number(foe?.hpMax || 100));
      let youHp = youMax, foeHp = foeMax;

      el("you-fill").style.width = "100%";
      el("foe-fill").style.width = "100%";

      const youSprite = el("you-sprite");
      const foeSprite = el("foe-sprite");
      const youIcon = el("you-icon");
      const foeIcon = el("foe-icon");
      const result = el("result");
      result.style.opacity = 0;

      const steps = data.steps || [];
      for (const st of steps) {
        const p = this._stepPerspective(st, youAreP1);

        // animate attack
        const attacker = p.youAttacked ? youIcon : foeIcon;
        const target   = p.youAttacked ? foeIcon : youIcon;

        attacker.classList.add(p.youAttacked ? "atkL" : "atkR");
        setTimeout(() => attacker.classList.remove(p.youAttacked ? "atkL" : "atkR"), 560);

        await sleep(220);

        target.classList.add("hit");
        setTimeout(() => target.classList.remove("hit"), 460);

        // dmg pop
        const dmgEl = document.createElement("div");
        dmgEl.className = "dmg";
        dmgEl.textContent = `-${p.dmg}${p.crit ? " CRIT!" : ""}`;
        dmgEl.style.left = "50%";
        dmgEl.style.top = "48%";
        dmgEl.style.transform = "translate(-50%,-50%)";
        dmgEl.style.color = p.crit ? "#ffd166" : "#ff5d5d";
        (p.youAttacked ? foeSprite : youSprite).appendChild(dmgEl);
        setTimeout(() => dmgEl.remove(), 900);

        // hp update (use step hp values)
        youHp = Math.max(0, Number(p.youHp || youHp));
        foeHp = Math.max(0, Number(p.foeHp || foeHp));

        el("you-fill").style.width = `${Math.round((youHp / youMax) * 100)}%`;
        el("foe-fill").style.width = `${Math.round((foeHp / foeMax) * 100)}%`;

        // haptics
        try { this._tg?.HapticFeedback?.impactOccurred?.("light"); } catch(e){}

        await sleep(520);
      }

      const youWon = String(data.winner_uid) === (youAreP1 ? String(data.p1_uid) : String(data.p2_uid));
      result.textContent = youWon ? "🏆 VICTORY!" : "💀 DEFEAT";
      result.style.opacity = 1;
    }
  };
})();
