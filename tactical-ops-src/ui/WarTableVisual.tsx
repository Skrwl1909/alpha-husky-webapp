import { ChevronRight } from "lucide-react";

const ART_ROOT = "/images/tactical_ops/presentation/war_table_v2/";
export type WarTableCategory = "campaign" | "field-ops" | "challenges" | "last-howl";
type ArtKey = "command" | WarTableCategory;
const ART = {
  command: ["WT-A01", "war_table_command_v1.webp"],
  campaign: ["WT-B01", "war_table_campaign_v1.webp"],
  "field-ops": ["WT-B02", "war_table_field_ops_v1.webp"],
  challenges: ["WT-B03", "war_table_challenges_v1.webp"],
  "last-howl": ["WT-B04", "war_table_last_howl_v1.webp"],
} as const;
const CATEGORIES = [
  { key: "campaign", label: "Campaign", descriptor: "Story operations", detail: "Follow the recovered transmissions." },
  { key: "field-ops", label: "Field Ops", descriptor: "Rotating front", detail: "Survey the current field board." },
  { key: "challenges", label: "Challenges", descriptor: "Special objectives", detail: "Trials, contracts and tactical tests." },
  { key: "last-howl", label: "Last Howl", descriptor: "Endless protocol", detail: "Survival and personal records." },
] as const;

export function WarTableArt({ asset, eager = false }: { asset: ArtKey; eager?: boolean }) {
  return <img className="t-wtv2-art" data-wtv2-asset={ART[asset][0]} src={ART_ROOT + ART[asset][1]} alt="" aria-hidden="true"
    decoding="async" loading={eager ? "eager" : "lazy"} onError={event => { event.currentTarget.hidden = true; }} />;
}

export function WarTableCategories({ onBrowse, destination = false }: {
  onBrowse: (category: WarTableCategory) => void; destination?: boolean;
}) {
  return <section className="t-wtv2-directory" aria-label="Operation categories" data-wtv2-destination={destination || undefined} tabIndex={destination ? -1 : undefined}>
    <div className="t-wtv2-directory-head"><div><span className="t-wtv2-eyebrow">OPERATION DIRECTORY</span><h2>Choose your front</h2></div><span className="t-wtv2-count" aria-hidden="true">04 / 04</span></div>
    <div className="t-wtv2-grid">
      {CATEGORIES.map((category, index) => <button type="button" key={category.key} className="t-wtv2-category" data-wtv2-category={category.key} aria-label={`Browse ${category.label}`} onClick={() => onBrowse(category.key)}>
        <span className="t-wtv2-card-image"><WarTableArt asset={category.key} /><span className="t-wtv2-index" aria-hidden="true">0{index + 1}</span></span>
        <span className="t-wtv2-card-copy"><span className="t-wtv2-eyebrow">{category.descriptor}</span><span className="t-wtv2-card-title">{category.label}<ChevronRight aria-hidden="true" /></span></span>
      </button>)}
    </div>
  </section>;
}

const PLATES = {
  squad: ["WT-C01", "war_table_squad_v1.webp", "SQUAD", "Deployment Bay"],
  "signal-atlas": ["WT-C02", "war_table_signal_atlas_v1.webp", "SKILLS", "Atlas Chamber"],
  "pack-mastery": ["WT-C03", "war_table_pack_mastery_v1.webp", "MASTERY", "Discipline Forge"],
  legacy: ["WT-D01", "war_table_legacy_v1.webp", "LEGACY", "Hall of Signals"],
} as const;
export type WarTablePlate = keyof typeof PLATES;

export function WarTablePlate({ plate }: { plate: WarTablePlate }) {
  const [id, file, kicker, title] = PLATES[plate];
  return <section className="t-wtv2-plate" data-wtv2-plate={plate} aria-label={title}>
    <img className="t-wtv2-art" data-wtv2-asset={id} src={ART_ROOT + file} alt="" aria-hidden="true" decoding="async" />
    <div className="t-wtv2-plate-copy"><span className="t-wtv2-eyebrow">{kicker}</span><h2>{title}</h2></div>
  </section>;
}

export function WarTableCategoryHeading({ category, onBack }: { category: WarTableCategory; onBack: () => void }) {
  const info = CATEGORIES.find(item => item.key === category)!;
  return <section className="t-wtv2-destination" data-wtv2-category={category} data-wtv2-destination tabIndex={-1} aria-label={`${info.label} directory`}>
    <WarTableArt asset={category} eager />
    <div className="t-wtv2-destination-copy">
      <button type="button" className="t-wtv2-return" onClick={onBack}>‹ ALL OPERATIONS</button>
      <span className="t-wtv2-eyebrow">{info.descriptor}</span>
      <h2>{info.label}</h2><p>{info.detail}</p>
    </div>
  </section>;
}
