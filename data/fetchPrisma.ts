import db from "@/lib/db";

export const getLibraryById = async (id: number) => {
  try {
    const library = await db.library.findUnique({ where: { id } });
    return library;
  } catch {
    return null;
  }
};

export const getAllLibraries = async () => {
  try {
    const allLibraries = await db.library.findMany();
    return allLibraries;
  } catch {
    return null;
  }
};

export const getUserById = async (id: number) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const allUsers = await db.user.findMany();
    return allUsers;
  } catch {
    return null;
  }
};