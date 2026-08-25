export const TACTICAL_CSS = `#tacticalOpsRoot{--t-font-display:"Rajdhani", "Trebuchet MS", sans-serif;--t-font-sans:"Source Sans 3", "Segoe UI", system-ui, sans-serif;--t-bg:#0a0c10;--t-surface:#10141a;--t-elevated:#171d24;--t-fg:#e8edf2;--t-muted:#8a93a0;--t-faint:#5c6570;--t-line:#2a313a;--t-ally:#3ec6ff;--t-ally-dim:#163a4c;--t-enemy:#e23d3d;--t-enemy-dim:#4a1818;--t-heal:#6fbf8a;--t-radius-sm:6px;--t-radius-md:10px;--t-radius-lg:14px;z-index:1500;pointer-events:none;visibility:hidden;width:100%;height:100%;height:100dvh;color:var(--t-fg);font-family:var(--t-font-sans);background:var(--t-bg);-webkit-tap-highlight-color:transparent;overscroll-behavior:none;touch-action:none;position:fixed;top:0;bottom:0;left:0;right:0;overflow:hidden}#tacticalOpsRoot[data-open="1"]{pointer-events:auto;visibility:visible;touch-action:manipulation}#tacticalOpsRoot,#tacticalOpsRoot *{box-sizing:border-box}#tacticalOpsRoot button:not(:disabled),#tacticalOpsRoot [role=button]:not(:disabled){cursor:pointer}#tacticalOpsRoot .t-ico{flex-shrink:0;width:16px;height:16px}#tacticalOpsRoot .t-rotate-gate{display:none}@media (orientation:portrait) and (max-width:900px){#tacticalOpsRoot .t-battle .t-rotate-gate{z-index:80;text-align:center;pointer-events:auto;background:#0a0c10e0;place-items:center;padding:1.5rem;display:grid;position:absolute;top:0;bottom:0;left:0;right:0}#tacticalOpsRoot .t-rotate-gate strong{font-family:var(--t-font-display);letter-spacing:.22em;text-transform:uppercase;color:var(--t-ally);margin-bottom:.6rem;font-size:1.05rem;display:block}#tacticalOpsRoot .t-rotate-gate span{color:var(--t-muted);font-size:.92rem;line-height:1.4}}#tacticalOpsRoot .t-shell{height:100dvh;background:var(--t-bg);width:100%;height:100svh;color:var(--t-fg);font-family:var(--t-font-sans);-webkit-user-select:none;-moz-user-select:none;user-select:none;touch-action:manipulation;position:relative;overflow:hidden}#tacticalOpsRoot .t-boot{background:var(--t-bg);height:100dvh;color:var(--t-muted);font-family:var(--t-font-display);letter-spacing:.28em;justify-content:center;align-items:center;font-size:.8rem;display:flex}#tacticalOpsRoot .t-fill{position:absolute;top:0;bottom:0;left:0;right:0}#tacticalOpsRoot .t-bg{background:radial-gradient(120% 80% at 20% 40%, #143c5047, transparent 55%), radial-gradient(100% 80% at 85% 45%, #50101052, transparent 50%), var(--t-bg);position:absolute;top:0;bottom:0;left:0;right:0}#tacticalOpsRoot .t-bg img{object-fit:cover;opacity:.55;filter:saturate(.85)brightness(.72);width:100%;height:100%}#tacticalOpsRoot .t-vignette{pointer-events:none;background:linear-gradient(#0a0c108c 0%,#0000 18%,#0000 78%,#0a0c10b8 100%),radial-gradient(#0000 42%,#0a0c108c 100%);position:absolute;top:0;bottom:0;left:0;right:0}#tacticalOpsRoot .t-panel{background:#0c1014d1;border:1px solid #e8edf21a;box-shadow:0 10px 40px #00000059}#tacticalOpsRoot .t-kicker{font-family:var(--t-font-display);letter-spacing:.28em;text-transform:uppercase;color:var(--t-ally);font-size:.68rem;font-weight:600}#tacticalOpsRoot .t-title{font-family:var(--t-font-display);letter-spacing:.08em;text-transform:uppercase;font-weight:700;line-height:.95}#tacticalOpsRoot .t-btn{min-height:48px;font-family:var(--t-font-display);letter-spacing:.16em;text-transform:uppercase;color:var(--t-fg);border-radius:var(--t-radius-sm);background:#171d24eb;border:1px solid #e8edf229;justify-content:center;align-items:center;gap:.5rem;padding:0 1.25rem;font-size:.92rem;font-weight:700;transition:transform .15s cubic-bezier(.22,1,.36,1),background .15s,border-color .15s;display:inline-flex}#tacticalOpsRoot .t-btn:hover:not(:disabled){background:#1e2a34f2;border-color:#3ec6ff8c}#tacticalOpsRoot .t-btn:active:not(:disabled){transform:scale(.98)}#tacticalOpsRoot .t-btn:disabled{opacity:.38}#tacticalOpsRoot .t-btn-primary{color:var(--t-ally);background:#3ec6ff24;border-color:#3ec6ff8c}#tacticalOpsRoot .t-btn-primary:hover:not(:disabled){background:#3ec6ff38}#tacticalOpsRoot .t-btn-ghost{background:0 0}#tacticalOpsRoot .t-hub{height:100%;padding:max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right)) max(1.5rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));flex-direction:column;justify-content:flex-end;display:flex;position:relative}#tacticalOpsRoot .t-hub-copy{z-index:2;max-width:36rem;position:relative}#tacticalOpsRoot .t-hub h1{margin:.2rem 0 0;font-size:max(2.4rem,min(8vw,4.6rem))}#tacticalOpsRoot .t-hub h2{color:var(--t-muted);font-size:max(1.1rem,min(3vw,1.6rem));font-family:var(--t-font-display);letter-spacing:.32em;margin:.15rem 0 1.25rem;font-weight:600}#tacticalOpsRoot .t-op-card{border-radius:var(--t-radius-md);flex-direction:column;gap:.35rem;max-width:28rem;margin-bottom:1.15rem;padding:1rem 1.15rem;display:flex}#tacticalOpsRoot .t-op-card strong{font-family:var(--t-font-display);letter-spacing:.18em;font-size:1.05rem}#tacticalOpsRoot .t-op-card p{color:var(--t-muted);margin:0;font-size:.92rem;line-height:1.45}#tacticalOpsRoot .t-brief{z-index:2;height:100%;padding:max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1.1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));flex-direction:column;display:flex;position:relative}#tacticalOpsRoot .t-brief-grid{grid-template-columns:1fr;gap:.75rem;margin:1rem 0 auto;display:grid;overflow:auto}@media (min-width:800px){#tacticalOpsRoot .t-brief-grid{grid-template-columns:1.1fr .9fr}}#tacticalOpsRoot .t-brief-block{border-radius:var(--t-radius-md);padding:.95rem 1rem}#tacticalOpsRoot .t-brief-block h3{font-family:var(--t-font-display);letter-spacing:.2em;color:var(--t-muted);margin:0 0 .55rem;font-size:.78rem}#tacticalOpsRoot .t-unit-row{border-bottom:1px solid #e8edf20f;align-items:center;gap:.7rem;padding:.45rem 0;display:flex}#tacticalOpsRoot .t-unit-row:last-child{border-bottom:0}#tacticalOpsRoot .t-unit-row img,#tacticalOpsRoot .t-unit-ph{object-fit:cover;object-position:50% 28%;background:var(--t-elevated);border:1px solid #3ec6ff40;border-radius:4px;width:42px;height:42px}#tacticalOpsRoot .t-unit-ph.enemy{border-color:#e23d3d66}#tacticalOpsRoot .t-brief-actions{flex-wrap:wrap;gap:.7rem;display:flex}#tacticalOpsRoot .t-overlay{z-index:50;background:#0a0c109e;justify-content:center;align-items:center;padding:1rem;display:flex;position:absolute;top:0;bottom:0;left:0;right:0}#tacticalOpsRoot .t-modal{border-radius:var(--t-radius-lg);text-align:center;width:min(420px,100%);padding:1.4rem 1.3rem 1.2rem}#tacticalOpsRoot .t-modal h2{margin:.2rem 0 .7rem;font-size:max(1.6rem,min(4vw,2.2rem))}#tacticalOpsRoot .t-stats{text-align:left;grid-template-columns:1fr 1fr;gap:.55rem 1rem;margin:1rem 0 1.2rem;display:grid}#tacticalOpsRoot .t-stats dt{font-family:var(--t-font-display);letter-spacing:.12em;color:var(--t-muted);text-transform:uppercase;font-size:.68rem}#tacticalOpsRoot .t-stats dd{font-family:var(--t-font-display);font-variant-numeric:tabular-nums;margin:.1rem 0 0;font-size:1.25rem;font-weight:700;white-space:nowrap}#tacticalOpsRoot .t-mock{color:var(--t-faint);letter-spacing:.08em;text-transform:uppercase;grid-column:1/-1;font-size:.72rem}#tacticalOpsRoot .t-battle{grid-template-rows:auto 1fr auto;height:100%;display:grid;position:relative}#tacticalOpsRoot .t-top{z-index:30;padding:max(.55rem, env(safe-area-inset-top)) max(.7rem, env(safe-area-inset-right)) .35rem max(.7rem, env(safe-area-inset-left));pointer-events:none;grid-template-columns:1fr auto 1fr;align-items:start;gap:.5rem;display:grid;position:relative}#tacticalOpsRoot .t-top>*{pointer-events:auto}#tacticalOpsRoot .t-brand{align-items:center;gap:.55rem;min-width:0;display:flex}#tacticalOpsRoot .t-brand img{object-fit:cover;border:1px solid #3ec6ff59;border-radius:4px;width:42px;height:42px}#tacticalOpsRoot .t-brand h1{letter-spacing:.12em;margin:0;font-size:max(.95rem,min(2.4vw,1.15rem))}#tacticalOpsRoot .t-brand p{font-family:var(--t-font-display);letter-spacing:.22em;color:var(--t-ally);margin:0;font-size:.62rem}#tacticalOpsRoot .t-turn{text-align:center}#tacticalOpsRoot .t-turn strong{font-family:var(--t-font-display);letter-spacing:.28em;font-size:max(1.05rem,min(3vw,1.35rem));display:block}#tacticalOpsRoot .t-turn span{font-family:var(--t-font-display);letter-spacing:.22em;color:var(--t-muted);font-size:.62rem;display:block}#tacticalOpsRoot .t-pips{justify-content:center;gap:.28rem;margin-top:.2rem;display:flex}#tacticalOpsRoot .t-pip{border:1px solid #3ec6ffb3;width:7px;height:7px;transform:rotate(45deg)}#tacticalOpsRoot .t-pip.on{background:var(--t-ally)}#tacticalOpsRoot .t-pip.enemy{background:var(--t-enemy);border-color:#e23d3dcc}#tacticalOpsRoot .t-obj{text-align:right;font-family:var(--t-font-display);letter-spacing:.16em;color:var(--t-enemy);justify-self:end;font-size:.68rem}#tacticalOpsRoot .t-obj small{color:var(--t-muted);letter-spacing:.14em;margin-top:.1rem;display:block}#tacticalOpsRoot .t-field-wrap{min-height:0;position:relative}#tacticalOpsRoot .t-field{position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden}#tacticalOpsRoot .t-field-art{object-fit:cover;object-position:50% 55%;width:100%;height:100%;position:absolute;top:0;bottom:0;left:0;right:0}#tacticalOpsRoot .t-cell{z-index:8;background:0 0;border:0;border-radius:999px;width:44px;min-width:44px;height:44px;min-height:44px;padding:0;position:absolute;transform:translate(-50%,-50%)}#tacticalOpsRoot .t-cell.move:after{content:"";background:radial-gradient(circle,#3ec6ff8c 0%,#3ec6ff14 70%,#0000 72%);border:1px solid #3ec6ffb3;border-radius:999px;width:16px;height:16px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 0 10px #3ec6ff40}#tacticalOpsRoot .t-cell.move:hover:after{background:radial-gradient(circle,#3ec6ffbf 0%,#3ec6ff1f 70%,#0000 72%);width:20px;height:20px}#tacticalOpsRoot .t-cell.move:focus-visible:after{background:radial-gradient(circle,#3ec6ffbf 0%,#3ec6ff1f 70%,#0000 72%);width:20px;height:20px}#tacticalOpsRoot .t-token{z-index:4;pointer-events:none;width:12.5%;min-width:64px;max-width:132px;transition:left .28s cubic-bezier(.22,1,.36,1),top .28s cubic-bezier(.22,1,.36,1),opacity .28s,filter .2s;position:absolute;transform:translate(-50%,-86%)}#tacticalOpsRoot .t-token.leader{width:16.5%;min-width:84px;max-width:168px}#tacticalOpsRoot .t-token.hound{width:14.5%;min-width:72px;max-width:148px}#tacticalOpsRoot .t-token.defeated{opacity:0;pointer-events:none;filter:grayscale()brightness(.4)}#tacticalOpsRoot .t-token.acted:not(.selected){filter:saturate(.7)brightness(.82)}#tacticalOpsRoot .t-token.targetable:not(.defeated) .t-ring{filter:drop-shadow(0 0 8px #e23d3dd9)}#tacticalOpsRoot .t-token.targetable.ally:not(.defeated) .t-ring{filter:drop-shadow(0 0 8px #3ec6ffd9)}#tacticalOpsRoot .t-token.attacking img.body{animation:.38s cubic-bezier(.22,1,.36,1) t-lunge}#tacticalOpsRoot .t-token.enemy.attacking img.body{animation:.38s cubic-bezier(.22,1,.36,1) t-lunge-left}#tacticalOpsRoot .t-ring{pointer-events:none;width:92%;position:absolute;bottom:4%;left:50%;transform:translate(-50%)}#tacticalOpsRoot .t-token.ally .t-ring{color:var(--t-ally)}#tacticalOpsRoot .t-token.enemy .t-ring{color:var(--t-enemy)}#tacticalOpsRoot .t-hit{pointer-events:auto;z-index:2;background:0 0;border:0;width:44px;height:56px;min-height:44px;padding:0;position:absolute;bottom:6%;left:50%;transform:translate(-50%)}#tacticalOpsRoot .t-token img.body{pointer-events:none;filter:drop-shadow(0 10px 12px #0000008c);width:100%;height:auto;display:block}#tacticalOpsRoot .t-plate{pointer-events:none;background:#0a0c10eb;border:1px solid #e8edf21f;border-radius:3px;min-width:72px;max-width:104px;padding:.1rem .3rem .14rem;position:absolute;top:-34px;bottom:auto;left:50%;right:auto;transform:translate(-50%)}#tacticalOpsRoot .t-token.enemy .t-plate{border-color:#e23d3d73;left:50%;right:auto;transform:translate(-50%)}#tacticalOpsRoot .t-token.ally .t-plate{border-color:#3ec6ff61}#tacticalOpsRoot .t-plate-name{font-family:var(--t-font-display);letter-spacing:.1em;white-space:nowrap;justify-content:space-between;align-items:center;gap:.35rem;font-size:.68rem;font-weight:700;display:flex}#tacticalOpsRoot .t-hp{align-items:center;gap:.3rem;margin-top:.12rem;display:flex}#tacticalOpsRoot .t-hp-bar{background:#e8edf21f;border-radius:99px;flex:1;height:4px;overflow:hidden}#tacticalOpsRoot .t-hp-bar>i{background:var(--t-ally);width:0;height:100%;transition:width .28s cubic-bezier(.22,1,.36,1);display:block}#tacticalOpsRoot .t-token.enemy .t-hp-bar>i{background:var(--t-enemy)}#tacticalOpsRoot .t-hp-num{font-family:var(--t-font-display);font-variant-numeric:tabular-nums;color:var(--t-muted);font-size:.62rem}#tacticalOpsRoot .t-guard-tag{color:var(--t-ally);letter-spacing:.12em;font-size:.58rem}#tacticalOpsRoot .t-float{font-family:var(--t-font-display);letter-spacing:.06em;pointer-events:none;z-index:20;text-shadow:0 2px 8px #000c;font-size:1rem;font-weight:700;animation:.9s cubic-bezier(.22,1,.36,1) forwards t-float;position:absolute;transform:translate(-50%,-120%)}#tacticalOpsRoot .t-float.dmg{color:#ff6b6b}#tacticalOpsRoot .t-float.heal{color:var(--t-heal)}#tacticalOpsRoot .t-float.guard,#tacticalOpsRoot .t-float.info{color:var(--t-ally);font-size:.78rem}#tacticalOpsRoot .t-impact{pointer-events:none;z-index:18;border:2px solid #e8edf2d9;border-radius:99px;width:54px;height:54px;animation:.38s ease-out forwards t-impact;position:absolute;transform:translate(-50%,-50%)}#tacticalOpsRoot .t-dock{z-index:30;padding:.4rem max(.7rem, env(safe-area-inset-right)) max(.7rem, env(safe-area-inset-bottom)) max(.7rem, env(safe-area-inset-left));background:linear-gradient(#0000,#0a0c10c7 40%);grid-template-columns:auto 1fr auto;align-items:end;gap:.5rem;display:grid;position:relative}#tacticalOpsRoot .t-icon-btn{border-radius:var(--t-radius-sm);width:44px;height:44px;color:var(--t-fg);background:#10141acc;border:1px solid #e8edf21f;place-items:center;display:grid}#tacticalOpsRoot .t-actions{grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem;width:100%;max-width:42rem;margin:0 auto;display:grid}#tacticalOpsRoot .t-act{text-align:left;min-height:58px;color:var(--t-fg);border-radius:var(--t-radius-sm);background:#0e1218e0;border:1px solid #e8edf21f;flex-direction:column;align-items:flex-start;gap:.05rem;padding:.45rem .55rem .5rem;transition:border-color .15s,background .15s,transform .15s cubic-bezier(.22,1,.36,1);display:flex}#tacticalOpsRoot .t-act .row{font-family:var(--t-font-display);letter-spacing:.16em;align-items:center;gap:.4rem;font-size:.82rem;font-weight:700;display:flex}#tacticalOpsRoot .t-act small{color:var(--t-muted);letter-spacing:.02em;font-size:.62rem;line-height:1.2}#tacticalOpsRoot .t-act:hover:not(:disabled){border-color:#3ec6ff73}#tacticalOpsRoot .t-act:active:not(:disabled){transform:scale(.985)}#tacticalOpsRoot .t-act.on{border-color:var(--t-ally);background:#3ec6ff1a}#tacticalOpsRoot .t-act:disabled{opacity:.38}#tacticalOpsRoot .t-end{letter-spacing:.18em;min-width:7.5rem;min-height:58px}#tacticalOpsRoot .t-end.pulse{border-color:#3ec6ffb3;box-shadow:0 0 0 1px #3ec6ff40}#tacticalOpsRoot .t-ticker{z-index:28;font-family:var(--t-font-display);letter-spacing:.16em;color:var(--t-fg);white-space:nowrap;text-overflow:ellipsis;background:#0a0c10b8;border:1px solid #e8edf21a;border-radius:99px;max-width:min(90vw,36rem);padding:.28rem .7rem;font-size:.72rem;position:absolute;top:6.1rem;left:50%;overflow:hidden;transform:translate(-50%)}#tacticalOpsRoot .t-banner{z-index:40;pointer-events:none;background:#0a0c1047;place-items:center;display:grid;position:absolute;top:0;bottom:0;left:0;right:0}#tacticalOpsRoot .t-banner span{font-family:var(--t-font-display);letter-spacing:.34em;background:#0a0c10b8;border:1px solid #e8edf22e;padding:.7rem 1.3rem;font-size:max(1.3rem,min(4vw,2.1rem));font-weight:700}#tacticalOpsRoot .t-hint{text-align:center;font-family:var(--t-font-display);letter-spacing:.16em;color:var(--t-faint);padding:.2rem .5rem 0;font-size:.62rem;display:none}@media (orientation:portrait) and (max-width:820px){#tacticalOpsRoot .t-hint{display:block}#tacticalOpsRoot .t-token{width:20%}#tacticalOpsRoot .t-token.leader{width:24%}#tacticalOpsRoot .t-token.hound{width:22%}#tacticalOpsRoot .t-plate{min-width:64px;top:-28px}#tacticalOpsRoot .t-top{grid-template-columns:1fr auto}#tacticalOpsRoot .t-obj,#tacticalOpsRoot .t-act small{display:none}#tacticalOpsRoot .t-end{letter-spacing:.1em;min-width:0;padding:0 .7rem;font-size:.78rem}#tacticalOpsRoot .t-dock{grid-template-columns:auto 1fr auto}}@media (orientation:landscape){#tacticalOpsRoot .t-battle{display:block}#tacticalOpsRoot .t-top,#tacticalOpsRoot .t-dock{position:absolute;left:0;right:0}#tacticalOpsRoot .t-top{top:0}#tacticalOpsRoot .t-dock{bottom:0}#tacticalOpsRoot .t-field-wrap{position:absolute;top:0;bottom:0;left:0;right:0}}@media (max-height:420px){#tacticalOpsRoot .t-brand img{width:34px;height:34px}#tacticalOpsRoot .t-act{min-height:48px;padding:.3rem .45rem}#tacticalOpsRoot .t-end{min-height:48px}#tacticalOpsRoot .t-act small{display:none}}@keyframes t-lunge{0%{transform:translate(0)}40%{transform:translate(10px)scale(1.04)}to{transform:translate(0)}}@keyframes t-lunge-left{0%{transform:translate(0)}40%{transform:translate(-10px)scale(1.04)}to{transform:translate(0)}}@keyframes t-float{0%{opacity:0;transform:translate(-50%,-80%)}18%{opacity:1}to{opacity:0;transform:translate(-50%,-160%)}}@keyframes t-impact{0%{opacity:.9;transform:translate(-50%,-50%)scale(.4)}to{opacity:0;transform:translate(-50%,-50%)scale(1.6)}}@media (prefers-reduced-motion:reduce){#tacticalOpsRoot .t-token,#tacticalOpsRoot .t-hp-bar>i,#tacticalOpsRoot .t-btn,#tacticalOpsRoot .t-act{transition:none}#tacticalOpsRoot .t-token.attacking img.body,#tacticalOpsRoot .t-float,#tacticalOpsRoot .t-impact{animation:none}}#tacticalOpsRoot .t-bg,#tacticalOpsRoot .t-vignette,#tacticalOpsRoot .t-field-art{pointer-events:none}#tacticalOpsRoot .t-hub,#tacticalOpsRoot .t-brief,#tacticalOpsRoot .t-hub-copy,#tacticalOpsRoot .t-brief-actions,#tacticalOpsRoot .t-overlay,#tacticalOpsRoot .t-modal{pointer-events:auto;z-index:2;position:relative}#tacticalOpsRoot .t-overlay{z-index:50;position:absolute}#tacticalOpsRoot .t-btn,#tacticalOpsRoot .t-act,#tacticalOpsRoot .t-icon-btn{touch-action:manipulation;-webkit-user-select:none;-moz-user-select:none;user-select:none}
#tacticalOpsRoot .t-order{display:flex;gap:.28rem;justify-content:center;align-items:center;pointer-events:auto;margin-top:.28rem}
#tacticalOpsRoot .t-order-unit{width:28px;height:28px;border-radius:4px;border:1px solid #e8edf233;overflow:hidden;position:relative;opacity:.55;flex-shrink:0;background:var(--t-elevated)}
#tacticalOpsRoot .t-order-unit img{width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block}
#tacticalOpsRoot .t-order-unit.active{opacity:1;border-color:var(--t-ally);box-shadow:0 0 0 1px #3ec6ff80;transform:scale(1.12)}
#tacticalOpsRoot .t-order-unit.enemy{border-color:#e23d3d66}
#tacticalOpsRoot .t-order-unit.enemy.active{border-color:var(--t-enemy);box-shadow:0 0 0 1px #e23d3d80}
#tacticalOpsRoot .t-token.active .t-ring{filter:drop-shadow(0 0 10px #3ec6ffd9)}
#tacticalOpsRoot .t-token.enemy.active .t-ring{filter:drop-shadow(0 0 10px #e23d3dd9)}
#tacticalOpsRoot .t-token.inspect:not(.active) .t-plate{border-color:#e8edf273}
#tacticalOpsRoot .t-chips{display:flex;gap:.15rem;flex-wrap:wrap;margin-top:.12rem}
#tacticalOpsRoot .t-chip{font-family:var(--t-font-display);font-size:.52rem;letter-spacing:.08em;padding:0 .22rem;border-radius:2px;border:1px solid #e8edf233;color:var(--t-muted);line-height:1.3}
#tacticalOpsRoot .t-chip.buff{color:var(--t-ally);border-color:#3ec6ff66}
#tacticalOpsRoot .t-chip.debuff{color:#ff8a8a;border-color:#e23d3d73}
#tacticalOpsRoot .t-inspect{z-index:32;position:absolute;left:max(.7rem, env(safe-area-inset-left));top:4.5rem;width:min(188px,32vw);background:#0c1014e8;border:1px solid #e8edf21a;border-radius:8px;padding:.45rem .55rem;pointer-events:auto}
#tacticalOpsRoot .t-inspect h4{font-family:var(--t-font-display);letter-spacing:.16em;margin:0 0 .2rem;font-size:.78rem}
#tacticalOpsRoot .t-inspect dl{display:grid;grid-template-columns:1fr 1fr;gap:.12rem .5rem;margin:0}
#tacticalOpsRoot .t-inspect dt{font-family:var(--t-font-display);letter-spacing:.1em;color:var(--t-muted);font-size:.58rem}
#tacticalOpsRoot .t-inspect dd{margin:0;font-family:var(--t-font-display);font-size:.78rem;font-variant-numeric:tabular-nums}
#tacticalOpsRoot .t-act .cd{color:var(--t-enemy);letter-spacing:.12em;font-family:var(--t-font-display);font-size:.62rem}
#tacticalOpsRoot .t-act.cooling{opacity:.72}
#tacticalOpsRoot .t-act .row .slot{color:var(--t-faint);font-size:.62rem;letter-spacing:.14em}
#tacticalOpsRoot .t-skip{letter-spacing:.18em;min-width:6.4rem;min-height:58px}
@media (orientation:landscape){
  #tacticalOpsRoot .t-inspect{top:4.3rem;bottom:auto}
  #tacticalOpsRoot .t-order-unit{width:26px;height:26px}
}
@media (max-height:420px){
  #tacticalOpsRoot .t-inspect{display:none}
  #tacticalOpsRoot .t-skip{min-height:48px;min-width:0;padding:0 .7rem;font-size:.78rem}
  #tacticalOpsRoot .t-order-unit{width:22px;height:22px}
}
@media (orientation:portrait) and (max-width:820px){
  #tacticalOpsRoot .t-inspect{display:none}
}

/* —— Live loadout + visual identity V1 —— */
#tacticalOpsRoot{
  --t-bg:#07090d;
  --t-surface:#0c1016;
  --t-elevated:#121820;
  --t-fg:#e7edf3;
  --t-muted:#7f8a97;
  --t-faint:#55606c;
  --t-line:#232a33;
  --t-ally:#3ec6ff;
  --t-ally-dim:#102e3d;
  --t-enemy:#e23d3d;
  --t-enemy-dim:#3d1212;
}
#tacticalOpsRoot .t-bg img{
  opacity:.42;
  filter:saturate(.72) brightness(.55) contrast(1.12);
}
#tacticalOpsRoot .t-field-art{
  object-fit:cover;
  object-position:50% 58%;
  filter:saturate(.78) brightness(.62) contrast(1.1);
}
#tacticalOpsRoot .t-field-grade{
  pointer-events:none;
  position:absolute;inset:0;
  background:
    linear-gradient(180deg,#07090dcc 0%,transparent 18%,transparent 72%,#07090de6 100%),
    radial-gradient(70% 55% at 22% 48%, #123a4e55 0%, transparent 58%),
    radial-gradient(60% 50% at 78% 42%, #4a141455 0%, transparent 55%);
  z-index:1;
}
#tacticalOpsRoot .t-vignette{
  background:
    linear-gradient(#07090de0 0%,transparent 16%,transparent 80%,#07090df2 100%),
    radial-gradient(transparent 40%, #07090dcc 100%);
  z-index:2;
}
#tacticalOpsRoot .t-field .t-vignette{ z-index:3; }
#tacticalOpsRoot .t-token,
#tacticalOpsRoot .t-cell,
#tacticalOpsRoot .t-float,
#tacticalOpsRoot .t-impact{ z-index:4; }
#tacticalOpsRoot .t-token{ z-index:5; }
#tacticalOpsRoot .t-ground{
  position:absolute;left:50%;bottom:6%;
  width:72%;height:18%;
  transform:translate(-50%,0);
  background:radial-gradient(ellipse at center, #000000b3 0%, transparent 70%);
  pointer-events:none;
}
#tacticalOpsRoot .t-token.ally .t-ground{
  background:radial-gradient(ellipse at center, #3ec6ff40 0%, #000000a6 42%, transparent 72%);
}
#tacticalOpsRoot .t-token.enemy .t-ground{
  background:radial-gradient(ellipse at center, #e23d3d40 0%, #000000a6 42%, transparent 72%);
}
#tacticalOpsRoot .t-token{
  width:13.6%;
  min-width:70px;
  max-width:146px;
  transform:translate(-50%,-88%);
}
#tacticalOpsRoot .t-token.alpha{
  width:15.2%;
  min-width:78px;
  max-width:160px;
}
#tacticalOpsRoot .t-token.skirmisher,
#tacticalOpsRoot .t-token.support{
  width:13.2%;
  min-width:68px;
  max-width:140px;
}
#tacticalOpsRoot .t-token.leader{ width:17%; min-width:88px; max-width:176px; }
#tacticalOpsRoot .t-token.hound{ width:14.8%; min-width:76px; max-width:154px; }
#tacticalOpsRoot .t-token.subdued{ opacity:.55; filter:saturate(.55); }
#tacticalOpsRoot .t-ring{
  width:108%;
  bottom:1%;
  filter:drop-shadow(0 0 8px currentColor);
}
#tacticalOpsRoot .t-ring-soft{
  fill:currentColor;
  opacity:.12;
}
#tacticalOpsRoot .t-token.active .t-ring{ filter:drop-shadow(0 0 12px #3ec6ffe6); }
#tacticalOpsRoot .t-token.enemy.active .t-ring{ filter:drop-shadow(0 0 12px #e23d3de6); }
#tacticalOpsRoot .t-token img.body{
  filter:drop-shadow(0 12px 14px #000000b3);
}
#tacticalOpsRoot .t-gear{
  position:absolute;
  right:6%;
  bottom:22%;
  width:22%;
  height:auto;
  pointer-events:none;
  filter:drop-shadow(0 2px 4px #000c);
  z-index:3;
}
#tacticalOpsRoot .t-plate{
  background:#07090df2;
  border-radius:4px;
  min-width:78px;
  max-width:118px;
  top:-38px;
  padding:.16rem .34rem .18rem;
  box-shadow:0 6px 16px #00000073;
}
#tacticalOpsRoot .t-plate-name{
  letter-spacing:.12em;
  font-size:.66rem;
  gap:.28rem;
}
#tacticalOpsRoot .t-plate-name .mark{
  width:7px;height:7px;border-radius:1px;flex-shrink:0;
  transform:rotate(45deg);
  display:inline-block;
}
#tacticalOpsRoot .t-plate-name .mark.ally{ background:var(--t-ally); box-shadow:0 0 6px #3ec6ffaa; }
#tacticalOpsRoot .t-plate-name .mark.enemy{ background:var(--t-enemy); box-shadow:0 0 6px #e23d3daa; }
#tacticalOpsRoot .t-hp-bar{ height:3px; background:#e8edf214; }
#tacticalOpsRoot .t-token.ally .t-hp-bar>i{
  background:linear-gradient(90deg,#2aa8e0,#7ae0ff);
}
#tacticalOpsRoot .t-token.enemy .t-hp-bar>i{
  background:linear-gradient(90deg,#c62828,#ff6b6b);
}
#tacticalOpsRoot .t-top{
  background:linear-gradient(#07090de8 0%, #07090d00 100%);
  padding:max(.5rem, env(safe-area-inset-top)) max(.8rem, env(safe-area-inset-right)) .4rem max(.8rem, env(safe-area-inset-left));
}
#tacticalOpsRoot .t-brand img{
  width:46px;height:46px;
  border:1px solid #3ec6ff73;
  box-shadow:0 0 0 1px #3ec6ff2e, 0 4px 14px #0008;
  object-position:50% 12%;
}
#tacticalOpsRoot .t-brand h1{ letter-spacing:.14em; }
#tacticalOpsRoot .t-brand p{
  letter-spacing:.26em;
  color:var(--t-ally);
}
#tacticalOpsRoot .t-loadout-chip{
  display:block;
  margin-top:.12rem;
  font-family:var(--t-font-display);
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--t-muted);
  font-size:.58rem;
  max-width:18rem;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
#tacticalOpsRoot .t-faction{
  display:block;
  color:var(--t-enemy);
  letter-spacing:.22em;
  text-transform:uppercase;
  font-size:.62rem;
  margin-bottom:.12rem;
}
#tacticalOpsRoot .t-order{ gap:.34rem; margin-top:.34rem; }
#tacticalOpsRoot .t-order-unit{
  width:32px;height:32px;
  border-radius:5px;
  border:1px solid #e8edf22e;
  box-shadow:0 2px 8px #0008;
}
#tacticalOpsRoot .t-order-unit.active{
  transform:scale(1.16);
  border-color:var(--t-ally);
  box-shadow:0 0 0 1px #3ec6ff99, 0 0 10px #3ec6ff55;
}
#tacticalOpsRoot .t-order-unit.enemy.active{
  border-color:var(--t-enemy);
  box-shadow:0 0 0 1px #e23d3d99, 0 0 10px #e23d3d55;
}
#tacticalOpsRoot .t-dock{
  background:linear-gradient(#0000,#07090df0 38%);
  padding:.45rem max(.8rem, env(safe-area-inset-right)) max(.75rem, env(safe-area-inset-bottom)) max(.8rem, env(safe-area-inset-left));
}
#tacticalOpsRoot .t-act{
  min-height:62px;
  background:#0a0e14f0;
  border:1px solid #e8edf224;
  position:relative;
  overflow:hidden;
}
#tacticalOpsRoot .t-act .row{ letter-spacing:.15em; font-size:.8rem; }
#tacticalOpsRoot .t-act-ico{
  width:14px;height:14px;
  color:var(--t-ally);
  flex-shrink:0;
}
#tacticalOpsRoot .t-act.cooling .t-act-ico{ color:var(--t-muted); }
#tacticalOpsRoot .t-act.on{
  background:#3ec6ff18;
  box-shadow:inset 0 0 0 1px #3ec6ff66;
}
#tacticalOpsRoot .t-skip{
  min-width:7.2rem;
  min-height:62px;
  letter-spacing:.2em;
  border-color:#e8edf233;
}
#tacticalOpsRoot .t-cell.move:after{
  width:18px;height:18px;
  background:radial-gradient(circle,#3ec6ffa8 0%,#3ec6ff1f 68%,transparent 72%);
  box-shadow:0 0 12px #3ec6ff59;
}
#tacticalOpsRoot .t-loadout-line{
  display:flex;align-items:center;gap:.7rem;
  margin-top:.75rem;
  padding-top:.7rem;
  border-top:1px solid #e8edf214;
}
#tacticalOpsRoot .t-loadout-line img{
  width:44px;height:44px;object-fit:cover;object-position:50% 12%;
  border:1px solid #3ec6ff59;border-radius:4px;
}
#tacticalOpsRoot .t-loadout-line b{
  display:block;
  font-family:var(--t-font-display);
  letter-spacing:.16em;
  font-size:.92rem;
}
#tacticalOpsRoot .t-loadout-line span{
  color:var(--t-muted);
  font-size:.78rem;
  letter-spacing:.06em;
  text-transform:uppercase;
}
#tacticalOpsRoot .t-panel{
  background:#080c11e6;
  border:1px solid #e8edf21f;
  box-shadow:0 12px 40px #00000073;
}
#tacticalOpsRoot .t-ticker{
  background:#07090de8;
  border:1px solid #3ec6ff33;
  letter-spacing:.18em;
}
#tacticalOpsRoot .t-banner span{
  background:#07090de8;
  letter-spacing:.3em;
  border:1px solid #3ec6ff40;
}
#tacticalOpsRoot .t-inspect{
  background:#080c11f0;
  border:1px solid #e8edf224;
}
@media (orientation:landscape){
  #tacticalOpsRoot .t-order-unit{ width:30px;height:30px; }
  #tacticalOpsRoot .t-loadout-chip{ max-width:16rem; }
}
@media (max-height:420px){
  #tacticalOpsRoot .t-loadout-chip,
  #tacticalOpsRoot .t-faction{ display:none; }
  #tacticalOpsRoot .t-act{ min-height:48px; }
  #tacticalOpsRoot .t-skip{ min-height:48px; }
  #tacticalOpsRoot .t-act-ico{ display:none; }
}
@media (orientation:portrait) and (max-width:820px){
  #tacticalOpsRoot .t-loadout-chip{ display:none; }
  #tacticalOpsRoot .t-token{ width:20%; }
  #tacticalOpsRoot .t-token.alpha{ width:22%; }
  #tacticalOpsRoot .t-token.leader{ width:24%; }
  #tacticalOpsRoot .t-token.hound{ width:22%; }
}
@media (prefers-reduced-motion:reduce){
  #tacticalOpsRoot .t-ring{ filter:none; }
}
#tacticalOpsRoot .t-unit-row img{
  object-position:50% 40%;
}
#tacticalOpsRoot .t-brand img,
#tacticalOpsRoot .t-loadout-line img{
  object-position:50% 12%;
}
`;
