import { Library_Year_Type } from "@/types/types";

export default function LibYearSingle({
  libyear,
}: {
  libyear: Library_Year_Type[];
}) {
  return (
    <main>
      <h1>{libyear[0].id}</h1>
      <h1>{libyear[0].Library.library_name}</h1>
      <div className="flex flex-auto  text-wrap">
        <span className="w-[800px]">
          {Object.entries(libyear[0].Electronic)}
        </span>
      </div>
      <h1>{libyear[0].year}</h1>
    </main>
  );
}
