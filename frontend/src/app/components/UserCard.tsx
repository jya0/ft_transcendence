import Image from "next/image";

type User =
  | {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  | undefined;

type Props = {
  user: User;
  pagetype: string;
};

export default function Card({ user }: Props) {
  console.log(user);

  const url = `https://cdn.intra.42.fr/users/29e69b5ea6d41364e29ba5eefca3b4a5/${user?.login}.jpg`;

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

  const userImage = (source: string | undefined) =>
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
      {!user?.image ? userImage(url) : userImage(user?.image)}
      {greeting}
      {emailDisplay}
    </section>
  );
}
