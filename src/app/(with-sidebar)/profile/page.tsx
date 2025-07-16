"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { ProfileAvatar } from './profile-avatar'
import { EditProfileDialog } from './edit-profile-dialog'
import { User, Mail, GraduationCap, Calendar, Edit, Shield, BookOpen, Tally5 } from "lucide-react"
import type { User as userType } from '~/lib/types/user'
import type { Role } from '@prisma/client'

// Mock user data - replace with actual data fetching
const mockUser = {
  id: "1",
  name: "Adi Haditya Nursyam",
  email: "13122080@mahasiswa.itb.ac.id",
  nim: "13122080",
  faculty: "Faculty of Mechanical and Aerospace Engineering",
  program: "Mechanical Engineering",
  position: "Head of Sub-Bureau of Information and Technology Development",
  role: "STUDENT" as Role,
  image: "/placeholder.svg?height=200&width=200",
  courseCount: 5,
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-01-15"),
}

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleProfileUpdate = (updatedData: Partial<userType>) => {
    setUser((prev) => ({ ...prev, ...updatedData }))
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "TEACHER":
        return "default"
      case "STUDENT":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="container max-w-5xl mx-auto space-y-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <ProfileAvatar
                  src={user.image}
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
        <Card className="">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.courseCount || 0}</p>
                <p className="text-sm text-gray-500">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-sm text-gray-500">Weekly Learning Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tally5 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-500">Submit Try Out</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Faculty</label>
              <p className="text-sm">{user.faculty || "Not specified"}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Program</label>
              <p className="text-sm">{user.program || "Not specified"}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Position</label>
              <p className="text-sm">{user.position || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-sm">{formatDate(user.updatedAt)}</p>
            </div>
            <Separator />
            <div className="space-y-2 space-x-2">
              <label className="text-sm font-medium text-gray-500">Bio</label>
              <p className="text-sm">Follow my lead</p>
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
  )
}
