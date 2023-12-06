import UserCard from "./components/UserCard";
import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import SignOut from "./components/SignOut";
import { redirect } from "next/navigation";
import ChannelHome from "./components/ChannelHome";

export default async function Home() {
  const session = await getServerSession(options);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <UserCard
        user={session?.user}
        image={session?.image}
        achievement={session?.acheivements}
      />
      <p className="text-sm font-bold mt-5">A Simple card component</p>
      <ChannelHome
        avatar={"https://avatars.githubusercontent.com/u/109759977?v=4"}
        name={"Ahmed"}
        memberCount={24}
        channelLink={"/"}
      />
      <SignOut />
    </main>
  );
}
