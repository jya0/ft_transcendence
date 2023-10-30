import UserCard from "./components/UserCard";
import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import SignOut from "./components/SignOut";

export default async function Home() {
  const session = await getServerSession(options);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <UserCard user={session?.user} pagetype={"Home"} />
      <SignOut />
    </main>
  );
}
