"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginSchema, LoginSchema } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";

import { useAuthStore } from "@/store/auth.store";
import { TOKEN_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FoodajiLogo } from "@/components/brand/FoodajiLogo";

export default function LoginForm() {
  const router = useRouter();

  const loginMutation = useLogin();

  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginSchema) => {
    try {
      const data = await loginMutation.mutateAsync(values);

      localStorage.setItem(TOKEN_KEY, data.accessToken);

      login(data.accessToken, data.user);

      router.push("/dashboard");
    } catch {
      // The mutation exposes the error state for the user-facing message below.
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
      <div className="mb-8">
        <FoodajiLogo compact className="mb-6" />
        <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your Foodaji dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium">
            Email
          </label>

          <input
            id="login-email"
            type="email"
            {...register("email")}
            autoComplete="email"
            aria-describedby={errors.email ? "login-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            className="w-full rounded-md border border-input bg-muted/50 px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
          />

          {errors.email && (
            <p id="login-email-error" className="mt-1 text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            {...register("password")}
            autoComplete="current-password"
            aria-describedby={errors.password ? "login-password-error" : undefined}
            aria-invalid={Boolean(errors.password)}
            className="w-full rounded-md border border-input bg-muted/50 px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
          />

          {errors.password && (
            <p id="login-password-error" className="mt-1 text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing In..." : "Sign In"}
        </Button>

        {loginMutation.isError && (
          <p className="text-center text-sm text-destructive" role="alert">
            Invalid email or password.
          </p>
        )}
      </form>
    </div>
  );
}
