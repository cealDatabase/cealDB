"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

// Mirror of lib/password.ts validatePassword — runs client-side for live feedback
function checkRules(password: string) {
  return {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

function RuleItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-700" : "text-gray-500"}`}>
      {ok ? (
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
      )}
      {label}
    </li>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10"
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const rules = checkRules(newPassword);
  const allRulesPass = Object.values(rules).every(Boolean);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!allRulesPass) {
      toast.error("New password does not meet the requirements.");
      return;
    }
    if (!passwordsMatch) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password.");
      }
      toast.success("Password changed successfully.");
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5 mt-2 w-full">
          <KeyRound className="w-4 h-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password, then choose a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Current password */}
            <div className="grid gap-1.5">
              <Label htmlFor="cp-current">Current Password</Label>
              <PasswordInput
                id="cp-current"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Your current password"
                disabled={isLoading}
              />
            </div>

            {/* New password */}
            <div className="grid gap-1.5">
              <Label htmlFor="cp-new">New Password</Label>
              <PasswordInput
                id="cp-new"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Choose a new password"
                disabled={isLoading}
              />
              {/* Live rules */}
              <ul className="mt-1 space-y-0.5 pl-0.5">
                <RuleItem ok={rules.length}  label="At least 12 characters" />
                <RuleItem ok={rules.upper}   label="At least one uppercase letter (A–Z)" />
                <RuleItem ok={rules.lower}   label="At least one lowercase letter (a–z)" />
                <RuleItem ok={rules.digit}   label="At least one number (0–9)" />
                <RuleItem ok={rules.special} label="At least one special character (!@#$%…)" />
              </ul>
            </div>

            {/* Confirm new password */}
            <div className="grid gap-1.5">
              <Label htmlFor="cp-confirm">Confirm New Password</Label>
              <PasswordInput
                id="cp-confirm"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat the new password"
                disabled={isLoading}
              />
              {confirmPassword.length > 0 && (
                <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-emerald-700" : "text-red-500"}`}>
                  {passwordsMatch ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                  ) : (
                    <><XCircle className="w-3.5 h-3.5" /> Passwords do not match</>
                  )}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !allRulesPass || !passwordsMatch || !currentPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save New Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
