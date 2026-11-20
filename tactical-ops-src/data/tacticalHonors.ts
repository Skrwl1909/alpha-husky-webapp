/**
 * Display-only proposed Tactical honors. These are NOT player entitlements.
 * Badge Wall and the cosmetics system remain the sole ownership/equip authority.
 */
export type HonorDefinition = {
  id: string; name: string; description: string; requirement: string;
  tier: "common" | "uncommon" | "rare" | "epic" | "legendary";
  target: number | null; image: string; category: "badge" | "frame";
};
export const TACTICAL_HONORS: readonly HonorDefinition[] = [
  { id:"tops_first_contact",name:"First Contact",description:"The first signal survived.",requirement:"Win 1 Tactical Ops battle.",tier:"common",target:1,image:"assets/tactical-honors/tops_first_contact.svg",category:"badge" },
  { id:"tops_field_hunter",name:"Field Hunter",description:"A proven trail through contested ground.",requirement:"Win 5 Tactical Ops battles.",tier:"uncommon",target:5,image:"assets/tactical-honors/tops_field_hunter.svg",category:"badge" },
  { id:"tops_battle_hardened",name:"Battle Hardened",description:"Every scar records another operation.",requirement:"Win 10 Tactical Ops battles.",tier:"rare",target:10,image:"assets/tactical-honors/tops_battle_hardened.svg",category:"badge" },
  { id:"tops_signal_reaper",name:"Signal Reaper",description:"The fracture loses another foothold.",requirement:"Win 25 Tactical Ops battles.",tier:"epic",target:25,image:"assets/tactical-honors/tops_signal_reaper.svg",category:"badge" },
  { id:"tops_fracture_veteran",name:"Fracture Veteran",description:"Still standing beyond the broken relay.",requirement:"Win 50 Tactical Ops battles.",tier:"epic",target:50,image:"assets/tactical-honors/tops_fracture_veteran.svg",category:"badge" },
  { id:"tops_warborn_alpha",name:"Warborn Alpha",description:"The field remembers its Alpha.",requirement:"Win 100 Tactical Ops battles.",tier:"legendary",target:100,image:"assets/tactical-honors/tops_warborn_alpha.svg",category:"badge" },
  { id:"tops_commander_slayer",name:"Commander Slayer",description:"The hostile command signal goes dark.",requirement:"Defeat Signal Commander.",tier:"rare",target:1,image:"assets/tactical-honors/tops_commander_slayer.svg",category:"badge" },
  { id:"tops_no_one_left_behind",name:"No One Left Behind",description:"The pack comes home together.",requirement:"Win with all squad members standing.",tier:"legendary",target:1,image:"assets/tactical-honors/tops_no_one_left_behind.svg",category:"badge" },
  { id:"tops_broken_signal_frame",name:"Broken Signal Frame",description:"A relay brought back from silence.",requirement:"Complete Operation 01.",tier:"rare",target:1,image:"assets/tactical-honors/tops_broken_signal_frame.svg",category:"frame" },
  { id:"tops_fracture_vanguard_frame",name:"Fracture Vanguard Frame",description:"A mark earned at the dangerous front.",requirement:"Complete an Advanced Tactical Ops challenge.",tier:"epic",target:1,image:"assets/tactical-honors/tops_fracture_vanguard_frame.svg",category:"frame" },
] as const;
export const TACTICAL_BADGES = TACTICAL_HONORS.filter(h => h.category === "badge");
export const TACTICAL_FRAMES = TACTICAL_HONORS.filter(h => h.category === "frame");
export function tacticalHonor(id: string): HonorDefinition | undefined {
  return TACTICAL_HONORS.find(h=>h.id===id);
}
