import db from "./db";
import { List_AV } from "@/prisma/generated/client/client";

export async function getLibraryYearId(libraryId: number, year: number): Promise<number | null> {
  try {
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: year,
      },
      select: {
        id: true,
      },
    });

    return libraryYear?.id || null;
  } catch (error) {
    console.error('Error in getLibraryYearId:', error);
    return null;
  }
}

export async function getSubscribedAVs(libraryId: number, year: number): Promise<List_AV[]> {
  try {
    const libraryYearId = await getLibraryYearId(libraryId, year);
    if (!libraryYearId) return [];

    const subscriptions = await db.libraryYear_ListAV.findMany({
      where: { libraryyear_id: libraryYearId },
      include: { List_AV: true },
    });

    return subscriptions
      .map((sub) => sub.List_AV)
      .sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error('Error in getSubscribedAVs:', error);
    return [];
  }
}
