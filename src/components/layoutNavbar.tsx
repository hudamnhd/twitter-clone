import type { PropsWithChildren } from "react";

export const NavbarLayout = (props: PropsWithChildren) => {
  return (
    <div className="fixed left-0 right-0 top-0 z-20  mx-auto flex h-[50px] max-w-lg items-center justify-between border-b border-slate-700 bg-slate-900/70 px-5 py-3 backdrop-blur-sm [@media(min-width:515px)]:border-x">
      {props.children}
    </div>
  );
};
