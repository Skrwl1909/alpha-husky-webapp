/** Host injects one CSS string, including the Atlas module. No separate CSS file is loaded. */
import BASE_CSS from "./tactical.css?raw";
import SIGNAL_ATLAS_CSS from "./ui/signalAtlas/signalAtlas.css?raw";
import COMBAT_COHESION_CSS from "./ui/combatCohesion.css?raw";
export const TACTICAL_CSS = BASE_CSS + "\n" + SIGNAL_ATLAS_CSS + "\n" + COMBAT_COHESION_CSS;
