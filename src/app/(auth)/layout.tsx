import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Redirect to home if user is already authenticated
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f0f4f9] dark:bg-[#131314] text-[#1f1f1f] dark:text-[#e3e3e3] p-4 sm:p-6 select-none font-sans">
      <div className="flex-1 flex items-center justify-center py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}
