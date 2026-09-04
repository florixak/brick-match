"use client"

import {
  ChangePasswordRequestSchema,
  DeleteAccountRequestSchema,
  UpdateEmailRequestSchema,
} from "@brick-match/shared-types"
import { ChevronDownIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { parseApiError } from "@/lib/api/client"
import {
  useChangePasswordMutation,
  useCurrentUser,
  useDeleteAccountMutation,
  useUpdateEmailMutation,
} from "@/lib/queries"
import PasswordField from "../auth/password-field"
import { Button } from "../ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { FieldLabel } from "../ui/field-label"
import { Input } from "../ui/input"

type AccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function UpdateEmailSection() {
  const { data: user } = useCurrentUser()
  const { mutate, isPending } = useUpdateEmailMutation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{
    email?: string
    currentPassword?: string
  }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsed = UpdateEmailRequestSchema.safeParse({
      email,
      currentPassword: password,
    })

    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof typeof errors
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    mutate(parsed.data, {
      onSuccess: () => {
        setEmail("")
        setPassword("")
      },
      onError: (error) => {
        const apiError = parseApiError(error)
        toast.error(apiError?.body.message ?? "Failed to update email.")
      },
    })
  }

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4 shadow-md">
      <div className="mb-4">
        <h3 className="text-xs font-black uppercase tracking-wide">
          Email Address
        </h3>
        {user?.email && (
          <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <FieldLabel htmlFor="account-new-email" className="mb-1.5">
            New Email
          </FieldLabel>
          <Input
            id="account-new-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            aria-invalid={!!errors.email}
            autoComplete="email"
            disabled={isPending}
            className="border-border bg-card font-semibold"
          />
          {errors.email && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="account-email-password" className="mb-1.5">
            Current Password
          </FieldLabel>
          <PasswordField
            id="account-email-password"
            value={password}
            onChange={(v) => {
              setPassword(v)
              if (errors.currentPassword)
                setErrors((prev) => ({ ...prev, currentPassword: undefined }))
            }}
            autoComplete="current-password"
            disabled={isPending}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending || !email || !password}
          className="w-full"
        >
          {isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            "Update Email"
          )}
        </Button>
      </form>
    </section>
  )
}

function ChangePasswordSection() {
  const { mutate, isPending } = useChangePasswordMutation()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    const parsed = ChangePasswordRequestSchema.safeParse({
      currentPassword,
      newPassword,
    })

    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof typeof errors
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    mutate(parsed.data, {
      onSuccess: () => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      },
      onError: (error) => {
        const apiError = parseApiError(error)
        toast.error(apiError?.body.message ?? "Failed to change password.")
      },
    })
  }

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4 shadow-md">
      <h3 className="mb-4 text-xs font-black uppercase tracking-wide">
        Change Password
      </h3>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <FieldLabel htmlFor="account-current-password" className="mb-1.5">
            Current Password
          </FieldLabel>
          <PasswordField
            id="account-current-password"
            value={currentPassword}
            onChange={(v) => {
              setCurrentPassword(v)
              if (errors.currentPassword)
                setErrors((prev) => ({ ...prev, currentPassword: undefined }))
            }}
            autoComplete="current-password"
            disabled={isPending}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="account-new-password" className="mb-1.5">
            New Password
          </FieldLabel>
          <PasswordField
            id="account-new-password"
            value={newPassword}
            onChange={(v) => {
              setNewPassword(v)
              if (errors.newPassword)
                setErrors((prev) => ({ ...prev, newPassword: undefined }))
            }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={isPending}
          />
          {errors.newPassword && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              {errors.newPassword}
            </p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="account-confirm-password" className="mb-1.5">
            Confirm New Password
          </FieldLabel>
          <PasswordField
            id="account-confirm-password"
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v)
              if (errors.confirmPassword)
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: undefined,
                }))
            }}
            placeholder="Repeat your new password"
            autoComplete="new-password"
            disabled={isPending}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={
            isPending || !currentPassword || !newPassword || !confirmPassword
          }
          className="w-full"
        >
          {isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            "Change Password"
          )}
        </Button>
      </form>
    </section>
  )
}

function DeleteAccountSection() {
  const { mutate, isPending } = useDeleteAccountMutation()
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ currentPassword?: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsed = DeleteAccountRequestSchema.safeParse({
      currentPassword: password,
    })

    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof typeof errors
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    mutate(parsed.data, {
      onError: (error) => {
        const apiError = parseApiError(error)
        toast.error(apiError?.body.message ?? "Failed to delete account.")
      },
    })
  }

  return (
    <Collapsible>
      <section className="overflow-hidden rounded-2xl border-2 border-destructive/40 bg-destructive/5 shadow-md">
        <CollapsibleTrigger className="group w-full p-4 transition-colors hover:bg-destructive/10 focus-visible:ring-inset flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-xs font-black uppercase tracking-wide text-destructive">
              Danger Zone
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanently delete your account
            </p>
          </div>
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-destructive transition-transform group-aria-expanded:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-4 border-t border-destructive/20 px-4 pt-4 pb-4">
            <p className="text-xs text-muted-foreground">
              This action is permanent and cannot be undone. All your owned
              parts and data will be deleted immediately.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <FieldLabel
                  htmlFor="account-delete-password"
                  className="mb-1.5"
                >
                  Current Password
                </FieldLabel>
                <PasswordField
                  id="account-delete-password"
                  value={password}
                  onChange={(v) => {
                    setPassword(v)
                    if (errors.currentPassword) setErrors({})
                  }}
                  autoComplete="current-password"
                  disabled={isPending}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-xs font-semibold text-destructive">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="destructive"
                disabled={isPending || !password}
                className="w-full"
              >
                {isPending ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete My Account"
                )}
              </Button>
            </form>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}

const AccountDialog = ({ open, onOpenChange }: AccountDialogProps) => {
  const [resetKey, setResetKey] = useState(0)

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) setResetKey((k) => k + 1)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
        </DialogHeader>

        <div
          key={resetKey}
          className="-mx-4 flex flex-col gap-3 overflow-y-auto px-4 pb-1 max-h-[70vh]"
        >
          <UpdateEmailSection />
          <ChangePasswordSection />
          <DeleteAccountSection />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AccountDialog
