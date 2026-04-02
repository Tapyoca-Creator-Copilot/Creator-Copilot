import tapyIcon from "@/assets/tapy.png";
import tapyocaLogoClean from "@/assets/tapyoca-logo-clean.svg";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import { useSignup } from '@/features/auth/hooks/useSignup';
import { CheckCircle2, Eye, EyeClosed, X } from "lucide-react";
import { useRef } from "react";
import { Link } from 'react-router-dom';

const Signup = () => {
  const passwordInputRef = useRef(null);

  const {
    error,
    nameError,
    emailError,
    passwordError,
    occupationError,
    showPassword,
    setShowPassword,
    passwordValidations,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleOccupationChange,
    handleSignUp,
    handleGoogleSignUp
  } = useSignup();

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
            <p className="text-xl font-normal text-shadow-grey-hover min-[980px]:text-3xl">
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
        <form onSubmit={handleSignUp} className="w-full max-w-2xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tight">Sign Up</h2>
            <p className="text-muted-foreground">Fill in your details to create a new account</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" onChange={handleNameChange} />
              {nameError && (
                <p className="text-sm text-red-600">{nameError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" onChange={handleEmailChange} onKeyDown={handleEmailKeyDown} />
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" ref={passwordInputRef} type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={handlePasswordChange} />
                <div className="space-y-1 mt-2">
                  {passwordValidations.map((validation, index) => (
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        validation.valid ? "text-green-600" : "text-muted-foreground"
                      }`}
                      key={index}>
                      {validation.valid ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      <span>{validation.text}</span>
                    </div>
                  ))}
                </div>
                <Button type="button" className="absolute top-0 right-0 px-3 text-primary hover:bg-transparent hover:text-primary bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </Button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Occupation</Label>
              <Select onValueChange={handleOccupationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filmmaker">Filmmaker</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                </SelectContent>
              </Select>
              {occupationError && (
                <p className="text-sm text-red-600">{occupationError}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="w-full p-3 text-sm text-red-600 rounded-md">
                {error}
              </div>
            )}
            <Button className="w-full" type="submit">Sign Up</Button>
            <GoogleAuthButton onClick={handleGoogleSignUp}>Sign up with Google</GoogleAuthButton>
            <p className="mt-4 text-sm">
              Already have an account?
              <Link to="/signin" className="font-semibold text-chocolate hover:chocolate-hover ml-1">Sign in</Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  )
}


export default Signup