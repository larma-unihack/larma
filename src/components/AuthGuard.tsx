"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, setOpenLoginModal, openLoginModal } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user && pathname !== "/") {
            if (!openLoginModal) {
                setOpenLoginModal(true);
            }
            router.push("/");
        }
    }, [user, loading, pathname, setOpenLoginModal, openLoginModal, router]);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
                <span className="loading loading-spinner text-primary loading-lg"></span>
            </div>
        );
    }

    // If not logged in and not on root, we redirect above, so just render null to avoid flashing
    if (!user && pathname !== "/") {
        return null;
    }

    return <>{children}</>;
}
