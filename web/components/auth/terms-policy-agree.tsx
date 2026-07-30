"use client"

import Link from "next/link"
import { useId } from "react"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"

type TermsPolicyAgreeProps = {
  agreed: boolean
  setAgreed: React.Dispatch<React.SetStateAction<boolean>>
  isPending: boolean
}

const TermsPolicyAgree = ({
  agreed,
  setAgreed,
  isPending,
}: TermsPolicyAgreeProps) => {
  const id = useId()

  return (
    <div className="flex items-start gap-2.5 select-none">
      <Checkbox
        id={id}
        checked={agreed}
        onCheckedChange={setAgreed}
        disabled={isPending}
        className="mt-0.5 size-5 shrink-0 rounded-full border-2 border-border accent-primary disabled:opacity-50"
      />
      <Label
        htmlFor={id}
        className="block min-w-0 flex-1 text-sm text-muted-foreground font-semibold leading-snug cursor-pointer"
      >
        I agree to the{" "}
        <Link
          href="/privacy"
          className="text-primary font-black hover:underline"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-primary font-black hover:underline">
          Terms of Service
        </Link>
      </Label>
    </div>
  )
}

export default TermsPolicyAgree
