import UserCard from "./components/UserCard";
import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";

export default async function Home() {
  const session = await getServerSession(options);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <UserCard user={session?.user} pagetype={"Home"} />
      {/* <button
        className="bg-white w-32 h-32 text-3xl hover:bg-red-500"
      >
        cat
      </button> */}
    </main>
  );
}
