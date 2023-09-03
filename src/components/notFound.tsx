import Link from "next/link";
import { PageLayout } from "./layout";

export const NotFound = () => {
  return (
    <PageLayout>
      <div className="grid h-screen place-content-center  px-4">
        <h1 className="font-medium uppercase tracking-widest text-gray-500">
          Page Not Found
        </h1>
        <Link
          href="/"
          className="text-center font-medium uppercase tracking-widest text-gray-500"
        >
          Back Home
        </Link>
      </div>
    </PageLayout>
  );
};
