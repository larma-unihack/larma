"use client";

import { useState, useRef, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

type AuthMethod = "email" | "phone";

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Phone auth state (+61 Australia only)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneStep, setPhoneStep] = useState<"number" | "code">("number");
  const PHONE_COUNTRY_CODE = "+61";
  const [verificationCode, setVerificationCode] = useState("");
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setPhoneStep("number");
      setVerificationCode("");
      setPhoneNumber("");
      confirmationResultRef.current = null;
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    }
  }, [open]);

  const getOrCreateRecaptchaVerifier = () => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;
    if (typeof window === "undefined" || !recaptchaContainerRef.current) return null;
    const verifier = new RecaptchaVerifier(
      auth,
      recaptchaContainerRef.current,
      {
        size: "invisible",
        callback: () => {},
      }
    );
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Something went wrong";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const verifier = getOrCreateRecaptchaVerifier();
      if (!verifier) {
        setError("Verification not ready. Please try again.");
        setBusy(false);
        return;
      }
      const digits = phoneNumber.replace(/\D/g, "");
      const fullNumber = `${PHONE_COUNTRY_CODE}${digits}`;
      // Australian numbers: 9 digits (e.g. 412 345 678)
      if (digits.length !== 9) {
        setError("Enter a valid Australian phone number (9 digits).");
        setBusy(false);
        return;
      }
      const result = await signInWithPhoneNumber(auth, fullNumber, verifier);
      confirmationResultRef.current = result;
      setPhoneStep("code");
      setVerificationCode("");
    } catch (err: unknown) {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Something went wrong";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = confirmationResultRef.current;
    if (!result) {
      setError("Session expired. Please request a new code.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await result.confirm(verificationCode);
      onClose();
      setPhoneStep("number");
      setPhoneNumber("");
      setVerificationCode("");
      confirmationResultRef.current = null;
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Invalid or expired code. Try again.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const switchAuthMethod = (method: AuthMethod) => {
    setAuthMethod(method);
    setError(null);
    if (method === "phone") {
      setPhoneStep("number");
      setVerificationCode("");
    }
  };

  if (!open) return null;

  return (
    <div className="modal modal-open z-[100]" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div className="modal-box bg-base-100">
        <div className="flex items-center justify-between mb-4">
          <h2 id="login-modal-title" className="text-xl font-semibold">
            {authMethod === "phone"
              ? phoneStep === "code"
                ? "Enter verification code"
                : "Sign in with phone"
              : isSignUp
                ? "Sign up"
                : "Sign in"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* reCAPTCHA container for phone auth (invisible) */}
        <div ref={recaptchaContainerRef} id="recaptcha-container" className="hidden" aria-hidden="true" />

        <div className="tabs tabs-boxed mb-4">
          <button
            type="button"
            role="tab"
            aria-selected={authMethod === "email"}
            className={`tab ${authMethod === "email" ? "tab-active" : ""}`}
            onClick={() => switchAuthMethod("email")}
          >
            Email
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authMethod === "phone"}
            className={`tab ${authMethod === "phone" ? "tab-active" : ""}`}
            onClick={() => switchAuthMethod("phone")}
          >
            Phone
          </button>
        </div>

        {authMethod === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="form-control w-full">
              <label htmlFor="login-email" className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input input-bordered w-full"
                autoComplete="email"
              />
            </div>
            <div className="form-control w-full">
              <label htmlFor="login-password" className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input input-bordered w-full"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>
            {error && (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button type="submit" disabled={busy} className="btn btn-primary w-full">
                {busy ? "Please wait…" : isSignUp ? "Sign up" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp((s) => !s);
                  setError(null);
                }}
                className="btn btn-ghost btn-sm"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </div>
          </form>
        )}

        {authMethod === "phone" && phoneStep === "number" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="form-control w-full">
              <label htmlFor="login-phone" className="label">
                <span className="label-text">Australian phone number</span>
              </label>
              <div className="flex gap-2">
                <span className="input input-bordered flex items-center w-14 shrink-0 bg-base-200">+61</span>
                <input
                  id="login-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="412 345 678"
                  className="input input-bordered w-full"
                  autoComplete="tel"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              {busy ? "Sending…" : "Send verification code"}
            </button>
          </form>
        )}

        {authMethod === "phone" && phoneStep === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-base-content/80">
              We sent a 6-digit code to +61 {phoneNumber}. Enter it below.
            </p>
            <div className="form-control w-full">
              <label htmlFor="login-code" className="label">
                <span className="label-text">Verification code</span>
              </label>
              <input
                id="login-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="input input-bordered w-full text-center text-lg tracking-widest"
                autoComplete="one-time-code"
              />
            </div>
            {error && (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={busy || verificationCode.length !== 6}
                className="btn btn-primary w-full"
              >
                {busy ? "Verifying…" : "Verify and sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhoneStep("number");
                  setError(null);
                  setVerificationCode("");
                  confirmationResultRef.current = null;
                }}
                className="btn btn-ghost btn-sm"
              >
                Use a different number
              </button>
            </div>
          </form>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose} aria-label="Close">
          close
        </button>
      </form>
    </div>
  );
}
