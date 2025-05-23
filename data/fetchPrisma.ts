import db from "@/lib/db";
import { list } from "postcss";

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

// Survey: Get AV List.
export const getListAVCountsByYear = async (year: number) => {
  try {
    const listAVCountsArray = await db.list_AV_Counts.findMany({
      where: {
        year,
        ishidden: false,
      },
    });
    return listAVCountsArray;
  } catch {
    return null;
  }
}

export const getListAVByID = async (id: number) => {
  try {
    const listAV = await db.list_AV.findUnique({
      where: {
        id,
        is_global: true,
      },
    });
    return listAV;
  } catch {
    return null;
  }
}

export const getLanguageIdByListAvId = async (listavid: number) => {
  try {
    const languageIdArray = await db.list_AV_Language.findMany({
      where: { listav_id: listavid }
    });
    return languageIdArray.map((lang) => lang.language_id);
  } catch {
    return null;
  }
}

export const getSubscriberIdByListAvId = async (listavid: number, year: number) => {
  try {
    const result = await db.libraryYear_ListAV.findMany({
      where: {
        listav_id: listavid,
      },
      include: {
        Library_Year: {
          where: {
            year: year,
          },
          select: {
            library: true,
            is_active: true,
          },
        },
      },
    });

    return result.map((item) => item.Library_Year?.library);
  } catch {
    return null;
  }
}


// Survey: Get EBook List.
export const getListEBookCountsByYear = async (year: number) => {
  try {
    const listEBookCountsArray = await db.list_EBook_Counts.findMany({
      where: {
        year,
        ishidden: false,
      },
    });
    return listEBookCountsArray;
  } catch {
    return null;
  }
}

export const getListEBookByID = async (id: number) => {
  try {
    const listEBook = await db.list_EBook.findUnique({
      where: {
        id,
        is_global: true,
      },
    });
    return listEBook;
  } catch {
    return null;
  }
}

export const getLanguageIdByListEBookId = async (listEBookId: number) => {
  try {
    const languageIdArray = await db.list_EBook_Language.findMany({
      where: { listebook_id: listEBookId }
    });
    return languageIdArray.map((lang) => lang.language_id);
  } catch {
    return null;
  }
}

export const getSubscriberIdByListEBookId = async (listEBookId: number, year: number) => {
  try {
    const result = await db.libraryYear_ListEBook.findMany({
      where: {
        listebook_id: listEBookId,
      },
      include: {
        Library_Year: {
          where: {
            year: year,
            is_active: true,
          },
          select: {
            library: true,
          },
        },
      },
    });

    return result.map((item) => item.Library_Year?.library);
  } catch {
    return null;
  }
}

// Survey: Get EJournal List.
export const getListEJournalCountsByYear = async (year: number) => {
  try {
    const listEJournalCountsArray = await db.list_EJournal_Counts.findMany({
      where: {
        year,
        ishidden: false,
      },
    });
    return listEJournalCountsArray;
  } catch {
    return null;
  }
}

export const getListEJournalByID = async (id: number) => {
  try {
    const listEJournal = await db.list_EJournal.findUnique({
      where: {
        id,
        is_global: true,
      },
    });
    return listEJournal;
  } catch {
    return null;
  }
}

export const getLanguageIdByListEJournalId = async (listEJournalId: number) => {
  try {
    const languageIdArray = await db.list_EJournal_Language.findMany({
      where: { listejournal_id: listEJournalId }
    });
    return languageIdArray.map((lang) => lang.language_id);
  } catch {
    return null;
  }
}

export const getSubscriberIdByListEJournalId = async (listEJournalId: number, year: number) => {
  try {
    const result = await db.libraryYear_ListEJournal.findMany({
      where: {
        listejournal_id: listEJournalId,
      },
      include: {
        Library_Year: {
          where: {
            year: year,
            is_active: true,
          },
          select: {
            library: true,
          },
        },
      },
    });

    return result.map((item) => item.Library_Year?.library);
  } catch {
    return null;
  }
}
