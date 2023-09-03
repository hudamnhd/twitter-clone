import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { PostView } from "~/components/postView";
import { PageLayout } from "~/components/layout";
import { LoadingSpinner } from "~/components/loading";
import type { GetStaticProps, NextPage } from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { BackButton } from "~/components/backButton";
import { NavbarLayout } from "~/components/layoutNavbar";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { NotFound } from "~/components/notFound";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading)
    return (
      <div className="relative h-[75vh]">
        <h1 className="absolute inset-0 flex items-center justify-center text-2xl font-medium">
          <LoadingSpinner size={50} />
        </h1>
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="grid h-[45vh] place-content-center px-4">
        <h1 className="font-medium uppercase tracking-widest text-gray-400">
          User Has Not Posted
        </h1>
      </div>
    );

  return (
    <div>
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data: sessionData, status } = useSession();
  const { data } = api.profile.getUserByUsername.useQuery(
    {
      username,
    },
    { enabled: sessionData?.user !== undefined },
  );

  const [isHover, setIsHover] = useState("");

  const ctx = api.useContext();
  const { mutate, isLoading } = api.profile.follow.useMutation({
    onSuccess: () => {
      void ctx.profile.getUserByUsername.invalidate();
    },
  });

  if (!data) return <NotFound />;

  const isFollowed = data.followers.some(
    (user) => user.id === sessionData?.user.id,
  );

  return (
    <>
      <Head>
        <title>{`Profile ${data.name} Twitter T3 App`}</title>
        <meta name="description" content="Profile Page Twitter T3 App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <NavbarLayout>
          <div className="flex  items-center gap-x-5">
            <BackButton />
            <div className="my-0.5">
              <h1 className="text-[18px] font-semibold capitalize">
                {data.name ?? ""}
              </h1>
              <p className="-mt-1 text-sm font-medium text-gray-400">
                {data.posts.length !== 0
                  ? data.posts.length + " posts"
                  : "No post"}
              </p>
            </div>
          </div>
        </NavbarLayout>
        <div className="mt-[50px] h-40 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-200 via-sky-600 to-sky-900">
          <Image
            src={data.image ?? ""}
            alt={`@${data.username ?? ""}' profil picture`}
            width={128}
            height={128}
            className="bottom-0 left-0 -mb-[64px] ml-4 translate-y-24 rounded-full border-4 border-black"
          />
        </div>
        <div className="mx-4 mt-3 flex items-center justify-end gap-x-2">
          {sessionData && sessionData.user.id === data.id && (
            <button className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold ring-1 ring-gray-500 hover:bg-slate-900 disabled:opacity-60">
              Edit Profile
            </button>
          )}
          {sessionData && sessionData.user.id !== data.id && (
            <>
              <div className="relative">
                <button className="peer rounded-full border border-gray-500 p-1.5 transition-all duration-200 hover:text-sky-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-[20px] w-[20px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </button>
                <div
                  className='invisible absolute -top-5 right-0 z-10 w-[200px] rounded-md
                       border border-slate-700 opacity-0 shadow-sm shadow-white
                       transition-all duration-300 after:absolute after:top-0 after:-z-20
                       after:inline-block after:h-full
                       after:w-full after:rounded-md after:bg-slate-950  after:content-[""] peer-focus:visible peer-focus:top-0 peer-focus:opacity-100'
                >
                  <div className="p-1">
                    <button
                      className="flex w-full items-center gap-2 rounded-md p-2 text-sm font-semibold text-gray-100 hover:bg-gray-700"
                      role="menuitem"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                        />
                      </svg>
                      Copy Link Profile
                    </button>
                  </div>
                </div>
              </div>
              <Link
                href={`/message/${data?.username}`}
                className="peer rounded-full border border-gray-500 p-1.5 transition-all duration-200 hover:text-sky-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-[20px] w-[20px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </Link>
              <button
                disabled={isLoading}
                onClick={() => mutate({ id: data.id })}
                onMouseEnter={() => {
                  if (isFollowed) {
                    setIsHover("Unfollow");
                  }
                }}
                onMouseLeave={() => {
                  if (isFollowed) {
                    setIsHover("Following");
                  }
                }}
                className={`flex items-center justify-center rounded-full  py-2 text-sm font-semibold ring-1 disabled:opacity-80 ${
                  isFollowed
                    ? "w-[110px] bg-slate-900 ring-gray-500  hover:bg-red-900/30 hover:bg-slate-900 hover:text-red-500"
                    : "w-[90px] bg-[#eff3fa] text-slate-900 ring-transparent hover:bg-[#eff3fa]/90"
                }`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size={16} stroke="#fff" strokeWidth={4.5} />
                  </>
                ) : isFollowed ? (
                  isHover || "Following"
                ) : (
                  "Follow"
                )}
              </button>
            </>
          )}
          {status === "unauthenticated" && (
            <Link
              href={"/api/auth/signin"}
              className={`w-[90px] rounded-full bg-[#eff3fa] py-2 text-center text-sm font-semibold text-black ring-1 ring-transparent hover:bg-[#eff3fa]/90 disabled:opacity-60`}
            >
              Follow
            </Link>
          )}
        </div>
        <div className="h-[10px]"></div>
        <div className="p-4">
          <h3 className="text-xl font-semibold capitalize text-[#e7e9ea]">
            {data.name ?? ""}
          </h3>
          <p className="-mt-0.5 text-[15px] font-medium text-[#71767b]">{`@${
            data.username ?? ""
          }`}</p>
          <div className="mt-4 flex gap-x-5">
            <span className="text-[15px] font-medium text-[#71767b]">
              <span className="font-extrabold text-[#e7e9ea]">
                {data.follows.length}
              </span>{" "}
              Following
            </span>
            <span className="text-[15px] font-medium text-[#71767b]">
              <span className="font-extrabold text-[#e7e9ea]">
                {data.followers.length}
              </span>{" "}
              Followers
            </span>
          </div>
        </div>
        <div className="w-full border-b border-slate-700" />
        <ProfileFeed userId={data.id} />
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
