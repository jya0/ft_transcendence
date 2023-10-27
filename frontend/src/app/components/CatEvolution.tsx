import Image from "next/image";

export const CatEvolution = () => {
  return (
    <div className="center">
      <Image
        src={"/cat.jpg"}
        alt="FT_EVOLUTION"
        width={800}
        height={500}
      ></Image>
      <p className="text-4xl font-bold text-center mt-10"> FT_EVOLUTION </p>
    </div>
  );
};
