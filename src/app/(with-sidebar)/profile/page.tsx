"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ProfileAvatar } from './profile-avatar';
import { EditProfileDialog } from './edit-profile-dialog';
import { User, Mail, GraduationCap, Calendar, Edit, Shield, BookOpen, Tally5 } from "lucide-react";
import { api } from '~/trpc/react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: userStats, isLoading: statsLoading } = api.lessonTracker.getUserStats.useQuery();
  const { data: user, isLoading: userLoading, refetch: refetchUser } = api.user.getCurrentUser.useQuery();

  if (userLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-4">
        <div className="space-y-4">
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array<number>(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array<number>(2)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-5xl mx-auto p-4">
        <p>User not found</p>
      </div>
    );
  }

  const handleProfileUpdate = async () => {
    try {
      await refetchUser();
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to refresh profile data");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive" as const;
      case "TEACHER":
        return "default" as const;
      case "STUDENT":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="container max-w-5xl mx-auto space-y-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <ProfileAvatar
                  src={user.image ?? ""}
                  name={user.name}
                  size="xl"
                  className="duration-300"
                />
                <div className="absolute -bottom-1 -right-1">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h1 className="text-2xl font-bold text-foreground animate-in slide-in-from-left-5 duration-300">
                    {user.name}
                  </h1>
                  <Button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="w-fit animate-in slide-in-from-right-5 duration-300 cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 animate-in slide-in-from-left-5 duration-300 delay-100">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.nim && (
                    <div className="flex items-center gap-2 animate-in slide-in-from-left-5 duration-300 delay-150">
                      <User className="h-4 w-4" />
                      <span>NIM: {user.nim}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  ) : (
                    userStats?.activeCourses ?? 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  ) : (
                    userStats?.weeklyMinutes ?? 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Weekly Learning Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Tally5 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  ) : (
                    userStats?.totalSessions ?? 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Learning Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Faculty</label>
              <p className="text-sm">{user.faculty ?? "Not specified"}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Program</label>
              <p className="text-sm">{user.program ?? "Not specified"}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Position</label>
              <p className="text-sm">{user.position ?? "Not specified"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">{formatDate(user.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}