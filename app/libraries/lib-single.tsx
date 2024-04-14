import Link from "next/link";

export default function LibSingle({
  id,
  name,
  libHomePage,
  libraryNumber,
}: {
  id: number;
  name: string;
  libHomePage: string;
  libraryNumber: number;
}) {
  return (
    <>
      <p>{id}</p>
      <h2>{name}</h2>
      <h3>
        <Link href={libHomePage}>{libHomePage}</Link>
      </h3>
      <h3>{libraryNumber}</h3>
    </>
  );
}
