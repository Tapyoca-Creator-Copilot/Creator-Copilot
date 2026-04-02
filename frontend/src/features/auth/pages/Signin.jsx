import tapyIcon from "@/assets/tapy.png";
import tapyocaLogoClean from "@/assets/tapyoca-logo-clean.svg";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import { useSignin } from '@/features/auth/hooks/useSignin';
import { Eye, EyeClosed } from "lucide-react";
import { useRef } from "react";
import { Link } from 'react-router-dom';

const Signin = () => {
  const passwordInputRef = useRef(null);

  const {
    email,
    password,
    error,
    showPassword,
    setShowPassword,
    handleEmailChange,
    handlePasswordChange,
    handleSignIn,
    handleGoogleSignIn
  } = useSignin();

  const handleEmailKeyDown = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    passwordInputRef.current?.focus();
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
          <h1 className="text-4xl font-semibold tracking-tight text-shadow-grey min-[980px]:text-5xl">
            Creator Copilot
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-xl font-medium text-shadow-grey-hover min-[980px]:text-3xl">
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
        <form onSubmit={handleSignIn} className="w-full max-w-2xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tight">Sign In</h2>
            <p className="text-muted-foreground">Sign in to your existing account</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={handleEmailChange} onKeyDown={handleEmailKeyDown} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" ref={passwordInputRef} type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={handlePasswordChange} />
                <Button type="button" className="absolute top-0 right-0 px-3 text-primary hover:bg-transparent hover:text-primary bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full" type="submit">Sign In</Button>
            <GoogleAuthButton onClick={handleGoogleSignIn}>Sign in with Google</GoogleAuthButton>
            <p className="mt-4 text-sm">
              Don't have an account?
              <Link to="/signup" className="font-semibold text-chocolate hover:chocolate-hover ml-1">Sign up</Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Signin;