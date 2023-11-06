"use client";
import Image from "next/image";
import { ShowAchievements } from "./ShowAchievements";
import { useState } from "react";

type User =
  | {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  | undefined;

type Props = {
  user: User;
  image?: string;
  achievement?: string[];
};

export default function Card({ user, image, achievement }: Props) {
  const [showAchievs, setShowAchievs] = useState(false);

  const greeting = user?.name ? (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg font-bold text-5xl text-black">
      Hello {user?.name}!
    </div>
  ) : null;

  const emailDisplay = user?.email ? (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg font-bold text-5xl text-black">
      {user?.email}
    </div>
  ) : null;

  const userImage = (source: string | null | undefined) =>
    source ? (
      <Image
        className="border-4 border-black dark:border-slate-500 drop-shadow-xl shadow-black rounded-full mx-auto mt-8 h-[200px] w-[200px]]"
        src={source}
        width={200}
        height={200}
        alt={user?.name ?? "Profile Pic"}
        priority={true}
      />
    ) : null;

  return (
    <section className="flex flex-col gap-4">
      {image ? userImage(image) : userImage(user?.image)}
      {greeting}
      {emailDisplay}
      <button
        className="p-2 bg-white rounded-lg font-bold text-2xl text-black w-1/3 mx-auto"
        onClick={() => setShowAchievs(!showAchievs)}
      >
        {!showAchievs ? "Show Achievements" : "Hide Achievements"}
      </button>
      {showAchievs && <ShowAchievements achievements={achievement} />}
    </section>
  );
}
