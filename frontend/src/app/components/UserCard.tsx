import Image from "next/image";
import Link from "next/link";

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

export default function Card({ user, pagetype }: Props) {
  console.log(user);

  const url = `https://cdn.intra.42.fr/users/29e69b5ea6d41364e29ba5eefca3b4a5/${user?.email?.slice(
    0,
    user.email.indexOf("@")
  )}.jpg`;

  const imageLoader = () => {
    return `https://cdn.intra.42.fr/users/29e69b5ea6d41364e29ba5eefca3b4a5/${user?.email?.slice(
      0,
      user.email.indexOf("@")
    )}.jpg`;
  };

  console.log(imageLoader);
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

  const userImage = user?.image ? (
    <Image
      className="border-4 border-black dark:border-slate-500 drop-shadow-xl shadow-black rounded-full mx-auto mt-8"
      src={user.image}
      width={200}
      height={200}
      alt={user?.name ?? "Profile Pic"}
      priority={true}
    />
  ) : null;

  return (
    <section className="flex flex-col gap-4">
      <img src={url} className="w-40 h-40 rounded-full center"></img>
      {greeting}
      {emailDisplay}
      {userImage}
      <p className="text-2xl text-center">{pagetype} Page!</p>
    </section>
  );
}
