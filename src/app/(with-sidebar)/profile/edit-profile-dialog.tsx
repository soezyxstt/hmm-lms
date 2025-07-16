"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { ProfileAvatar } from './profile-avatar'
import { editProfileSchema, type EditProfileInput } from '~/lib/schema/profile'
import type { User } from "~/lib/types/user"
import { Loader2, Save, X } from "lucide-react"
import { toast } from 'sonner'

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onUpdate: (data: Partial<User>) => void
}

export function EditProfileDialog({ isOpen, onClose, user, onUpdate }: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user.name,
      faculty: user.faculty ?? "",
      program: user.program ?? "",
      image: user.image ?? "",
    },
  })

  const onSubmit = async (data: EditProfileInput) => {
    setIsLoading(true)

    try {
      // Simulate API call - replace with actual tRPC mutation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock success
      onUpdate(data)
      toast.success("Profile updated successfully!")
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (image: string) => {
    form.setValue("image", image)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <ProfileAvatar
                src={form.watch("image")}
                name={form.watch("name")}
                size="xl"
                editable
                onImageChange={handleImageChange}
                className="animate-in zoom-in-95 duration-300"
              />
              <p className="text-sm text-gray-500 text-center">Click on the avatar to change your profile picture</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your full name"
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Read-only fields */}
              <div className="space-y-4 opacity-60">
                <div>
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {user.nim && (
                  <div>
                    <Label>NIM</Label>
                    <Input value={user.nim} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">NIM cannot be changed</p>
                  </div>
                )}

                {user.position && (
                  <div>
                    <Label>Position</Label>
                    <Input value={user.position} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">Position cannot be changed</p>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="faculty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your faculty"
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your program"
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 transition-all duration-200 hover:scale-[1.02] bg-transparent"
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
