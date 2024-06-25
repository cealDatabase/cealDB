import db from "@/lib/db";

// Get libraries
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

// Get users
export const getUserById = async (id: number) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

export const getUserByUserName = async (username: string) => {
  try {
    const user = await db.user.findUnique({
      where: { username: username.toLowerCase() },
    });
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

// Get others
export const getRegionById = async (id: number) => {
  try {
    const region = await db.reflibraryregion.findUnique({ where: { id } });
    return region;
  } catch {
    return null;
  }
};

export const getTypeById = async (id: number) => {
  try {
    const type = await db.reflibrarytype.findUnique({ where: { id } });
    return type;
  } catch {
    return null;
  }
};
