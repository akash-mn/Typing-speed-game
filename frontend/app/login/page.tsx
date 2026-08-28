import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-145px)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <p className="mb-5 text-center text-xs uppercase tracking-[0.22em] text-brass-dim">Welcome back</p>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}