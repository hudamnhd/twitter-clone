import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PostView } from "~/components/singlePostView";
import { PageLayout } from "~/components/layout";
import { BackButton } from "~/components/backButton";
import { NavbarLayout } from "~/components/layoutNavbar";
import { NotFound } from "~/components/notFound";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });

  if (!data) return <NotFound />;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
        <meta name="description" content="Post Content Twitter T3 App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <NavbarLayout>
          <div className="flex items-center gap-x-5">
            <BackButton />
            <h1 className="text-lg font-semibold capitalize">Post </h1>
          </div>
        </NavbarLayout>
        <div className="mt-[50px]" />
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
