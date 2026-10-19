// lib/catalogueOrigin.ts
//
// The Origin label on AV, E-Book and E-Journal entries (Admin-created,
// Promoted to Global, an institution's own entry, ...) and the institution
// that created an entry are for the people who look after the catalogue.
// Members do not see them. The list pages take them out of the data before
// it reaches the browser, so hiding the column is not the only thing in
// the way.

/** Super Admin (1) and E-Resource Editor (3) see where entries came from. */
export function canSeeCatalogueOrigin(roleIds: number[]): boolean {
  return roleIds.includes(1) || roleIds.includes(3);
}

/**
 * The rows with the origin fields this user may not see set to null: the
 * Origin label below Super Admin and E-Resource Editor, the creating
 * institution below Super Admin (the only role with that column).
 */
export function withoutHiddenOrigins<T extends { import_origin?: string | null; origin_institution?: string | null }>(
  rows: T[],
  roleIds: number[],
): T[] {
  const showOrigin = canSeeCatalogueOrigin(roleIds);
  const showInstitution = roleIds.includes(1);
  if (showOrigin && showInstitution) return rows;
  return rows.map((row) => ({
    ...row,
    ...(showOrigin ? {} : { import_origin: null }),
    ...(showInstitution ? {} : { origin_institution: null }),
  }));
}
