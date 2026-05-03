import tapyIcon from "@/assets/tapy.png";
import tapyocaLogoClean from "@/assets/tapyoca-logo-clean.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { getPasswordValidations, validatePassword } from "@/utils/validations";
import { CheckCircle2, Eye, EyeClosed, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { updateUserPassword } = UserAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordValidations = getPasswordValidations(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await updateUserPassword(password);
    setIsSubmitting(false);

    if (!result?.success) {
      setError(result?.error || "Unable to update your password. Please request a new reset link.");
      return;
    }

    navigate("/signin");
  };

  return (
    <div className="min-h-screen min-[980px]:grid min-[980px]:grid-cols-[1fr_minmax(36rem,1fr)]">
      <section className="auth-left-background flex items-center justify-center p-6 min-[980px]:p-10">
        <div className="flex w-full max-w-lg flex-col items-center gap-2.5 text-center">
          <img
            src={tapyIcon}
            alt="Creator Copilot icon"
            className="h-28 w-28 min-[980px]:h-32 min-[980px]:w-32"
          />
          <h1 className="text-4xl font-semibold tracking-tight text-foreground min-[980px]:text-5xl">
            Creator Copilot
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-xl font-medium text-muted-foreground min-[980px]:text-3xl">
              powered by
            </p>
            <img
              src={tapyocaLogoClean}
              alt="Tapyoca"
              className="mt-2.5 h-6 w-auto min-[980px]:h-7"
            />
          </div>
        </div>
      </section>

      <section className="auth-right-background flex items-center justify-center p-6 min-[980px]:p-12 min-[1200px]:p-16">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tight">Reset Password</h2>
            <p className="text-muted-foreground">Choose a new password for your account.</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute top-0 right-0 px-3 text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </Button>
                <div className="mt-2 space-y-1">
                  {passwordValidations.map((validation, index) => (
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        validation.valid ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      }`}
                      key={index}
                    >
                      {validation.valid ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      <span>{validation.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
            <p className="text-sm">
              Need another reset link?
              <Link to="/forgot-password" className="ml-1 font-semibold text-primary hover:underline">
                Request one
              </Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ResetPassword;
