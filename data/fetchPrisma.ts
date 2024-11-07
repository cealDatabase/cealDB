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

export const findMaxId = async () => {
  try {
    const maxRecordId = await db.library.findMany({
      orderBy: {
        id: "desc",
      },
      take: 1,
    });

    const maxId = maxRecordId[0]?.id;
    return maxId;
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

export const getLanguageById = async (id: number) => {
  try {
    const language = await db.language.findUnique({ where: { id } });
    return language;
  } catch {
    return null;
  }
}

export const getAllRoles = async () => {
  try {
    const allRoles = await db.role.findMany({
      include: {
        User_Roles: true,
      },
    });
    return allRoles;
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

export const getLibYearByLibIdAndYear = async (id: number, year: number) => {
  try {
    const libyear = await db.library_Year.findMany({
      include: {
        Library: true,
        Electronic: true,
        Electronic_Books: true,
        Entry_Status: true,
        Fiscal_Support: true,
        Monographic_Acquisitions: true,
        Other_Holdings: true,
        Personnel_Support: true,
        Serials: true,
        Volume_Holdings: true,
      },
      where: {
        library: id,
        year: year,
      },
    });
    return libyear;
  } catch {
    return null;
  }
};

export const getYearsByLibId = async (id: number) => {
  try {
    const years = await db.library_Year.findMany({
      where: {
        library: id,
      },
    });
    return years;
  } catch {
    return null;
  }
};

// Big Form: Get AV List.

export const getAVListByLibraryYear = async (libraryyear: number) => {
  try {
    const avlist = await db.list_AV.findMany({
      where: { libraryyear },
      include: {
        Library_Year: true,
        List_AV_Counts: true,
        List_AV_Language: true,
      },
    });
    return avlist;
  } catch {
    return null;
  }
}

export const getAllAVLists = async () => {
  try {
    const avlists = await db.list_AV.findMany({
      include: {
        Library_Year: true,
        List_AV_Counts: true,
        List_AV_Language: true,
      },
    });
    return avlists;
  } catch {
    return null;
  }
}

export const getAVListByAVId = async (id: number) => {
  try {
    const avlist = await db.list_AV.findUnique({
      where: {
        id,
      },
      include: {
        Library_Year: true,
        List_AV_Counts: true,
        List_AV_Language: true,
      },
    });
    return avlist;
  } catch {
    return null;
  }
}

export const getAVListIdByLanguageId = async (id: number) => {
  try {
    const avlist = await db.list_AV_Language.findMany({
      where: {
        language_id: id,
      },
    });
    return avlist;
  }
  catch {
    return null;
  }
};
