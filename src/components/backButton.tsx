import { useEffect } from "react";
import { useRouter } from "next/router";

export const BackButton = () => {
  const router = useRouter();
  const handleGoBack = () => {
    const pathFirstAccess = localStorage.getItem("pathFirstAccess");
    if (router?.asPath === pathFirstAccess) {
      void router.push("/");
      localStorage.setItem("pathFirstAccess", "/");
    } else {
      router.back();
    }
  };

  useEffect(() => {
    const pathFirstAccess = localStorage.getItem("pathFirstAccess");
    if (!pathFirstAccess) {
      localStorage.setItem("pathFirstAccess", router.asPath);
    }
    const handleBeforeUnload = () => {
      localStorage.removeItem("pathFirstAccess");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
  }, [router]);

  return (
    <button onClick={handleGoBack}>
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
          d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
        />
      </svg>
    </button>
  );
};
