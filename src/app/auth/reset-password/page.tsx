// "use client";

// import { useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "@tanstack/react-query";
// // import { Suspense } from "react";
// import {
//   resetPasswordFormSchema,
//   ResetPasswordFormInput,
// } from "@/lib/validations/auth";

// import { useToast } from "@/components/ui/ToastProvider";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// export default function ResetPasswordPage() {
//   const { showToast } = useToast();
//   const router = useRouter();

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const searchParams = useSearchParams();

//   const token = searchParams?.get("token");

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ResetPasswordFormInput>({
//     resolver: zodResolver(resetPasswordFormSchema),
//     mode: "onBlur",
//     defaultValues: {
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const mutation = useMutation({
//     mutationFn: async (formData: ResetPasswordFormInput) => {
//       if (!token) {
//         throw new Error("Invalid or missing reset token.");
//       }

//       console.log("TOKEN FROM URL:", token);
//       console.log("FORM DATA:", formData);

//       const response = await fetch("/api/auth", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           action: "reset-password",
//           token,
//           password: formData.password,
//           confirmPassword: formData.confirmPassword,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Password reset failed.");
//       }

//       return data;
//     },

//     onSuccess: (data) => {
//       showToast(
//         data.message || "Password reset successfully. You can now login.",
//         "success",
//       );

//       setTimeout(() => {
//         router.push("/auth/login");
//       }, 1000);
//     },

//     onError: (error) => {
//       showToast(error.message || "Password reset failed.", "error");
//     },
//   });

//   const onSubmit = (data: ResetPasswordFormInput) => {
//     console.log("SUBMIT FIRED:", data);

//     mutation.mutate(data);
//   };
//   return (
//     <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-md">
//       {/* Heading */}
//       <div className="mb-8 text-center">
//         <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
//           Reset Password
//         </h2>

//         <p className="mt-2 text-sm text-zinc-500">
//           Enter your new password below.
//         </p>
//       </div>

//       <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
//         <div>
//           <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
//             New Password
//           </label>

//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               {...register("password")}
//               className={`w-full rounded-lg border py-2.5 pl-4 pr-10 text-sm text-zinc-900 outline-none transition ${
//                 errors.password
//                   ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
//                   : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
//               }`}
//               placeholder="••••••••"
//             />

//             <button
//               type="button"
//               onClick={() => setShowPassword((prev) => !prev)}
//               className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-zinc-400 hover:text-zinc-600"
//               aria-label={showPassword ? "Hide password" : "Show password"}
//             >
//               <FontAwesomeIcon
//                 icon={showPassword ? faEyeSlash : faEye}
//                 className="h-4 w-4"
//               />
//             </button>
//           </div>

//           {errors.password && (
//             <p className="mt-1 text-xs font-medium text-red-500">
//               {errors.password.message}
//             </p>
//           )}
//         </div>

//         <div>
//           <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
//             Confirm Password
//           </label>

//           <div className="relative">
//             <input
//               type={showConfirmPassword ? "text" : "password"}
//               {...register("confirmPassword")}
//               className={`w-full rounded-lg border py-2.5 pl-4 pr-10 text-sm text-zinc-900 outline-none transition ${
//                 errors.confirmPassword
//                   ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
//                   : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
//               }`}
//               placeholder="••••••••"
//             />

//             <button
//               type="button"
//               onClick={() => setShowConfirmPassword((prev) => !prev)}
//               className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-zinc-400 hover:text-zinc-600"
//               aria-label={
//                 showConfirmPassword ? "Hide password" : "Show password"
//               }
//             >
//               <FontAwesomeIcon
//                 icon={showConfirmPassword ? faEyeSlash : faEye}
//                 className="h-4 w-4"
//               />
//             </button>
//           </div>

//           {errors.confirmPassword && (
//             <p className="mt-1 text-xs font-medium text-red-500">
//               {errors.confirmPassword.message}
//             </p>
//           )}
//         </div>

//         <button
//           type="submit"
//           disabled={mutation.isPending || !token}
//           className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--board-ink)] py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--board-panel)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           {mutation.isPending ? (
//             <>
//               <LoadingSpinner size="sm" />
//               <span>Resetting password...</span>
//             </>
//           ) : (
//             "Reset Password"
//           )}
//         </button>
//         <button type="submit" disabled={mutation.isPending || !token}></button>
//         <p className="text-center text-sm text-zinc-500">
//           Remember your password?{" "}
//           <a
//             href="/auth/login"
//             className="font-semibold text-[var(--board-ink)]"
//           >
//             Login
//           </a>
//         </p>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import {
  resetPasswordFormSchema,
  ResetPasswordFormInput,
} from "@/lib/validations/auth";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function ResetPasswordPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onBlur",

    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: ResetPasswordFormInput) => {
      if (!token) {
        throw new Error("Invalid or missing reset token.");
      }

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset-password",
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed.");
      }

      return data;
    },

    onSuccess: (data) => {
      showToast(
        data.message || "Password reset successfully. You can now login.",
        "success",
      );

      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    },

    onError: (error) => {
      showToast(error.message || "Password reset failed.", "error");
    },
  });

  const onSubmit = (data: ResetPasswordFormInput) => {
    mutation.mutate(data);
  };

  return (
    <>
      <main className="reset-page">
        <section className="reset-card">
          {/* Heading */}
          <div className="reset-heading">
            <h1>Reset your password</h1>

            <p>Choose a new password for your Flowboard account.</p>
          </div>

          {/* Invalid Token */}
          {!token && (
            <div className="reset-alert">
              <p>This password reset link is invalid or has expired.</p>
            </div>
          )}

          {/* Form */}
          <form
            className="reset-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* New Password */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">
                New password
              </label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  className={`form-input ${
                    errors.password ? "input-error" : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="password-toggle"
                  aria-label={
                    showPassword ? "Hide new password" : "Show new password"
                  }
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-field">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>

              <div className="password-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  className={`form-input ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="password-toggle"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending || !token}
              className="reset-submit"
            >
              {mutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Resetting password...</span>
                </>
              ) : (
                "Reset password"
              )}
            </button>

            {/* Login */}
            <p className="reset-footer">
              Remember your password? <a href="/auth/login">Sign in</a>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
