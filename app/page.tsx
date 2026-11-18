import { redirect } from "next/navigation";
import GuestFlow from "@/components/GuestFlow";

// Local preview with demo photos; on the live site the root goes to the staff login.
export default function Home() {
    // if (process.env.NODE_ENV === "production") redirect("/login");
    return <GuestFlow slug="demo" />;
}
