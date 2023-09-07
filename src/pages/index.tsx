import Head from "next/head";
import { api } from "~/utils/api";
import { AuthShowcase } from "~/components/authShowcase";
import { PageLayout } from "~/components/layout";
import { NavbarLayout } from "~/components/layoutNavbar";
import { LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postView";
import { CreatePostWizard } from "~/components/CreatePostWizard";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="relative h-[75vh]">
        <h1 className="absolute inset-0 flex items-center justify-center text-2xl font-medium">
          <LoadingSpinner size={50} />
        </h1>
      </div>
    );

  if (!data)
    return (
      <div className="grid h-[75vh] place-content-center px-4">
        <h1 className="font-medium uppercase tracking-widest text-gray-400">
          Something went wrong
        </h1>
      </div>
    );

  return (
    <div className="w-full">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Home | Twitter T3 App</title>
        <meta name="description" content="Home | Twitter T3 App" />
      </Head>
      <PageLayout>
        <NavbarLayout>
          <h1 className="text-[20px] font-semibold ">Home</h1>
          <AuthShowcase />
        </NavbarLayout>
        <div className="mt-14 divide-y divide-slate-700 ">
          <CreatePostWizard />
          <Feed />
        </div>
      </PageLayout>
    </>
  );
}
