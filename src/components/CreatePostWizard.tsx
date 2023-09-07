import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useAutoResizeInput } from "~/hook/useAutoResizeInput";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import Image from "next/image";

export const CreatePostWizard = () => {
  const { data: user } = useSession();

  const { inputText, setInputText, inputTextRef } = useAutoResizeInput("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInputText("");
      void ctx.posts.getAll.invalidate();
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

  if (!user) return null;

  return (
    <div className="flex w-full items-start gap-3 p-4">
      <Image
        src={user.user?.image ?? ""}
        width={45}
        height={45}
        alt="Profil image"
        className="rounded-full"
      />
      <div className="w-full pt-1.5">
        <textarea
          className="h-auto w-full resize-none overflow-hidden border-none bg-transparent text-base outline-none focus:ring-0 disabled:opacity-60"
          rows={1}
          ref={inputTextRef}
          value={inputText}
          disabled={isPosting}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Apa yang sedang anda pikirkan?!"
        />
        <div className="mb-3 border-b border-slate-600" />
        <div className="flex justify-end">
          {isPosting ? (
            <LoadingSpinner size={20} stroke="#FFF" strokeWidth={4.5} />
          ) : (
            <button
              className="flex justify-end rounded-full bg-sky-500 px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
              onClick={() => mutate({ content: inputText })}
              disabled={inputText === ""}
            >
              Posting
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
