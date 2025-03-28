import { RegisterForm } from "#app/components/register-form";
import { CircleCheckBig, X } from 'lucide-react';
import { cn } from "#app/utils/misc";
import cache from "#app/utils/cache-server";
import type { Route } from "./+types/register";

const cacheKey = `users`;
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  const cachedData = cache.get(cacheKey) || [];
  return { data: cachedData };
}

const hashCode = (s: string) =>
  s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();
  const data = Object.fromEntries(formData);
  // const oneYear = 3153600000;
  const cachedData = cache.get(cacheKey) || [];
  const validate = cachedData.filter((d) =>
    d.username === data.username || d.email === data.email
  );
  if (validate.length === 0) {
    const _data = {
      ...data,
      password: String(hashCode(data.password as string)),
      following: [],
      followers: [],
      posts: [],
    };
    const dataUsers = [...cachedData, _data];
    cache.set(cacheKey, dataUsers);
    return { success: true, messages: "Success, Register successfully", data, cachedData };
  } else {
    return { success: false, data, messages: "Error, Please using another username or email" };
  }
}

export default function Register({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">

          {actionData?.messages && (<div className={cn("rounded-md px-3 py-4 my-2",
            actionData.success ? "bg-green-800" : "bg-red-800"
          )}>
            <div className="flex">
              <div className="flex-shrink-0">
                {actionData.success ? (
                  <CircleCheckBig className="h-5 w-5 text-green-400" aria-hidden="true" />
                ) : (
                  <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                )}
              </div>
              <div className="ml-3">
                <p className={cn("text-sm font-medium", actionData.success ? "text-green-100" : "text-red-100")}>{actionData?.messages}</p>
              </div>
            </div>
          </div>)}
          <RegisterForm />
        </div>
      </div>
    </>
  );
}
