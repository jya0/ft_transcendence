import Image from "next/image";

type Props = {
  achievements?: [];
};

export const ShowAchievements = ({ achievements }: Props) => {
  return (
    <div className="flex flex-col space-y-2">
      {achievements
        ? achievements.map((item: any, key: number) => (
            <div
              key={key}
              className="flex justify-between text-lg w-auto h-auto bg-gray-100 hover:bg-gray-300 cursor-pointer m-2 rounded-lg border-4 border-black dark:border-slate-500"
            >
              <div className="flex flex-col justify-center p-4">
                <p className="text-xl font-bold">{item.name}</p>
                <p className="mt-2 text-sm">{item.description}</p>
              </div>
              <div className="fkex w-1/6 p-4 bg-gray-300">
                <Image
                  className="center m-auto"
                  src={`https://cdn.intra.42.fr${item.image.slice(8)}`}
                  width={50}
                  height={50}
                  alt="alt"
                />
              </div>
            </div>
          ))
        : null}
    </div>
  );
};
