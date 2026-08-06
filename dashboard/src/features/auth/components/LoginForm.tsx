"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginSchema, LoginSchema } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";

import { useAuthStore } from "@/store/auth.store";
import { TOKEN_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>

        <p className="mt-2 text-sm text-slate-500">
          Sign in to your Foodaji dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>

          <input
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>

          <input
            type="password"
            {...register("password")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
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
          <p className="text-center text-sm text-red-600">
            Invalid email or password.
          </p>
        )}
      </form>
    </div>
  );
}
