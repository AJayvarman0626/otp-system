"use client";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="max-w-xl mx-auto mt-20 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg shadow-lg text-center text-white font-sans
                     sm:p-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 tracking-tight">
        🔐 One-Time Password Phone Authentication
      </h1>

      {user ? (
        <>
          <h2 className="text-base sm:text-lg mb-4 sm:mb-6">
            Welcome, <span className="font-mono text-indigo-400 break-words">{user.uid}</span>!
          </h2>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => signOut(auth)}
            className="mt-4 px-8 w-full sm:w-auto"
          >
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-base sm:text-lg mb-4 sm:mb-6 text-gray-300">
            You are not logged in yet
          </h2>
          <Link href="/login" passHref>
            <Button
              asChild
              variant="default"
              size="lg"
              className="mt-4 px-8 w-full sm:w-auto"
            >
              <a>Sign In</a>
            </Button>
          </Link>
        </>
      )}
    </main>
  );
}
