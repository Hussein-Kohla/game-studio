export const IMPOSTER_CATEGORIES = [
  { id: "animals", label: "حيوانات" },
  { id: "countries", label: "دول مشهورة" },
  { id: "football", label: "لاعيبة كورة مشهورة" },
  { id: "clothing", label: "لبس واضح" },
  { id: "egyptian_food", label: "أكل مصري" },
  { id: "egyptian_sweets", label: "حلويات مصرية" },
  { id: "egyptian_celebrities", label: "مشاهير مصريين" },
] as const;

export type ImposterCategoryId = (typeof IMPOSTER_CATEGORIES)[number]["id"];
