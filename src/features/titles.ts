import type { ViewName } from "./nav";

/** Localized screen title for the top bar, keyed by view. */
export function screenTitle(name: ViewName, t: (k: string) => string): string {
  switch (name) {
    case "home": return t("dashboard");
    case "office": return t("queue");
    case "catalog": return t("catTitle");
    case "team": return t("manageTeam");
    case "customers": return t("navCustomers");
    case "customer": return t("navCustomers");
    case "review": return t("review");
    case "print": return t("proposal");
    case "newJob": return t("newInsp");
    case "snapshot": return t("sysOverview");
    case "zones": return t("zonesHub");
    case "zone": return t("zone");
    case "addIssue": return t("addIssue");
    case "map": return t("siteMap");
    default: return t("appName");
  }
}
