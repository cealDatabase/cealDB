"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X, User, Shield, Building } from "lucide-react";
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

interface Role {
  id: number;
  name: string;
  role: string;
}

interface Library {
  id: number;
  library_name: string;
  type: number;
}

interface RoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: (updatedUser: User) => void;
}

export function RoleEditModal({ isOpen, onClose, user, onUserUpdated }: RoleEditModalProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | null>(null);
  const [availableLibraries, setAvailableLibraries] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRoles, setIsFetchingRoles] = useState(false);
  const [isFetchingLibraries, setIsFetchingLibraries] = useState(false);

  // Initialize selected roles and library when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      const currentRoleIds = user.User_Roles.map(ur => ur.role_id);
      setSelectedRoleIds(currentRoleIds);
      
      // Set selected library
      const currentLibraryId = user.User_Library?.[0]?.Library?.id || null;
      setSelectedLibraryId(currentLibraryId);
    }
  }, [user, isOpen]);

  // Fetch available roles and libraries when modal opens
  useEffect(() => {
    if (isOpen) {
      if (availableRoles.length === 0) {
        fetchRoles();
      }
      if (availableLibraries.length === 0) {
        fetchLibraries();
      }
    }
  }, [isOpen, availableRoles.length, availableLibraries.length]);

  const fetchRoles = async () => {
    setIsFetchingRoles(true);
    try {
      const response = await fetch('/api/admin/roles');
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await response.json();
      setAvailableRoles(data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load available roles');
    } finally {
      setIsFetchingRoles(false);
    }
  };

  const fetchLibraries = async () => {
    setIsFetchingLibraries(true);
    try {
      const response = await fetch('/api/admin/libraries');
      if (!response.ok) {
        throw new Error('Failed to fetch libraries');
      }
      const data = await response.json();
      setAvailableLibraries(data.libraries || []);
    } catch (error) {
      console.error('Error fetching libraries:', error);
      toast.error('Failed to load available libraries');
    } finally {
      setIsFetchingLibraries(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update roles
      const rolesResponse = await fetch(`/api/admin/users/${user.id}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleIds: selectedRoleIds,
        }),
      });

      if (!rolesResponse.ok) {
        const errorData = await rolesResponse.json();
        throw new Error(errorData.error || 'Failed to update roles');
      }

      // Update library assignment if changed
      const currentLibraryId = user.User_Library?.[0]?.Library?.id || null;
      if (selectedLibraryId !== currentLibraryId) {
        const libraryResponse = await fetch(`/api/admin/users/${user.id}/library`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            libraryId: selectedLibraryId,
          }),
        });

        if (!libraryResponse.ok) {
          const errorData = await libraryResponse.json();
          throw new Error(errorData.error || 'Failed to update library assignment');
        }

        const libraryData = await libraryResponse.json();
        if (libraryData.user) {
          onUserUpdated(libraryData.user);
        }
      } else {
        const rolesData = await rolesResponse.json();
        if (rolesData.user) {
          onUserUpdated(rolesData.user);
        }
      }

      toast.success('User information updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const userName = user.firstname && user.lastname 
    ? `${user.firstname} ${user.lastname}` 
    : user.username;

  const userLibrary = user.User_Library?.[0]?.Library?.library_name || 'No library assigned';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Edit User Roles
          </DialogTitle>
          <DialogDescription>
            Modify role assignments for this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Information */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{userName}</h3>
                <p className="text-sm text-muted-foreground">{user.username}</p>
                <p className="text-xs text-muted-foreground mt-1">{userLibrary}</p>
              </div>
            </div>
          </div>

          {/* Current Roles */}
          {user.User_Roles.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Current Roles:</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {user.User_Roles.map((userRole) => (
                  <Badge key={userRole.role_id} variant="secondary" className="text-xs">
                    {userRole.Role.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Library Assignment */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Building className="w-4 h-4" />
              Assign Institution:
            </Label>
            {isFetchingLibraries ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading institutions...</span>
              </div>
            ) : (
              <select
                value={selectedLibraryId || ""}
                onChange={(e) => setSelectedLibraryId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full mt-2 p-2 border rounded-md bg-background text-sm"
              >
                <option value="">No institution assigned</option>
                {availableLibraries.map((library) => (
                  <option key={library.id} value={library.id}>
                    {library.library_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <Label className="text-sm font-medium">Assign Roles:</Label>
            {isFetchingRoles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading roles...</span>
              </div>
            ) : (
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {availableRoles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoleIds.includes(role.id)}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                    />
                    <Label 
                      htmlFor={`role-${role.id}`} 
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {role.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading || isFetchingRoles || isFetchingLibraries}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
