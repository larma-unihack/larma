"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Auth is not configured");
      return;
    }
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

  if (!open) return null;

  return (
    <div className="modal modal-open z-[100]" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div className="modal-box bg-base-100">
        <div className="flex items-center justify-between mb-4">
          <h2 id="login-modal-title" className="text-xl font-semibold">
            {isSignUp ? "Sign up" : "Sign in"}
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full"
            >
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
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose} aria-label="Close">
          close
        </button>
      </form>
    </div>
  );
}
