import { Locale } from "@/i18n";

export function getMovieText(
  map?: Map<string, string>,
  locale?: Locale,
  defaultLang?: string
) {
  if (!map) return "";

  return (
    (locale && map.get(locale)) ||
    (defaultLang && map.get(defaultLang)) ||
    map.get("en") ||
    [...map.values()][0] ||
    ""
  );
}
