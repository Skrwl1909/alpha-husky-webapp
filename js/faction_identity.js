// js/faction_identity.js — presentation canon for Faction Identity & Initiation V1
(function (global) {
  const rows = {
    ih: { key:"ih", slug:"inner_howl", name:"Inner Howl", creed:"ENDURE", doctrine:"When everything starts breaking, you stay. Hold the line. Keep moving.", traits:["Instinct","Loyalty","Survival"], color:"#40c4ff", rgb:"64,196,255", icon40:"/images/factions/inner_howl_40.webp", icon80:"/images/factions/inner_howl_80.webp", motion:"resonance", scene:"/images/factions/chamber/inner_howl.webp" },
    rb: { key:"rb", slug:"rogue_byte", name:"Rogue Byte", creed:"BREAK IN", doctrine:"If the system is broken, get inside it. Find where it failed.", traits:["Glitch","Speed","Sabotage"], color:"#ff3b3b", rgb:"255,59,59", icon40:"/images/factions/rogue_byte_40.webp", icon80:"/images/factions/rogue_byte_80.webp", motion:"glitch", scene:"/images/factions/chamber/rogue_byte.webp" },
    ew: { key:"ew", slug:"echo_wardens", name:"Echo Wardens", creed:"REMEMBER", doctrine:"What gets forgotten can happen again. Keep the record.", traits:["Memory","Defense","Signal"], color:"#ffd34d", rgb:"255,211,77", icon40:"/images/factions/echo_wardens_40.webp", icon80:"/images/factions/echo_wardens_80.webp", motion:"echo", scene:"/images/factions/chamber/echo_wardens.webp" },
    pb: { key:"pb", slug:"pack_burners", name:"Pack Burners", creed:"BE SEEN", doctrine:"Silence changes nothing. Make sure the Pack cannot be ignored.", traits:["Fire","Pressure","Assault"], color:"#ff7a1a", rgb:"255,122,26", icon40:"/images/factions/pack_burners_40.webp", icon80:"/images/factions/pack_burners_80.webp", motion:"embers", scene:"/images/factions/chamber/pack_burners.webp" }
  };
  function normalize(raw){ const v=String(raw||"").toLowerCase().trim(); if(!v)return""; if(v==="ih"||v.includes("inner"))return"ih"; if(v==="rb"||v.includes("rogue"))return"rb"; if(v==="ew"||v.includes("echo"))return"ew"; if(v==="pb"||v.includes("pack")||v.includes("burn"))return"pb"; return""; }
  function get(raw){ return rows[normalize(raw)] || null; }
  global.FactionIdentity = Object.freeze({ neutralScene:"/images/factions/chamber/neutral.webp", all:Object.freeze(["ih","rb","ew","pb"].map(k=>Object.freeze({...rows[k]}))), get, normalize });
})(window);
