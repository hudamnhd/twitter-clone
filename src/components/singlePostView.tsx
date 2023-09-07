import type { RouterOutputs } from "../utils/api";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import { LoadingSpinner } from "../components/loading";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { formatCustomDateTime } from "~/utils/formatTime";
import { CommentView } from "./commentView";
import { useAutoResizeInput } from "~/hook/useAutoResizeInput";
import { ReplyPost } from "./replyPost";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  const { data: sessionData } = useSession();

  const router = useRouter();

  const { inputText, setInputText, inputTextRef, toggle, setToggle } =
    useAutoResizeInput("");

  const { data: comment } = api.posts.getComment.useQuery({
    postId: post.id,
  });

  const ctx = api.useContext();

  const { mutate, isLoading } = api.posts.delete.useMutation({
    onSuccess: () => {
      void router.back();
    },
  });

  const { mutate: mutateEdit, isLoading: isSave } = api.posts.edit.useMutation({
    onSuccess: () => {
      setInputText("");
      setToggle(false);
      void ctx.posts.getById.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  const { mutate: mutateLike, isLoading: isLoadingLike } =
    api.posts.like.useMutation({
      onSuccess: () => {
        void ctx.posts.getById.invalidate();
      },
    });

  return (
    <>
      <div
        className={`${
          isLoading ? "opacity-60" : ""
        }  w-full gap-3 border-b border-slate-700 px-4 pt-3`}
      >
        <div className="flex gap-3">
          <div>
            <Link href={`/${author.username}`}>
              <Image
                src={author.image ?? ""}
                width={45}
                height={45}
                alt={`@${author.username}'s profil picture`}
                className="flex rounded-full"
              />
            </Link>
          </div>
          <div className="flex w-full flex-1 flex-col gap-0.5 ">
            <div className="flex justify-between text-[15px] text-slate-300">
              <div className="flex flex-col">
                <Link
                  href={`/${author.username}`}
                  className="font-bold capitalize"
                >
                  {`${author.name}`}
                </Link>
                <Link
                  href={`/${author.username}`}
                  className="-mt-0.5 text-sm text-[#71767b]"
                >
                  {`@${author.username}`}
                </Link>
              </div>
              {sessionData && sessionData?.user?.id === post.userId && (
                <div className="relative">
                  <button className="peer text-gray-400 transition-all duration-200 focus:text-sky-500 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-[22px] w-[22px]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                      />
                    </svg>
                  </button>
                  <div
                    className='invisible absolute -right-2 -top-5 z-10
                w-[200px] rounded-md border border-slate-700 opacity-0
                transition-all duration-300 after:absolute after:top-0 after:-z-20
                after:inline-block after:h-full
                after:w-full after:rounded-md after:bg-slate-900  after:content-[""] peer-focus:visible peer-focus:top-0 peer-focus:opacity-100'
                  >
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setInputText(post.content);
                          setToggle(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-slate-800"
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
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                        Edit Post
                      </button>
                      <button
                        onClick={() => mutate({ postId: post.id })}
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-slate-800"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete Post
                      </button>
                    </div>
                  </div>
                  {isLoading && (
                    <div className="absolute end-0 top-6 flex items-center justify-center">
                      <LoadingSpinner size={24} stroke="#FFF" strokeWidth={4} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col  pt-4">
          {inputText || toggle ? (
            <div className="w-full pt-1.5">
              <textarea
                ref={inputTextRef}
                className="h-auto w-full resize-none overflow-hidden  border-none bg-transparent text-[16px] outline-none focus:ring-0 disabled:opacity-60"
                rows={1}
                value={inputText}
                disabled={isSave}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="mb-3 border-b border-slate-700" />
              <div className="flex justify-end">
                {isSave ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size={24} stroke="#FFF" strokeWidth={4} />
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      className="flex justify-end rounded-full bg-gray-500 px-3 py-1.5 text-sm font-medium duration-300 hover:bg-gray-600 disabled:opacity-60"
                      onClick={() => {
                        setInputText("");
                        setToggle(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="hover: flex justify-end rounded-full bg-sky-500 px-3 py-1.5 text-sm  font-medium duration-300 hover:bg-sky-600 disabled:opacity-60"
                      onClick={() =>
                        mutateEdit({ postId: post.id, content: inputText })
                      }
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="mb-2 whitespace-pre-wrap break-all text-[16px]">
              {post.content}
            </span>
          )}
          <Link href={`/post/${post.id}`} className="mb-2 text-[#71767b]">
            {formatCustomDateTime(post.createdAt)}
          </Link>
          {/* Button Like */}
          <div className="flex  items-center justify-around gap-x-1 border-t border-slate-700 py-2">
            <button
              onClick={() => mutateLike({ postId: post.id })}
              className={`${
                post.likedByMe
                  ? "fill-[#f91880] text-[#f91880]"
                  : "fill-transparent text-gray-500 hover:text-[#f91880]"
              } group  flex items-center gap-x-1.5 sm:min-w-[40px]`}
            >
              {isLoadingLike ? (
                <LoadingSpinner size={16} stroke="#aaa" strokeWidth={4.5} />
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  <span className="text-sm">
                    {post.likes.length === 0 ? null : post.likes.length}
                  </span>
                </>
              )}
            </button>
            <button className="flex items-center gap-x-1.5 text-gray-500 hover:text-sky-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                />
              </svg>
              <span className="text-sm">
                {post.comments.length === 0 ? "" : post.comments.length}
              </span>
            </button>
            <button className="text-gray-500 hover:text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-sky-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                strokeWidth={2}
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-sky-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </button>
          </div>
          <ReplyPost {...props} />
        </div>
      </div>
      <div className="">
        {comment?.map((fullPost) => (
          <CommentView {...fullPost} key={fullPost.comment.id} />
        ))}
      </div>
    </>
  );
};
