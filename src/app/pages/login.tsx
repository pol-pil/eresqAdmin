import { SignIn, useClerk, useUser } from "@clerk/clerk-react"
import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

export default function AdminLoginPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [isCheckingRole, setIsCheckingRole] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) return
    if (user.publicMetadata.role !== "admin") {
      setIsCheckingRole(true)
      signOut().finally(() => setIsCheckingRole(false))
    }
  }, [user, isLoaded, signOut])

  if (!isLoaded || isCheckingRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Checking permissions...</div>
      </div>
    )
  }

  if (user) {
    return user.publicMetadata.role === "admin" 
      ? <Navigate to="/" replace />
      : (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">Unauthorized: Admin access only</p>
            <p className="text-gray-600">You have been signed out automatically.</p>
          </div>
        </div>
      )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <SignIn
        path="/login"
        routing="path"
        appearance={{
          elements: {
            socialButtonsBlock: "hidden",
            footerAction: "hidden",
            footer: "hidden",
            headerSubtitle: "hidden",
          },
        }}
      />
    </div>
  )
}