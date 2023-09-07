import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import type { GetStaticProps, NextPage } from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { BackButton } from "~/components/backButton";
import { NavbarLayout } from "~/components/layoutNavbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { NotFound } from "~/components/notFound";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data: sessionData } = useSession();

  const { data } = api.profile.getUserByUsername.useQuery(
    {
      username,
    },
    { enabled: sessionData?.user !== undefined },
  );

  if (!data) return <NotFound />;

  return (
    <>
      <Head>
        <title>{`Message ${data.name} Twitter T3 App`}</title>
        <meta name="description" content="Profile Page Twitter T3 App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <NavbarLayout>
          <div className="flex items-center gap-x-5">
            <BackButton />
            <div className="my-0.5 flex items-center gap-x-2.5">
              <Image
                src={data.image ?? ""}
                alt={`@${data.username ?? ""}' profil picture`}
                width={32}
                height={32}
                className="rounded-full"
              />
              <h1 className="text-[18px] font-semibold capitalize">
                {data.name ?? ""}
              </h1>
            </div>
          </div>
        </NavbarLayout>
        <div className="grid h-screen place-content-center  px-4">
          <h1 className="font-medium uppercase tracking-widest text-gray-500">
            BELUM DI BIKIN YA
          </h1>
          <Link
            href="/"
            className="text-center font-medium uppercase tracking-widest text-gray-500"
          >
            Back Home
          </Link>
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug;

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
