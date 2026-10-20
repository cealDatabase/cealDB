// lib/myAccessConfirm.ts
//
// Super Admins, E-Resource Editors and Assistant Admins work on many
// institutions, and the AV, E-Book and E-Journal pages open on their own.
// The My Access boxes there are that institution's survey answer, saved the
// moment they are clicked, which is easy to mistake for picking rows. So
// these roles say which institution they mean: once before the first tick
// on a page, and every time they tick or untick many entries at once.
// Members only ever see their own institution and are not asked.
//
// Used in the browser.

/** Asked before the first My Access change on a page. */
export function confirmMyAccessChange(libraryName: string, year: number): boolean {
  return window.confirm(
    `My Access is ${libraryName}'s answer to the ${year} survey. ` +
      `Each box you tick or untick on this page is saved for that institution straight away.\n\n` +
      `Change ${libraryName}'s ${year} My Access?`
  );
}

/** Asked before ticking or unticking many entries at once. */
export function confirmMyAccessBulk(count: number, selected: boolean, libraryName: string, year: number): boolean {
  const entries = `${count} ${count === 1 ? "entry" : "entries"}`;
  return window.confirm(
    selected
      ? `Add ${entries} to ${libraryName}'s ${year} My Access?\n\nThey are saved straight away as held by that institution.`
      : `Take ${entries} out of ${libraryName}'s ${year} My Access?\n\nThis is saved straight away.`
  );
}

/** Asked before an admin creates an entry that belongs to one institution. */
export function confirmInstitutionEntry(title: string, libraryName: string, year: number): boolean {
  return window.confirm(
    `Create "${title}" as ${libraryName}'s own entry?\n\n` +
      `It is not shared with other institutions, and it is checked in ${libraryName}'s ${year} My Access.`
  );
}
