// public/js/quests-launcher.js
(function (global) {
  function addLauncher() {
    if (document.getElementById("quests-launcher")) return;
    const btn = document.createElement("button");
    btn.id = "quests-launcher";
    btn.className = "q-launcher";
    btn.type = "button";
    btn.title = "Mission Board";
    btn.innerHTML = "📜";
    btn.onclick = () => global.Quests && global.Quests.open();
    document.body.appendChild(btn);
  }
  // poczekaj aż DOM i Quests będą dostępne
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addLauncher);
  } else {
    addLauncher();
  }
})(window);
