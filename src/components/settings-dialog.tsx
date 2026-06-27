import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import { useUser, useClerk } from "@clerk/clerk-react"
  import { User } from "lucide-react"
  
  export function SettingsDialog() {
    const { user } = useUser()
    const { signOut } = useClerk()
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md hover:bg-accent">
            <User className="min-w-4 h-4" />
            <span className="overflow-hidden">Profile</span>
          </div>
        </DialogTrigger>
  
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
  
          <div className="flex flex-col items-center mt-6 space-y-3">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
  
            <div className="text-center">
              <p className="font-medium text-lg">{user?.fullName || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
  
          <div className="mt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => signOut()}
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  