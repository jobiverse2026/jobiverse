"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";


export default function LogoutButton() {

  const router = useRouter();

  const supabase = createBrowserSupabaseClient();

  const [loading, setLoading] = useState(false);



  const handleLogout = async () => {

    try {

      setLoading(true);


      await supabase.auth.signOut();

      window.sessionStorage.setItem("jobiverse:logout-success", "true");
      router.replace("/");


      router.refresh();


    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    } finally {

      setLoading(false);

    }

  };



  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="ghost"
      className="flex w-full items-center justify-start gap-2 rounded-xl"
    >

      <LogOut size={16} />

      {loading ? "Logging out..." : "Logout"}

    </Button>
  );

}
