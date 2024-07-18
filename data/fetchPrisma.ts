import db from "@/lib/db";

// Get libraries
export const getLibraryById = async (id: number) => {
  try {
    const library = await db.library.findUnique({
      where: { id },
      include: {
        libraryRegion: true,
        libraryType: true,
        User_Library: true,
      },
    });
    return library;
  } catch {
    return null;
  }
};

export const getAllLibraries = async () => {
  try {
    const allLibraries = await db.library.findMany({
      include: {
        libraryRegion: true,
        libraryType: true,
        User_Library: true,
      },
    });
    return allLibraries;
  } catch {
    return null;
  }
};

// Get users
export const getUserById = async (id: number) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        User_Library: true,
        User_Roles: true,
      },
    });
    return user;
  } catch {
    return null;
  }
};

export const getUserByUserName = async (username: string) => {
  try {
    const user = await db.user.findMany({
      where: {
        username: {
          equals: username.toLowerCase(),
          mode: "insensitive",
        },
      },
      include: {
        User_Library: true,
        User_Roles: true,
      },
    });
    return user[0];
  } catch {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const allUsers = await db.user.findMany({
      include: {
        User_Library: true,
        User_Roles: true,
      },
    });
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

export const getRoleById = async (id: number) => {
  try {
    const role = await db.role.findUnique({ where: { id } });
    return role;
  } catch {
    return null;
  }
};

export const getRoleInfoByUserId = async (id: number) => {
  try {
    const roles = await db.users_Roles.findMany({ where: { user_id: id } });
    return roles.map(async (role) => await getRoleById(role.role_id));
  } catch {
    return null;
  }
};
