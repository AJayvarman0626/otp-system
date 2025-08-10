"use client";

import { auth } from "@/firebase";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import React, { FormEvent, useEffect, useState, useTransition } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

function OtpLogin() {
  const router = useRouter();

  // Initialize phone with +91 prefix
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [isPending, startTransition] = useTransition();

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Initialize invisible reCAPTCHA
  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );

    setRecaptchaVerifier(recaptchaVerifier);

    return () => {
      recaptchaVerifier.clear();
    };
  }, []);

  // Auto verify OTP if 6 digits entered
  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp]);

  // Handle phone input changes, keep +91 prefix and only digits after
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (!input.startsWith("+91")) {
      setPhoneNumber("+91");
      return;
    }

    const afterPrefix = input.slice(3);
    const digitsOnly = afterPrefix.replace(/\D/g, "");
    setPhoneNumber("+91" + digitsOnly);
  };

  // Send OTP request
  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setResendCountdown(60);

    startTransition(async () => {
      setError("");

      if (!recaptchaVerifier) {
        return setError("RecaptchaVerifier is not initialized.");
      }

      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifier
        );

        setConfirmationResult(confirmationResult);
        setSuccess("OTP sent successfully.");
      } catch (err: any) {
        console.log(err);
        setResendCountdown(0);

        if (err.code === "auth/invalid-phone-number") {
          setError("Invalid phone number. Please check the number.");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many requests. Please try again later.");
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      }
    });
  };

  // Verify OTP input
  const verifyOtp = async () => {
    startTransition(async () => {
      setError("");

      if (!confirmationResult) {
        setError("Please request OTP first.");
        return;
      }

      try {
        await confirmationResult?.confirm(otp);
        router.replace("/");
      } catch (error) {
        console.log(error);
        setError("Failed to verify OTP. Please check the OTP.");
      }
    });
  };

  const loadingIndicator = (
    <div role="status" className="flex justify-center mt-6">
      <svg
        aria-hidden="true"
        className="w-10 h-10 text-gray-300 animate-spin dark:text-gray-600 fill-indigo-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 sm:p-12 rounded-lg shadow-xl max-w-md mx-auto text-white font-sans">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center">
        🔐 Phone OTP Login
      </h1>

      {!confirmationResult && (
        <form
          onSubmit={requestOtp}
          className="w-full flex flex-col gap-3 items-center"
        >
          <Input
            className="w-full text-black rounded-md px-4 py-2"
            type="tel"
            placeholder="Enter phone number (+91xxxxxxxxxx)"
            value={phoneNumber}
            onChange={handlePhoneChange}
            required
          />
          <p className="text-xs text-gray-400 max-w-xs text-center">
            Its Just a demo setup, only works with test phone numbers.
          </p>

          <Button
            disabled={!phoneNumber || isPending || resendCountdown > 0}
            className="mt-4 w-full"
            size="lg"
            variant="default"
            type="submit"
          >
            {resendCountdown > 0
              ? `Resend OTP in ${resendCountdown}s`
              : isPending
              ? "Sending OTP..."
              : "Send OTP"}
          </Button>
        </form>
      )}

      {confirmationResult && (
        <div className="w-full flex flex-col items-center gap-4">
          <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            disabled={otp.length !== 6 || isPending}
            onClick={verifyOtp}
            size="lg"
            variant="default"
            className="w-full"
          >
            Verify OTP
          </Button>

          {resendCountdown === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={requestOtp}
              disabled={isPending}
              className="mt-2"
            >
              Resend OTP
            </Button>
          )}
        </div>
      )}

      <div className="mt-6 min-h-[2rem] text-center">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-400">{success}</p>}
      </div>

      <div id="recaptcha-container" />

      {isPending && loadingIndicator}
    </div>
  );
}

export default OtpLogin;
