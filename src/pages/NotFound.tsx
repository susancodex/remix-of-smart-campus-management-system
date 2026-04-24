import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]" />
      <div className="relative text-center">
        <p className="font-display text-[10rem] font-extrabold leading-none text-gradient sm:text-[14rem]">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" /> Go back
            </button>
          </Button>
          <Button asChild className="gap-2 shadow-glow">
            <Link to="/">
              <Home className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;