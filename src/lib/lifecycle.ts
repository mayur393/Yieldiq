/**
 * YieldIQ — Automated Crop Lifecycle Calculator
 * Computes the current growth stage based on planting date + crop type.
 * No manual input required — fully automated from profile data.
 */

export interface CropStage {
  name: string;
  label: string;          // Written display label
  description: string;
  dayStart: number;
  dayEnd: number;
  color: string;          // Tailwind color class
  badge: string;          // Badge style classes
  icon: string;           // emoji icon
  isHarvestReady: boolean;
}

// Crop lifecycle calendars (days from planting)
const CROP_LIFECYCLES: Record<string, CropStage[]> = {
  default: [
    { name: "germination",  label: "Germination Stage",           description: "Seeds sprouting and initial root development.", dayStart: 0,   dayEnd: 14,  color: "text-yellow-600",  badge: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: "🌱", isHarvestReady: false },
    { name: "vegetative",   label: "Vegetative Growth Stage",     description: "Active leaf, stem and root expansion.",          dayStart: 15,  dayEnd: 50,  color: "text-green-600",   badge: "bg-green-100 text-green-700 border-green-200",     icon: "🌿", isHarvestReady: false },
    { name: "flowering",    label: "Flowering & Pollination Stage",description: "Flower development and pollination window.",      dayStart: 51,  dayEnd: 80,  color: "text-pink-600",    badge: "bg-pink-100 text-pink-700 border-pink-200",        icon: "🌸", isHarvestReady: false },
    { name: "maturity",     label: "Grain Filling / Maturity Stage",description: "Fruit/grain filling and crop maturation.",     dayStart: 81,  dayEnd: 110, color: "text-orange-600",  badge: "bg-orange-100 text-orange-700 border-orange-200",  icon: "🌾", isHarvestReady: false },
    { name: "harvest",      label: "Ready for Harvest",           description: "Crop is mature and ready for harvesting.",       dayStart: 111, dayEnd: 999, color: "text-amber-600",   badge: "bg-amber-100 text-amber-700 border-amber-200",     icon: "🚜", isHarvestReady: true  },
  ],
  wheat: [
    { name: "germination",  label: "Germination Stage",            description: "Seed germination and seedling emergence.",       dayStart: 0,   dayEnd: 10,  color: "text-yellow-600",  badge: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: "🌱", isHarvestReady: false },
    { name: "tillering",    label: "Tillering Stage",              description: "Multiple shoots developing from base.",          dayStart: 11,  dayEnd: 45,  color: "text-green-600",   badge: "bg-green-100 text-green-700 border-green-200",     icon: "🌿", isHarvestReady: false },
    { name: "jointing",     label: "Jointing & Booting Stage",     description: "Rapid stem elongation and flag leaf appearing.", dayStart: 46,  dayEnd: 75,  color: "text-teal-600",    badge: "bg-teal-100 text-teal-700 border-teal-200",        icon: "🌾", isHarvestReady: false },
    { name: "heading",      label: "Heading & Flowering Stage",    description: "Ear emergence and anthesis.",                    dayStart: 76,  dayEnd: 95,  color: "text-pink-600",    badge: "bg-pink-100 text-pink-700 border-pink-200",        icon: "🌸", isHarvestReady: false },
    { name: "grainfill",    label: "Grain Filling Stage",          description: "Grain filling and dry matter accumulation.",     dayStart: 96,  dayEnd: 125, color: "text-orange-600",  badge: "bg-orange-100 text-orange-700 border-orange-200",  icon: "🥇", isHarvestReady: false },
    { name: "harvest",      label: "Ready for Harvest",            description: "Grain moisture below 14%, ripe for cutting.",    dayStart: 126, dayEnd: 999, color: "text-amber-600",   badge: "bg-amber-100 text-amber-700 border-amber-200",     icon: "🚜", isHarvestReady: true  },
  ],
  paddy: [
    { name: "germination",  label: "Germination Stage",            description: "Seed soaking, sprouting and nursery phase.",     dayStart: 0,   dayEnd: 20,  color: "text-yellow-600",  badge: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: "🌱", isHarvestReady: false },
    { name: "vegetative",   label: "Vegetative Stage",             description: "Tillering and active leaf growth in the field.", dayStart: 21,  dayEnd: 60,  color: "text-green-600",   badge: "bg-green-100 text-green-700 border-green-200",     icon: "🌿", isHarvestReady: false },
    { name: "panicle",      label: "Panicle Initiation Stage",     description: "Flower bud initiation — critical water stage.", dayStart: 61,  dayEnd: 80,  color: "text-teal-600",    badge: "bg-teal-100 text-teal-700 border-teal-200",        icon: "🌾", isHarvestReady: false },
    { name: "heading",      label: "Heading & Flowering Stage",    description: "Panicle emergence and pollination.",             dayStart: 81,  dayEnd: 100, color: "text-pink-600",    badge: "bg-pink-100 text-pink-700 border-pink-200",        icon: "🌸", isHarvestReady: false },
    { name: "ripening",     label: "Ripening Stage",               description: "Grain filling and golden colour development.",   dayStart: 101, dayEnd: 130, color: "text-orange-600",  badge: "bg-orange-100 text-orange-700 border-orange-200",  icon: "🥇", isHarvestReady: false },
    { name: "harvest",      label: "Ready for Harvest",            description: "80% of grains are golden yellow. Harvest now.", dayStart: 131, dayEnd: 999, color: "text-amber-600",   badge: "bg-amber-100 text-amber-700 border-amber-200",     icon: "🚜", isHarvestReady: true  },
  ],
  cotton: [
    { name: "germination",  label: "Germination Stage",            description: "Seedling emergence from soil.",                 dayStart: 0,   dayEnd: 14,  color: "text-yellow-600",  badge: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: "🌱", isHarvestReady: false },
    { name: "vegetative",   label: "Vegetative Stage",             description: "Leaf and branch development.",                  dayStart: 15,  dayEnd: 55,  color: "text-green-600",   badge: "bg-green-100 text-green-700 border-green-200",     icon: "🌿", isHarvestReady: false },
    { name: "squaring",     label: "Squaring Stage",               description: "Flower bud (square) formation.",                dayStart: 56,  dayEnd: 90,  color: "text-blue-600",    badge: "bg-blue-100 text-blue-700 border-blue-200",        icon: "🔵", isHarvestReady: false },
    { name: "flowering",    label: "Flowering & Boll Set Stage",   description: "White/pink flower opening and boll setting.",   dayStart: 91,  dayEnd: 130, color: "text-pink-600",    badge: "bg-pink-100 text-pink-700 border-pink-200",        icon: "🌸", isHarvestReady: false },
    { name: "bolldev",      label: "Boll Development Stage",       description: "Boll expansion and fibre development.",         dayStart: 131, dayEnd: 170, color: "text-orange-600",  badge: "bg-orange-100 text-orange-700 border-orange-200",  icon: "💠", isHarvestReady: false },
    { name: "harvest",      label: "Ready for Harvest",            description: "Bolls open, white fluff visible. Pick now.",    dayStart: 171, dayEnd: 999, color: "text-amber-600",   badge: "bg-amber-100 text-amber-700 border-amber-200",     icon: "🚜", isHarvestReady: true  },
  ],
  sugarcane: [
    { name: "germination",  label: "Germination Stage",            description: "Bud sprouting from sett cuttings.",             dayStart: 0,   dayEnd: 30,  color: "text-yellow-600",  badge: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: "🌱", isHarvestReady: false },
    { name: "tillering",    label: "Tillering Stage",              description: "Multiple shoots emerging from parent sett.",    dayStart: 31,  dayEnd: 90,  color: "text-green-600",   badge: "bg-green-100 text-green-700 border-green-200",     icon: "🌿", isHarvestReady: false },
    { name: "grandgrowth",  label: "Grand Growth Stage",           description: "Rapid internodal elongation period.",           dayStart: 91,  dayEnd: 240, color: "text-teal-600",    badge: "bg-teal-100 text-teal-700 border-teal-200",        icon: "🌾", isHarvestReady: false },
    { name: "maturity",     label: "Ripening & Maturity Stage",    description: "Sugar accumulation and juice concentration.",   dayStart: 241, dayEnd: 330, color: "text-orange-600",  badge: "bg-orange-100 text-orange-700 border-orange-200",  icon: "🥇", isHarvestReady: false },
    { name: "harvest",      label: "Ready for Harvest",            description: "Brix 18-20%. Ready for milling submission.",    dayStart: 331, dayEnd: 999, color: "text-amber-600",   badge: "bg-amber-100 text-amber-700 border-amber-200",     icon: "🚜", isHarvestReady: true  },
  ],
  soybean: [
    { name: "germination",  label: "Germination Stage",            description: "Seed imbibition, radicle emergence.",           dayStart: 0,   dayEnd: 10,  color: "text-yellow-600",  badge: "bg-yellow-100 text-yellow-700 border-yellow-200",  icon: "🌱", isHarvestReady: false },
    { name: "vegetative",   label: "Vegetative Stage",             description: "Leaf node development (V1–V6).",                dayStart: 11,  dayEnd: 45,  color: "text-green-600",   badge: "bg-green-100 text-green-700 border-green-200",     icon: "🌿", isHarvestReady: false },
    { name: "flowering",    label: "Flowering Stage",              description: "First flower appearance (R1-R2).",              dayStart: 46,  dayEnd: 65,  color: "text-pink-600",    badge: "bg-pink-100 text-pink-700 border-pink-200",        icon: "🌸", isHarvestReady: false },
    { name: "poddev",       label: "Pod Development Stage",        description: "Pod filling and seed development (R3-R6).",     dayStart: 66,  dayEnd: 100, color: "text-orange-600",  badge: "bg-orange-100 text-orange-700 border-orange-200",  icon: "🫛", isHarvestReady: false },
    { name: "harvest",      label: "Ready for Harvest",            description: "Pods yellowed, seeds rattling. Harvest now.",   dayStart: 101, dayEnd: 999, color: "text-amber-600",   badge: "bg-amber-100 text-amber-700 border-amber-200",     icon: "🚜", isHarvestReady: true  },
  ],
};

/**
 * Returns the current computed crop stage based on cropType and plantingDate.
 * Falls back to a generic 5-stage lifecycle for unknown crops.
 */
export function computeCropStage(cropType: string, plantingDate: string): CropStage | null {
  if (!plantingDate || !cropType) return null;

  const planting = new Date(plantingDate);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));

  if (daysElapsed < 0) return null; // Planting date in the future

  // Normalize crop type: lower case, trim spaces
  const normalized = cropType.toLowerCase().trim();

  // Find closest matching lifecycle
  const calendar =
    CROP_LIFECYCLES[normalized] ||
    Object.entries(CROP_LIFECYCLES).find(([key]) => normalized.includes(key))?.[1] ||
    CROP_LIFECYCLES.default;

  const currentStage = calendar.find(
    (s) => daysElapsed >= s.dayStart && daysElapsed <= s.dayEnd
  );

  return currentStage || calendar[calendar.length - 1]; // Default to harvest if past all stages
}

/**
 * Returns the progress percentage within the current stage (0–100).
 */
export function computeStageProgress(cropType: string, plantingDate: string): number {
  const stage = computeCropStage(cropType, plantingDate);
  if (!stage || !plantingDate) return 0;

  const planting = new Date(plantingDate);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));

  const stageLength = stage.dayEnd - stage.dayStart;
  const daysIntoStage = daysElapsed - stage.dayStart;
  return Math.min(100, Math.round((daysIntoStage / stageLength) * 100));
}

/**
 * Returns total days elapsed since planting.
 */
export function getDaysElapsed(plantingDate: string): number {
  if (!plantingDate) return 0;
  const planting = new Date(plantingDate);
  const today = new Date();
  return Math.max(0, Math.floor((today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Returns estimated days remaining until harvest.
 */
export function getDaysToHarvest(cropType: string, plantingDate: string): number | null {
  if (!plantingDate || !cropType) return null;
  const normalized = cropType.toLowerCase().trim();
  const calendar =
    CROP_LIFECYCLES[normalized] ||
    Object.entries(CROP_LIFECYCLES).find(([key]) => normalized.includes(key))?.[1] ||
    CROP_LIFECYCLES.default;

  const harvestStage = calendar.find((s) => s.isHarvestReady);
  if (!harvestStage) return null;

  const planting = new Date(plantingDate);
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));
  const remaining = harvestStage.dayStart - daysElapsed;
  return Math.max(0, remaining);
}
