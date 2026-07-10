import { LogOut } from "lucide-react";
import { signOut } from "@/app/auth/sign-out/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
        <LogOut className="size-4" aria-hidden="true" />
        Odhlásit
      </Button>
    </form>
  );
}
