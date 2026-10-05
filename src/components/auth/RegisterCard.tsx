// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "@tanstack/react-query";

// import { registerSchema, RegisterInput } from "@/lib/validations/auth";

// import { useToast } from "@/components/ui/ToastProvider";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import { useRouter, useSearchParams } from "next/navigation";
// export default function RegisterCard() {
//   const searchParams = useSearchParams();

//   const redirect = searchParams.get("redirect");
//   const { showToast } = useToast();

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const router = useRouter();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RegisterInput>({
//     resolver: zodResolver(registerSchema),

//     // Validate when user leaves an input
//     mode: "onBlur",

//     defaultValues: {
//       name: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const mutation = useMutation({
//     mutationFn: async (formData: RegisterInput) => {
//       const response = await fetch("/api/auth", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           action: "register",
//           ...formData,
//           redirect,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Registration failed");
//       }

//       return data;
//     },

//     onSuccess: (data) => {
//       showToast(
//         data.message || "Please check your email to verify your account.",
//         "success",
//       );
//       if (redirect) {
//         router.replace(redirect);
//       } else {
//         router.replace("/auth/login");
//       }
//     },

//     onError: (error) => {
//       showToast(error.message || "Registration failed", "error");
//     },
//   });

//   const onSubmit = (data: RegisterInput) => {
//     mutation.mutate(data);
//   };

//   const loginUrl = redirect
//     ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
//     : "/auth/login";
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
//       <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-md">
//         {/* Heading */}
//         <div className="mb-8 text-center">
//           <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
//             Create an Account
//           </h2>

//           <p className="mt-1 text-sm text-zinc-500">
//             Get started with Flowboard
//           </p>
//         </div>

//         <form
//           className="space-y-5"
//           onSubmit={handleSubmit(onSubmit)}
//           noValidate
//         >
//           {/* Full Name */}
//           <div>
//             <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
//               Full Name
//             </label>

//             <input
//               type="text"
//               {...register("name")}
//               className={`w-full rounded-lg border px-4 py-2.5 text-sm text-zinc-900 outline-none transition ${
//                 errors.name
//                   ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
//                   : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
//               }`}
//               placeholder="Alex Mercer"
//             />

//             {errors.name && (
//               <p className="mt-1 text-xs font-medium text-red-500">
//                 {errors.name.message}
//               </p>
//             )}
//           </div>

//           {/* Email */}
//           <div>
//             <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
//               Email Address
//             </label>

//             <input
//               type="email"
//               {...register("email")}
//               className={`w-full rounded-lg border px-4 py-2.5 text-sm text-zinc-900 outline-none transition ${
//                 errors.email
//                   ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
//                   : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
//               }`}
//               placeholder="alex@example.com"
//             />

//             {errors.email && (
//               <p className="mt-1 text-xs font-medium text-red-500">
//                 {errors.email.message}
//               </p>
//             )}
//           </div>

//           {/* Password */}
//           <div>
//             <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
//               Password
//             </label>

//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 {...register("password")}
//                 className={`w-full rounded-lg border py-2.5 pl-4 pr-10 text-sm text-zinc-900 outline-none transition ${
//                   errors.password
//                     ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
//                     : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
//                 }`}
//                 placeholder="••••••••"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword((prev) => !prev)}
//                 className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-zinc-400 hover:text-zinc-600"
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 <FontAwesomeIcon
//                   icon={showPassword ? faEyeSlash : faEye}
//                   className="h-4 w-4"
//                 />
//               </button>
//             </div>

//             {errors.password && (
//               <p className="mt-1 text-xs font-medium text-red-500">
//                 {errors.password.message}
//               </p>
//             )}
//           </div>

//           {/* Confirm Password */}
//           <div>
//             <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
//               Confirm Password
//             </label>

//             <div className="relative">
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 {...register("confirmPassword")}
//                 className={`w-full rounded-lg border py-2.5 pl-4 pr-10 text-sm text-zinc-900 outline-none transition ${
//                   errors.confirmPassword
//                     ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
//                     : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
//                 }`}
//                 placeholder="••••••••"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword((prev) => !prev)}
//                 className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-zinc-400 hover:text-zinc-600"
//                 aria-label={
//                   showConfirmPassword ? "Hide password" : "Show password"
//                 }
//               >
//                 <FontAwesomeIcon
//                   icon={showConfirmPassword ? faEyeSlash : faEye}
//                   className="h-4 w-4"
//                 />
//               </button>
//             </div>

//             {errors.confirmPassword && (
//               <p className="mt-1 text-xs font-medium text-red-500">
//                 {errors.confirmPassword.message}
//               </p>
//             )}
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={mutation.isPending}
//             className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--board-ink)] py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--board-panel)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {mutation.isPending ? (
//               <>
//                 <LoadingSpinner size="sm" />
//                 <span>Registering account...</span>
//               </>
//             ) : (
//               "Sign Up"
//             )}
//           </button>

//           {/* Login */}
//           <p className="text-center text-zinc-500">
//             Already have an account?{" "}
//             <a
//               href={loginUrl}
//               className="font-semibold text-[var(--board-ink)]"
//             >
//               Login
//             </a>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { registerSchema, RegisterInput } from "@/lib/validations/auth";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import { useRouter, useSearchParams } from "next/navigation";

import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

export default function RegisterCard() {
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  const { showToast } = useToast();

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  /*
   * Watch password so we can show the
   * password strength UI from the design.
   */
  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordStrength = getPasswordStrength(password);

  const mutation = useMutation({
    mutationFn: async (formData: RegisterInput) => {
      const response = await fetch("/api/auth", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          action: "register",
          ...formData,
          redirect,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    },

    onSuccess: (data) => {
      showToast(
        data.message || "Please check your email to verify your account.",
        "success",
      );

      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace("/auth/login");
      }
    },

    onError: (error) => {
      showToast(error.message || "Registration failed", "error");
    },
  });

  const onSubmit = (data: RegisterInput) => {
    /*
     * Terms checkbox is UI state rather than part
     * of your existing RegisterInput schema.
     */
    if (!acceptedTerms) {
      showToast("Please agree to the Terms and Privacy Policy.", "error");

      return;
    }

    mutation.mutate(data);
  };

  const loginUrl = redirect
    ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
    : "/auth/login";

  return (
    <main className="auth-page">
      <div className="auth-layout">
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <AuthBrandPanel
          eyebrow="Issue tracking for product teams"
          title="Plan sprints, track issues and ship on time."
          description="Agile boards, workflows and time tracking — built for teams that move fast."
        />

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <section className="auth-form-panel">
          <div className="auth-form-container">
            {/* -------------------------------------------------
                Heading
            -------------------------------------------------- */}

            <div className="mb-5">
              <h1 className="auth-title">Create your account</h1>
            </div>

            {/* -------------------------------------------------
                Form
            -------------------------------------------------- */}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* =================================================
                  FULL NAME
              ================================================== */}

              <div>
                <label className="fb-label">Full name</label>

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Alex Mercer"
                    className={`fb-input pl-11 ${
                      errors.name ? "fb-input-error" : ""
                    }`}
                  />
                </div>

                {errors.name && (
                  <p className="fb-error">{errors.name.message}</p>
                )}
              </div>

              {/* =================================================
                  EMAIL
              ================================================== */}

              <div className="mt-5">
                <label className="fb-label">Work email</label>

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@company.com"
                    className={`fb-input pl-11 ${
                      errors.email ? "fb-input-error" : ""
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="fb-error">{errors.email.message}</p>
                )}
              </div>

              {/* =================================================
                  PASSWORD
              ================================================== */}

              <div className="mt-5">
                <label className="fb-label">Password</label>

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className={`fb-input pl-11 pr-11 ${
                      errors.password ? "fb-input-error" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="h-4 w-4"
                    />
                  </button>
                </div>

                {/* Password strength */}

                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mt-2 text-xs text-[var(--ink-soft)]">
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="fb-error">{errors.password.message}</p>
                )}
              </div>

              {/* =================================================
                  CONFIRM PASSWORD
              ================================================== */}

              <div className="mt-5">
                <label className="fb-label">Confirm password</label>

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="••••••••"
                    className={`fb-input pl-11 pr-11 ${
                      errors.confirmPassword ? "fb-input-error" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                      className="h-4 w-4"
                    />
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="fb-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* =================================================
                  TERMS & PRIVACY
              ================================================== */}

              <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm text-[var(--ink-soft)]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="fb-checkbox mt-0.5"
                />

                <span className="leading-5">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--indigo)] hover:underline"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--indigo)] hover:underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* =================================================
                  CREATE ACCOUNT
              ================================================== */}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-brand mt-5"
              >
                {mutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />

                    <span>Creating account...</span>
                  </>
                ) : (
                  "Create account"
                )}
              </button>

              {/* -------------------------------------------------
                  Bottom login
              -------------------------------------------------- */}

              <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
                Already have an account?{" "}
                <a
                  href={loginUrl}
                  className="font-semibold text-[var(--indigo)] hover:text-[var(--indigo-deep)]"
                >
                  Log in
                </a>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   PASSWORD STRENGTH
   ========================================================= */

function getPasswordStrength(password: string) {
  if (!password) {
    return {
      score: 0,
      label: "",
      color: "bg-slate-200",
    };
  }

  let score = 0;

  if (password.length >= 8) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  }

  if (/[0-9]/.test(password)) {
    score++;
  }

  if (/[@$!%*?&]/.test(password)) {
    score++;
  }

  if (score <= 1) {
    return {
      score,
      label: "Weak password — add more characters.",
      color: "bg-red-400",
    };
  }

  if (score === 2) {
    return {
      score,
      label: "Medium strength — add a number or symbol",
      color: "bg-[var(--amber)]",
    };
  }

  if (score === 3) {
    return {
      score,
      label: "Good strength — almost there",
      color: "bg-[var(--sky)]",
    };
  }

  return {
    score,
    label: "Strong password",
    color: "bg-[var(--sage)]",
  };
}
