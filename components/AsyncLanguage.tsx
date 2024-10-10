import db from "@/lib/db";
import { getLanguageById } from "../data/fetchPrisma";

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
  const language = await getLanguageById(languageId);
  return <span className="text-red-600">{language ? language.short : ""}</span>;
}