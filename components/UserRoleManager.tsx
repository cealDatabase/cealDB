"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoleEditModal } from "./RoleEditModal";
import { 
  Users, 
  Search, 
  Edit, 
  Mail, 
  Building, 
  Shield,
  Loader2,
  AlertCircle,
  Trash2 
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  firstname: string | null;
  lastname: string | null;
  username: string;
  isactive: boolean;
  User_Roles: Array<{
    role_id: number;
    Role: {
      id: number;
      name: string;
      role: string;
    };
  }>;
  User_Library: Array<{
    Library: {
      id: number;
      library_name: string;
    };
  }>;
}

export function UserRoleManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const name = `${user.firstname || ''} ${user.lastname || ''}`.toLowerCase();
        const email = user.username.toLowerCase();
        const library = user.User_Library?.[0]?.Library?.library_name?.toLowerCase() || '';
        const roles = user.User_Roles.map(ur => ur.Role.name.toLowerCase()).join(' ');
        
        const searchLower = searchTerm.toLowerCase();
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               library.includes(searchLower) || 
               roles.includes(searchLower);
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoles = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    // Update the user in the users array
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  const handleDeleteUser = async (user: User) => {
    const userName = getUserDisplayName(user);
    const confirmMessage = `Are you sure you want to delete ${userName}?\n\nThis will permanently delete:\n• User account\n• All role assignments\n• All library associations\n• All active sessions\n\nAudit logs will be preserved for historical records.\n\nThis action CANNOT be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingUserId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      const data = await response.json();
      
      // Remove user from the list
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
      
      toast.success(`User ${userName} deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    return user.username;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>User Role Management</CardTitle>
              <CardDescription>
                Manage roles for all users in the system
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users by name, email, library, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 space-x-4 space-y-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{getUserDisplayName(user)}</h3>
                        {!user.isactive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span>{user.username}</span>
                        </div>
                        
                        {user.User_Library?.[0]?.Library && (
                          <div className="flex items-center gap-2">
                            <Building className="w-3 h-3" />
                            <span>{user.User_Library[0].Library.library_name}</span>
                          </div>
                        )}
                        
                        {user.User_Roles.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3" />
                            <div className="flex flex-wrap gap-1">
                              {user.User_Roles.map((userRole) => (
                                <Badge 
                                  key={userRole.role_id} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {userRole.Role.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRoles(user)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        <span className="inline md:hidden">Edit</span>
                        <span className="hidden md:inline">Edit Roles</span>
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingUserId === user.id}
                      >
                        {deletingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RoleEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
