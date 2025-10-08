"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SingleUserType } from "@/types/types";
import Link from "next/link";
import { LocalDateTime } from "@/components/LocalDateTime";
import {
  User,
  Calendar,
  Mail,
  Building,
  Settings,
} from "lucide-react";
import { EditNameDialog } from "@/components/EditNameDialog";

interface UserProfileProps {
  user: SingleUserType;
  roles: string[];
  library: { id: number; name: string } | null;
  lastLogin?: string;
}

export function UserProfile({
  user,
  roles,
  library,
  lastLogin,
}: UserProfileProps) {
  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div>
            <CardTitle className="text-xl">Hello {user.firstname}</CardTitle>
            <CardDescription>Welcome back to your dashboard</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {lastLogin && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last Login:</span>
              <span className="font-medium">
                <LocalDateTime dateString={lastLogin} />
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Name:</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium">
                {user.firstname || user.lastname 
                  ? `${user.firstname || ''} ${user.lastname || ''}`.trim()
                  : <span className="text-muted-foreground italic">No name set</span>
                }
              </span>
              <EditNameDialog 
                currentFirstName={user.firstname}
                currentLastName={user.lastname}
              />
            </div>
          </div>

          {user.username && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <Link href={`mailto:${user.username}`} className="font-medium">
                {user.username}
              </Link>
            </div>
          )}

          {roles && roles.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <Settings className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">Role:</span>
              <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                {roles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {library && (
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Institution:</span>
              <Link href={`/libraries/${library.id}`} className="font-medium">
                {library.name}
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
