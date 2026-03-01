"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-black">
      <Spinner color="white" />
      <p className="text-sm text-black/80">loading nutriai...</p>
    </main>
  );
}


