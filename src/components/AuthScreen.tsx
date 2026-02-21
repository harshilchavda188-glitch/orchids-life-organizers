"use client";

import { useState, useCallback, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { User } from "@/lib/hooks/use-auth";
import { generateId } from "@/lib/types";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserIcon,
  Phone,
  ChevronDown,
  ArrowRight,
  Smartphone,
  X,
} from "lucide-react";

type AuthTab = "login" | "signup" | "phone";

interface AuthScreenProps {
  onAuth: (user: User) => void;
}

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "+1", country: "US", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "+44", country: "UK", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "+61", country: "AU", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "+971", country: "AE", flag: "\u{1F1E6}\u{1F1EA}" },
];

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    setAppUrl(window.location.href);
  }, []);

  const clearError = () => setError("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = useCallback(async () => {
    clearError();
    if (!loginEmail.trim()) return setError("Please enter your email address");
    if (!validateEmail(loginEmail)) return setError("Please enter a valid email address");
    if (!loginPassword) return setError("Please enter your password");
    if (loginPassword.length < 6)
      return setError("Password must be at least 6 characters");

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const stored = localStorage.getItem("smartlife_users");
    const users: Record<string, { name: string; email: string; password: string }> =
      stored ? JSON.parse(stored) : {};
    const key = loginEmail.toLowerCase();
    const found = users[key];

    if (!found) {
      setIsLoading(false);
      return setError("No account found with this email. Please sign up first.");
    }
    if (found.password !== loginPassword) {
      setIsLoading(false);
      return setError("Incorrect password. Please try again.");
    }

    onAuth({
      id: generateId(),
      name: found.name,
      email: found.email,
      authMethod: "email",
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  }, [loginEmail, loginPassword, onAuth]);

  const handleSignup = useCallback(async () => {
    clearError();
    if (!signupName.trim()) return setError("Please enter your name");
    if (!signupEmail.trim()) return setError("Please enter your email address");
    if (!validateEmail(signupEmail))
      return setError("Please enter a valid email address");
    if (!signupPassword) return setError("Please create a password");
    if (signupPassword.length < 6)
      return setError("Password must be at least 6 characters");
    if (signupPassword !== signupConfirm)
      return setError("Passwords do not match");

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const stored = localStorage.getItem("smartlife_users");
    const users: Record<string, { name: string; email: string; password: string }> =
      stored ? JSON.parse(stored) : {};
    const key = signupEmail.toLowerCase();

    if (users[key]) {
      setIsLoading(false);
      return setError("An account with this email already exists. Please log in.");
    }

    users[key] = {
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
    };
    localStorage.setItem("smartlife_users", JSON.stringify(users));

    onAuth({
      id: generateId(),
      name: signupName.trim(),
      email: signupEmail.trim(),
      authMethod: "email",
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  }, [signupName, signupEmail, signupPassword, signupConfirm, onAuth]);

  const handleSendOtp = useCallback(async () => {
    clearError();
    if (!phoneNumber.trim()) return setError("Please enter your phone number");
    if (phoneNumber.replace(/\D/g, "").length < 10)
      return setError("Please enter a valid 10-digit phone number");

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setOtpSent(true);
    setOtpResendTimer(30);
    setIsLoading(false);

    const interval = setInterval(() => {
      setOtpResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [phoneNumber]);

  const handleVerifyOtp = useCallback(async () => {
    clearError();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return setError("Please enter the complete 6-digit OTP");

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    onAuth({
      id: generateId(),
      name: "User",
      email: "",
      phone: `${countryCode}${phoneNumber}`,
      authMethod: "phone",
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  }, [otp, countryCode, phoneNumber, onAuth]);

  const handleGoogleSignIn = useCallback(async () => {
    clearError();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    onAuth({
      id: generateId(),
      name: "Google User",
      email: "user@gmail.com",
      authMethod: "google",
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  }, [onAuth]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const tabs: { id: AuthTab; label: string }[] = [
    { id: "login", label: "Sign In" },
    { id: "signup", label: "Sign Up" },
    { id: "phone", label: "Phone" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#faf8f5] px-5 py-6 overflow-y-auto">

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        {/* Expo Badge + Open on Mobile */}
          <div className="mb-4 mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full border border-[#e4ddd4] bg-white px-5 py-2.5 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <rect width="24" height="24" rx="6" fill="#000"/>
                <path d="M12 5.5C12.5 5.5 13 5.8 13.3 6.3L18.5 15.5C19 16.3 18.4 17.5 17.5 17.5H6.5C5.6 17.5 5 16.3 5.5 15.5L10.7 6.3C11 5.8 11.5 5.5 12 5.5Z" fill="white"/>
              </svg>
              <span className="text-sm font-semibold tracking-wide text-[#2d2a26]">
                Expo
              </span>
              <span className="text-xs text-[#8a8178]">|</span>
              <span className="text-xs font-medium text-[#8a8178]">
                React Native
              </span>
            </div>
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 rounded-full border border-[#e4ddd4] bg-white px-4 py-2.5 shadow-sm transition-colors hover:bg-[#f0ebe4]"
            >
              <Smartphone className="h-4 w-4 text-[#2d2a26]" />
              <span className="text-xs font-semibold text-[#2d2a26]">Scan QR</span>
            </button>
          </div>

          {/* QR Code Modal */}
          {showQR && appUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-5" onClick={() => setShowQR(false)}>
              <div className="relative w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowQR(false)}
                  className="absolute right-4 top-4 rounded-full p-1.5 text-[#8a8178] hover:bg-[#f0ebe4] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d2a26]">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2d2a26]">Open on Mobile</h3>
                  <p className="mt-1 text-center text-sm text-[#8a8178]">
                    Scan this QR code with your phone camera to open the app
                  </p>

                  <div className="my-5 rounded-2xl border-2 border-[#e4ddd4] bg-white p-4">
                    <QRCodeSVG
                      value={appUrl}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#2d2a26"
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="w-full rounded-xl bg-[#faf8f5] border border-[#e4ddd4] px-4 py-3">
                    <p className="text-[11px] font-medium text-[#8a8178] text-center break-all">{appUrl}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-[#e4ddd4] bg-[#faf8f5] px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-[11px] font-medium text-[#8a8178]">Android</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#e4ddd4] bg-[#faf8f5] px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-[11px] font-medium text-[#8a8178]">iOS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* App Logo */}
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#2d2a26] shadow-xl shadow-[#2d2a26]/15">
          <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none">
            <path d="M20 4L36 14V26L20 36L4 26V14L20 4Z" fill="white" fillOpacity="0.1"/>
            <path d="M20 8L32 16V24L20 32L8 24V16L20 8Z" fill="white" fillOpacity="0.25"/>
            <path d="M20 12L28 18V22L20 28L12 22V18L20 12Z" fill="white"/>
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#2d2a26]">
          Smart Life
        </h1>
        <p className="mt-1.5 text-sm text-[#8a8178]">
          Your personal life management companion
        </p>

        {/* Auth Card */}
        <div className="mt-7 w-full rounded-3xl border border-[#e4ddd4] bg-white p-5 shadow-sm">
          {/* Tab Switcher */}
          <div className="mb-5 flex rounded-2xl bg-[#f0ebe4] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearError();
                }}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-white text-[#2d2a26] shadow-sm"
                    : "text-[#8a8178] hover:text-[#5c554d]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <div className="space-y-3.5">
              <InputField
                icon={<Mail className="h-[18px] w-[18px]" />}
                placeholder="Email address"
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
              />
              <InputField
                icon={<Lock className="h-[18px] w-[18px]" />}
                placeholder="Password"
                type={showLoginPassword ? "text" : "password"}
                value={loginPassword}
                onChange={setLoginPassword}
                suffix={
                  <button
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="p-1 text-[#b5aca3] hover:text-[#5c554d] transition-colors"
                    type="button"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                }
              />
              <PrimaryButton
                label="Sign In"
                onClick={handleLogin}
                loading={isLoading}
              />
            </div>
          )}

          {/* Signup Form */}
          {activeTab === "signup" && (
            <div className="space-y-3.5">
              <InputField
                icon={<UserIcon className="h-[18px] w-[18px]" />}
                placeholder="Full name"
                value={signupName}
                onChange={setSignupName}
              />
              <InputField
                icon={<Mail className="h-[18px] w-[18px]" />}
                placeholder="Email address"
                type="email"
                value={signupEmail}
                onChange={setSignupEmail}
              />
              <InputField
                icon={<Lock className="h-[18px] w-[18px]" />}
                placeholder="Create password"
                type={showSignupPassword ? "text" : "password"}
                value={signupPassword}
                onChange={setSignupPassword}
                suffix={
                  <button
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="p-1 text-[#b5aca3] hover:text-[#5c554d] transition-colors"
                    type="button"
                  >
                    {showSignupPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                }
              />
              <InputField
                icon={<Lock className="h-[18px] w-[18px]" />}
                placeholder="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                value={signupConfirm}
                onChange={setSignupConfirm}
                suffix={
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-[#b5aca3] hover:text-[#5c554d] transition-colors"
                    type="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                }
              />
              <PrimaryButton
                label="Create Account"
                onClick={handleSignup}
                loading={isLoading}
              />
            </div>
          )}

          {/* Phone Login */}
          {activeTab === "phone" && (
            <div className="space-y-3.5">
              {!otpSent ? (
                <>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowCountryPicker(!showCountryPicker)}
                        className="flex h-[50px] items-center gap-1.5 rounded-xl border border-[#e4ddd4] bg-[#faf8f5] px-3 text-[14px] font-medium text-[#2d2a26] transition-colors hover:bg-[#f0ebe4]"
                        type="button"
                      >
                        <span>
                          {COUNTRY_CODES.find((c) => c.code === countryCode)?.flag}
                        </span>
                        <span>{countryCode}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-[#b5aca3]" />
                      </button>
                      {showCountryPicker && (
                        <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-xl border border-[#e4ddd4] bg-white py-1 shadow-lg">
                          {COUNTRY_CODES.map((c) => (
                            <button
                              key={c.code}
                              onClick={() => {
                                setCountryCode(c.code);
                                setShowCountryPicker(false);
                              }}
                              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-[#f0ebe4] ${
                                countryCode === c.code
                                  ? "bg-[#f0ebe4] text-[#2d2a26] font-semibold"
                                  : "text-[#5c554d]"
                              }`}
                            >
                              <span className="text-lg">{c.flag}</span>
                              <span className="font-medium">{c.country}</span>
                              <span className="ml-auto text-[#b5aca3]">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 items-center rounded-xl border border-[#e4ddd4] bg-[#faf8f5] px-4 transition-colors focus-within:border-[#7c6f64] focus-within:bg-white">
                      <Phone className="mr-3 h-[18px] w-[18px] text-[#b5aca3]" />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-[50px] w-full bg-transparent text-[15px] text-[#2d2a26] outline-none placeholder:text-[#b5aca3]"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <PrimaryButton
                    label="Send OTP"
                    onClick={handleSendOtp}
                    loading={isLoading}
                  />
                </>
              ) : (
                <>
                  <p className="text-center text-[14px] text-[#8a8178]">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-[#2d2a26]">
                      {countryCode} {phoneNumber}
                    </span>
                  </p>
                  <div className="flex justify-center gap-2.5">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="h-[52px] w-[44px] rounded-xl border border-[#e4ddd4] bg-[#faf8f5] text-center text-lg font-bold text-[#2d2a26] outline-none transition-all focus:border-[#7c6f64] focus:bg-white focus:ring-2 focus:ring-[#7c6f64]/10"
                      />
                    ))}
                  </div>
                  <PrimaryButton
                    label="Verify OTP"
                    onClick={handleVerifyOtp}
                    loading={isLoading}
                  />
                  <div className="text-center">
                    {otpResendTimer > 0 ? (
                      <p className="text-[13px] text-[#b5aca3]">
                        Resend OTP in {otpResendTimer}s
                      </p>
                    ) : (
                      <button
                        onClick={() => {
                          setOtpSent(false);
                          setOtp(["", "", "", "", "", ""]);
                        }}
                        className="text-[13px] font-semibold text-[#7c6f64] hover:text-[#5c554d]"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e4ddd4]" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-[#b5aca3]">
              or continue with
            </span>
            <div className="h-px flex-1 bg-[#e4ddd4]" />
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e4ddd4] bg-[#faf8f5] px-4 py-3.5 text-[14px] font-semibold text-[#2d2a26] transition-all hover:bg-[#f0ebe4] active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Platform badges */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-[#e4ddd4] bg-white px-3 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[11px] font-medium text-[#8a8178]">Android</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#e4ddd4] bg-white px-3 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-medium text-[#8a8178]">iOS</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#e4ddd4] bg-white px-3 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-violet-500" />
            <span className="text-[11px] font-medium text-[#8a8178]">Web</span>
          </div>
        </div>

        {/* Powered by Expo */}
        <div className="mt-4 flex items-center gap-2 opacity-60">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <rect width="24" height="24" rx="6" fill="#000"/>
            <path d="M12 5.5C12.5 5.5 13 5.8 13.3 6.3L18.5 15.5C19 16.3 18.4 17.5 17.5 17.5H6.5C5.6 17.5 5 16.3 5.5 15.5L10.7 6.3C11 5.8 11.5 5.5 12 5.5Z" fill="white"/>
          </svg>
          <span className="text-[11px] font-medium text-[#8a8178]">Powered by Expo + React Native</span>
        </div>

        {/* Legal */}
        <p className="mt-3 mb-4 max-w-[320px] text-center text-[11px] leading-relaxed text-[#b5aca3]">
          By signing in, you agree to our{" "}
          <button className="font-medium text-[#8a8178] underline-offset-2 hover:underline">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="font-medium text-[#8a8178] underline-offset-2 hover:underline">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
}

/* --- Reusable Sub-Components --- */

function InputField({
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  suffix,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="flex items-center rounded-xl border border-[#e4ddd4] bg-[#faf8f5] px-4 transition-colors focus-within:border-[#7c6f64] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7c6f64]/10">
      <span className="mr-3 text-[#b5aca3]">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[50px] w-full bg-transparent text-[15px] text-[#2d2a26] outline-none placeholder:text-[#b5aca3]"
      />
      {suffix && <span className="ml-2">{suffix}</span>}
    </div>
  );
}

function PrimaryButton({
  label,
  onClick,
  loading,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group relative flex w-full items-center justify-center rounded-xl bg-[#2d2a26] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#2d2a26]/10 transition-all hover:bg-[#3d3a36] hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <span className="flex items-center gap-2">
          {label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </button>
  );
}
