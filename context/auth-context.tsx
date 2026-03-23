import type { UseMutationResult } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { createContext, useContext } from "react";
import { toast } from "sonner";
import { useTRPCClient } from "@/lib/trpc";
import { useCart } from "./cart-context";

type AuthContextType = {
  user:
    | { name?: string | null; email?: string | null; image?: string | null }
    | undefined;
  signUp: UseMutationResult<
    unknown,
    unknown,
    { name: string; email: string; password: string },
    unknown
  >;
  logIn: UseMutationResult<
    unknown,
    unknown,
    { email: string; password: string },
    unknown
  >;
  isLoading: boolean;
  isAuthenticated: boolean;

  logOut: UseMutationResult<unknown, unknown, void, unknown>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpcClient = useTRPCClient();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { clear } = useCart();

  const { data, status, update } = useSession();

  const logIn = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const result = await signIn("credentials", {
        ...input,
        redirect: false,
      });
      if (!result || result.error) {
        throw new Error("Credenciais inválidas");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      // biome-ignore lint/suspicious/noExplicitAny: we need to use the redirectTo as a string
      router.replace(redirectTo ?? ("/" as any));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao fazer login"
      );
    },
  });

  const signUp = useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
    }) => {
      await trpcClient.auth.signup.mutate(input);
      const result = await signIn("credentials", {
        email: input.email,
        password: input.password,
        redirect: false,
      });
      if (!result || result.error) {
        throw new Error(
          "Conta criada, mas não foi possível fazer login automático."
        );
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      // biome-ignore lint/suspicious/noExplicitAny: we need to use the redirectTo as a string
      router.replace(redirectTo ?? ("/" as any));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar conta"
      );
    },
  });

  const logOut = useMutation({
    mutationFn: async () => {
      await signOut({ redirect: false });
    },
    onSuccess: async () => {
      toast.success("Usuário saiu.");
      clear();
      queryClient.invalidateQueries();
      await update();
      router.replace("/");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao sair");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: data?.user,
        isLoading: status === "loading",
        isAuthenticated: status === "authenticated",
        signUp,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
