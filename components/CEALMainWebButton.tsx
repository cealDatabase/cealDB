import Link from "next/link";
import ExpandingArrow from "./ui/expanding-arrow";

const CEALMainWebButton = () => {
  return (
      <Link
        href="https://www.eastasianlib.org/newsite/"
        className="max-w-56 group rounded-full flex space-x-1 bg-white/30 shadow-sm ring-1 ring-gray-900/5 text-gray-600 text-sm font-medium px-10 py-2 hover:shadow-lg active:shadow-sm transition-all"
      >
        <p>CEAL Main Web Site</p>
        <ExpandingArrow />
      </Link>
  );
};

export default CEALMainWebButton;
