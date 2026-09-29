import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
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
              <ResetPasswordForm />
            </div>
          </section>
        </div>
      </main>
    </Suspense>
  );
}
