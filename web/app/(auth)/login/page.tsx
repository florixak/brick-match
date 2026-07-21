import AuthCard from "@/components/auth/auth-card"
import LoginForm from "@/components/auth/login-form"
import Studs from "@/components/layout/studs"

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Studs count={5} />
        <AuthCard
          title="Welcome Back"
          subtitle="Log in to BrickMatch"
          type="login"
        >
          <LoginForm />
        </AuthCard>
      </div>
    </div>
  )
}

export default LoginPage
