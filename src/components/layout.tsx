import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="relative mx-auto  w-full max-w-lg rounded-sm border-slate-700 [@media(min-width:515px)]:border-x">
      {/* <div className="w-full">{props.children}</div> */}
      {props.children}
    </main>
  );
};
