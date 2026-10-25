/** Host injects one CSS string, including the Atlas module. No separate CSS file is loaded. */
import BASE_CSS from "./tactical.css?raw";
import SIGNAL_ATLAS_CSS from "./ui/signalAtlas/signalAtlas.css?raw";
import COMBAT_COHESION_CSS from "./ui/combatCohesion.css?raw";
import CAMPAIGN_ORDERS_CSS from "./ui/tacticalCampaignOrders.css?raw";
import CHAPTER_CSS from "./ui/campaignChapter.css?raw";
export const TACTICAL_CSS = BASE_CSS + "\n" + SIGNAL_ATLAS_CSS + "\n" + COMBAT_COHESION_CSS + "\n" + CAMPAIGN_ORDERS_CSS + "\n" + CHAPTER_CSS;
