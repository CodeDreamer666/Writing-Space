"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loading from "~/components/shared/Loading";

export default function RouteLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {isLoading && <Loading />}
      {children}
    </>
  );
}
