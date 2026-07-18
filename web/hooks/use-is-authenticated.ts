import { useCurrentUser } from "@/lib/queries"

const useIsAuthenticated = (): boolean => {
  const { data: user, isPending } = useCurrentUser()
  return !isPending && user !== null
}

export default useIsAuthenticated
