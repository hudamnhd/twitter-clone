import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";

export const AuthShowcase = () => {
  const { data: sessionData, status } = useSession();

  const [inputUsername, setInputUsername] = useState("");

  const userId = sessionData?.user?.id;

  const { data } = api.profile.getUsername.useQuery(
    {
      id: userId ?? "",
    },
    { enabled: sessionData?.user !== undefined },
  );

  const { mutate, isLoading, isSuccess } = api.profile.setUsername.useMutation({
    onSuccess: () => {
      toast.success("success");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.username;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
        console.log(errorMessage);
      } else {
        toast.error("Please try again later.");
      }
    },
  });

  if (data?.username === null && !isSuccess)
    return (
      <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-slate-900/70">
        <div className=" flex w-full flex-col rounded-md border-2 border-gray-700  bg-slate-900 p-8">
          <div className="mx-auto flex w-full max-w-xs flex-col">
            <div className="mb-2 text-center text-2xl font-medium font-semibold leading-none text-gray-200">
              Set Your Username
            </div>
            <div className="mt-4 flex  flex-col gap-y-4">
              <input
                type="text"
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Type Your Username"
                disabled={isLoading}
                className="rounded-md bg-slate-800/90 px-3 py-1 outline-none ring-2 ring-gray-700  focus:ring-sky-600 disabled:opacity-70"
              />
              <div className="flex justify-center">
                <div className="flex items-center">
                  <button
                    disabled={inputUsername.length < 3 || isLoading}
                    className="flex-no-shrink flex items-center gap-x-2 rounded-full border-2 border-sky-600 bg-sky-600 px-5 py-1.5 text-sm font-semibold tracking-wider text-white shadow-sm duration-300 hover:shadow-lg disabled:opacity-70"
                    onClick={() =>
                      mutate({
                        userId: data.id,
                        username: inputUsername,
                      })
                    }
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner
                          size={16}
                          stroke="#FFF"
                          strokeWidth={4.5}
                        />
                        <span>Saving</span>
                      </>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <button
      className="flex items-center gap-x-1"
      onClick={sessionData ? () => void signOut() : () => void signIn()}
    >
      {status === "loading" && <LoadingSpinner />}
      {sessionData && status === "authenticated" && (
        <>
          <span className="text-sm font-semibold">Sign out</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.7}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </>
      )}
      {!sessionData && status === "unauthenticated" && (
        <>
          <span className="text-sm font-semibold">Sign in</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 rotate-180"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />{" "}
          </svg>
        </>
      )}
    </button>
  );
};
