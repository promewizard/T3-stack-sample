import { sanitizeAuthObject } from "@clerk/nextjs/server";
import { SpinnerDotted } from "spinners-react";

const LoadingSpinner = (props: { size?: number }) => {
  return (
    <SpinnerDotted
      size={props.size ?? 50}
      thickness={100}
      speed={100}
      color="gray"
    />
  );
};

export const LoadingPage = () => {
  return (
    <div className="absolute right-0 top-0 flex h-screen w-screen items-center justify-center">
      <LoadingSpinner size={60} />
    </div>
  );
};
