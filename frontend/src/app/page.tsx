"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <button
        className="bg-white w-32 h-32 text-3xl hover:bg-red-500"
        onClick={() => router.push("/cat")}
      >
        cat
      </button>
    </main>
  );
}
