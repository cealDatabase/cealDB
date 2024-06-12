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

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
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

export const getRegionById = async (id: number) => {
  try {
    const region = await db.libraryRegion.findUnique({ where: { id } });
    return region;
  } catch {
    return null;
  }
};

export const getTypeById = async (id: number) => {
  try {
    const type = await db.libraryType.findUnique({ where: { id } });
    return type;
  } catch {
    return null;
  }
};
