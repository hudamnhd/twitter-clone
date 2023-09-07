import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAutoResizeInput } from "~/hook/useAutoResizeInput";
import { api, type RouterOutputs } from "~/utils/api";
import { LoadingSpinner } from "./loading";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const ReplyPost = (props: PostWithUser) => {
  const { data: sessionData } = useSession();
  const { post, author } = props;

  const { inputText, setInputText, inputTextRef, toggle, setToggle } =
    useAutoResizeInput("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.createComment.useMutation({
    onSuccess: () => {
      setInputText("");
      setToggle(false);
      void ctx.posts.getComment.invalidate();
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

  if (!sessionData) return null;

  return (
    <>
      <div
        className={`mb-3 ${
          toggle ? "pt-1" : "pt-0.5"
        } border-t border-gray-700`}
      >
        <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
          {toggle && (
            <p className="ml-[58px] mt-1 text-[#71767b] focus-within:block">
              Replying to{" "}
              <Link
                href={`/${author.username}`}
                className="font-medium text-blue-500"
              >
                @{author.name}
              </Link>
            </p>
          )}
        </div>
        <div
          className={`grid grid-cols-[auto,1fr] items-center gap-x-3 gap-y-1  py-2.5 `}
        >
          <Image
            src={sessionData?.user.image ?? ""}
            width={45}
            height={45}
            alt="Profil image"
            className="rounded-full "
          />
          <div
            onClick={() => setToggle(true)}
            className={` ${
              toggle ? "flex-col" : ""
            } flex h-fit w-full items-center`}
          >
            <textarea
              ref={inputTextRef}
              className="h-auto w-full resize-none overflow-hidden border-none bg-transparent pt-1 text-base text-lg outline-none placeholder:text-gray-500 focus:ring-0 disabled:opacity-60"
              rows={1}
              value={inputText}
              disabled={isPosting}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Post your reply!"
            />
            {toggle ? (
              <div className="mb-3 block w-full border-b border-slate-600 pt-1" />
            ) : (
              <button className="flex h-fit justify-end rounded-full bg-sky-500 px-3 py-1.5 text-sm font-semibold opacity-60">
                Reply
              </button>
            )}
          </div>
        </div>
        {toggle && (
          <div className="flex items-center justify-end gap-x-2 px-4">
            {isPosting ? (
              <LoadingSpinner size={20} stroke="#FFF" strokeWidth={4.5} />
            ) : (
              <>
                <button
                  className="flex justify-end rounded-full bg-gray-500 px-3 py-1.5 text-sm font-medium duration-300 hover:bg-gray-600 disabled:opacity-60"
                  onClick={() => {
                    setToggle(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex h-fit justify-end rounded-full bg-sky-500 px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
                  onClick={() =>
                    mutate({ content: inputText, postId: post.id })
                  }
                  disabled={inputText === ""}
                >
                  Reply
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
