import { LoginForm } from "#app/components/login-form";
import { cn } from "#app/utils/misc";
import { data as wrapper } from "react-router";
import { CircleCheckBig, X } from 'lucide-react';
import cache from "#app/utils/cache-server";
import type { Route } from "./+types/login";
import { getUser, sessionKey } from '#app/utils/auth.server';
import { authSessionStorage } from '#app/utils/session.server';
import { redirect } from 'react-router'

const cacheKey = `users`;
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Login Form" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request)
  if (user) {
    return redirect("/")
  }
  return null
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
  const validate = cachedData.find((d: { email: string }) => d.email === data.email);

  if (validate) {
    const password = String(hashCode(data.password as string)) === validate.password;
    if (password) {
      const authSession = await authSessionStorage.getSession(
        request.headers.get('cookie'),
      );

      const sessionData = {
        name: validate.name,
        username: validate.username,
      }
      authSession.set(sessionKey, sessionData);

      return wrapper({ success: true, messages: "Success, Login successfully" }, {
        headers: {
          'set-cookie': await authSessionStorage.commitSession(authSession, {
          }),
        },
      });
      // return { success: true, messages: "Success, Login successfully" };
    } else {
      return { success: false, messages: "Error, please check your data" };
    }
  } else {
    return { success: false, messages: "Error, please check your data" };
  }
}

export default function Login({ loaderData, actionData }: Route.ComponentProps) {
  return (
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
        <LoginForm />
      </div>
    </div>
  );
}
