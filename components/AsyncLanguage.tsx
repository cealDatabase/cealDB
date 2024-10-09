import db from "../lib/db";

// Get language
const getLanguageById = async (id: number) => {
  try {
    const language = await db.language.findUnique({ where: { id } });
    return language?.short;
  } catch {
    return null;
  }
};

// Get counts
const getCountsById = async (id: number) => {
  try {
    const counts = await db.list_AV_Counts.findUnique({ where: { id } });
    return counts;
  } catch {
    return null;
  }
};


export async function AsyncLanguage({ languageId }: { languageId: number }) {
  return <span className="text-red-600">{await getLanguageById(languageId)}</span>;
}