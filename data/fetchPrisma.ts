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
      orderBy: {
        library_name: 'asc'
      }
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
      orderBy: {
        listav: 'asc'  // CRITICAL: Order by listav ID to maintain consistency
      }
    });
    
    console.log(`   Found ${listAVCountsArray.length} records`);
    // Log first few to verify order
    listAVCountsArray.slice(0, 5).forEach(c => {
      console.log(`   listav=${c.listav}, titles=${c.titles}`);
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
        Library_Year: {
          year: year,
        },
      },
      include: {
        Library_Year: {
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


// Survey: Get EBook List.
export const getListEBookCountsByYear = async (year: number) => {
  try {
    const listEBookCountsArray = await db.list_EBook_Counts.findMany({
      where: {
        year,
        ishidden: false,
      },
      orderBy: {
        listebook: 'asc'  // Ensure consistent ordering
      }
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
        Library_Year: {
          year: year,
        },
      },
      include: {
        Library_Year: {
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

export const getListEJournalCountsByYear = async (year: number) => {
  try {
    return await db.list_EJournal_Counts.findMany({
      where: {
        year,
        NOT: { ishidden: true }, // includes false and null
      },
      select: {
        listejournal: true,
        journals: true,
        dbs: true, // <-- important
      },
      orderBy: { listejournal: "asc" },
    });
  } catch (e) {
    console.error("getListEJournalCountsByYear failed:", e);
    return null;
  }
};



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
    // First get all library-year relationships for this ejournal
    const relationships = await db.libraryYear_ListEJournal.findMany({
      where: {
        listejournal_id: listEJournalId,
      },
      include: {
        Library_Year: true,
      },
    });

    // Filter by year and extract library IDs
    const libraryIds = relationships
      .filter((rel) => rel.Library_Year?.year === year)
      .map((rel) => rel.Library_Year?.library)
      .filter((id) => id !== null && id !== undefined);

    return libraryIds;
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return null;
  }
}

// Role management functions for super admin
export const addUserRole = async (userId: number, roleId: number) => {
  try {
    const existingRole = await db.users_Roles.findUnique({
      where: {
        user_id_role_id: {
          user_id: userId,
          role_id: roleId,
        },
      },
    });

    if (existingRole) {
      return { success: false, message: 'Role already assigned to user' };
    }

    const result = await db.users_Roles.create({
      data: {
        user_id: userId,
        role_id: roleId,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error adding user role:', error);
    return { success: false, message: 'Failed to add role to user' };
  }
};

export const removeUserRole = async (userId: number, roleId: number) => {
  try {
    const result = await db.users_Roles.delete({
      where: {
        user_id_role_id: {
          user_id: userId,
          role_id: roleId,
        },
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error removing user role:', error);
    return { success: false, message: 'Failed to remove role from user' };
  }
};

export const updateUserRoles = async (userId: number, roleIds: number[]) => {
  try {
    // Start a transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Remove all existing roles for the user
      await prisma.users_Roles.deleteMany({
        where: { user_id: userId },
      });

      // Add the new roles
      if (roleIds.length > 0) {
        await prisma.users_Roles.createMany({
          data: roleIds.map((roleId) => ({
            user_id: userId,
            role_id: roleId,
          })),
        });
      }

      // Return updated user with roles
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          User_Roles: {
            include: {
              Role: true,
            },
          },
        },
      });
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating user roles:', error);
    return { success: false, message: 'Failed to update user roles' };
  }
};

export const getUsersWithRoles = async () => {
  try {
    const users = await db.user.findMany({
      include: {
        User_Roles: {
          include: {
            Role: true,
          },
        },
        User_Library: {
          include: {
            Library: true,
          },
        },
      },
      orderBy: [
        { firstname: 'asc' },
        { lastname: 'asc' },
      ],
    });
    return users;
  } catch (error) {
    console.error('Error fetching users with roles:', error);
    return null;
  }
};
