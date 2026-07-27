import AuthCard from "@/components/auth/auth-card"
import RegisterForm from "@/components/auth/register-form"
import Studs from "@/components/layout/studs"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Register",
  description: "Create an account to start using BrickMatch.",
})

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Studs count={5} bgColorClassName="bg-accent" />
        <AuthCard
          title="Create an Account"
          subtitle="Join BrickMatch and start matching your bricks"
          type="register"
        >
          <RegisterForm />
        </AuthCard>
      </div>
    </div>
  )
}

export default RegisterPage
