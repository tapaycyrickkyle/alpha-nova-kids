import { MaterialSymbol } from "@/app/_components/material-symbol";
import { AdminLoginForm } from "@/app/_components/admin-login-form";

type FloatingIconProps = {
  name:
    | "auto_stories"
    | "palette"
    | "rocket_launch"
    | "school"
    | "star";
  className: string;
  sizeClass: string;
  filled?: boolean;
};

function FloatingIcon({
  name,
  className,
  sizeClass,
  filled = false,
}: FloatingIconProps) {
  const resolvedName: React.ComponentProps<typeof MaterialSymbol>["name"] =
    name === "auto_stories"
      ? "school"
      : name === "palette"
        ? "extension"
        : name;

  return (
    <div className={`pointer-events-none absolute -z-10 text-primary ${className}`}>
      <MaterialSymbol name={resolvedName} filled={filled} className={sizeClass} />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="bg-pattern relative flex min-h-screen items-center justify-center overflow-hidden bg-surface p-6 font-body text-on-surface">
      <FloatingIcon
        name="school"
        className="top-10 left-10 scale-150 opacity-15"
        sizeClass="size-[120px]"
      />
      <FloatingIcon
        name="star"
        filled
        className="bottom-20 left-20 scale-125 opacity-15"
        sizeClass="size-[100px]"
      />
      <FloatingIcon
        name="palette"
        className="top-1/4 right-20 scale-110 opacity-15"
        sizeClass="size-[90px]"
      />
      <FloatingIcon
        name="rocket_launch"
        filled
        className="right-10 bottom-1/4 scale-150 opacity-15"
        sizeClass="size-[110px]"
      />
      <FloatingIcon
        name="auto_stories"
        className="top-10 right-1/3 opacity-10"
        sizeClass="size-[80px]"
      />

      <div className="relative w-full max-w-[480px]">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary-container shadow-lg">
            <MaterialSymbol
              name="toys"
              filled
              className="size-10 text-on-primary-container"
            />
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">
            Alpha Nova Kids
          </h1>
          <p className="mt-1 font-label text-sm font-bold tracking-[0.3em] text-outline uppercase">
            Admin Portal
          </p>
        </div>

        <section className="relative overflow-hidden rounded-lg bg-surface-container-lowest p-10 shadow-[0px_20px_40px_rgba(44,47,49,0.06)] md:p-12">
          <div className="mb-8">
            <h2 className="mb-2 font-headline text-2xl font-bold text-on-surface">
              Welcome back, Admin!
            </h2>
            <p className="text-base text-on-surface-variant">
              Please enter your credentials to manage the educational ecosystem.
            </p>
          </div>

          <div className="hidden items-center gap-3 rounded-DEFAULT border border-error-container/20 bg-error-container/10 p-4">
            <MaterialSymbol name="error" className="size-5 text-error" />
            <p className="text-sm font-medium text-on-error-container">
              Invalid Credentials. Please try again.
            </p>
          </div>

          <AdminLoginForm />

          <div className="mt-8 flex justify-center border-t-0 pt-8">
            <p className="flex items-center gap-2 text-sm text-on-surface-variant">
              <MaterialSymbol name="verified_user" className="size-4" />
              Authorized Personnel Only
            </p>
          </div>
        </section>

        <div className="absolute top-24 -left-20 -z-10 hidden h-32 w-32 rounded-lg bg-tertiary-container opacity-80 shadow-lg backdrop-blur-sm lg:block">
          <div className="flex h-full items-center justify-center p-4">
            <MaterialSymbol
              name="extension"
              filled
              className="size-10 text-on-tertiary-container"
            />
          </div>
        </div>

        <div className="absolute -right-24 -bottom-12 -z-10 hidden h-48 w-48 rounded-lg bg-secondary-container opacity-80 shadow-xl backdrop-blur-sm lg:block">
          <div className="flex h-full flex-col justify-end p-6">
            <MaterialSymbol
              name="emoji_events"
              filled
              className="mb-2 size-10 text-on-secondary-container"
            />
            <p className="font-headline font-bold leading-tight text-on-secondary-container">
              Reward
              <br />
              Excellence
            </p>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <a
            href="#"
            className="flex items-center justify-center gap-1 text-xs font-medium text-on-surface-variant/60 transition-colors hover:text-primary"
          >
            <MaterialSymbol name="help" className="size-4" />
            Need assistance? Contact support
          </a>
        </footer>
      </div>
    </main>
  );
}
