"use client"

import Link from "next/link"
import { useId } from "react"
import { Checkbox } from "../ui/checkbox"

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
      <label
        htmlFor={id}
        className="text-sm text-muted-foreground font-semibold leading-snug cursor-pointer"
      >
        I agree to the{" "}
        <Link href="/" className="text-primary font-black hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/" className="text-primary font-black hover:underline">
          Terms of Service
        </Link>
      </label>
    </div>
  )
}

export default TermsPolicyAgree
