import { useState } from "react";
import { SignIn, SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");
  const ctx = api.useUtils();

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.post.getAll.invalidate();
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("something went wrong. Please try again later");
      }
    },
  });

  if (!user) return null;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-8">
      <Image
        src={user.imageUrl}
        alt="Profile image"
        width={56}
        height={56}
        className="flex h-14 w-14 rounded-full"
      />
      <input
        type="text"
        placeholder="Type some emojis!"
        className="flex-grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex flex-col justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postLoading } = api.post.getAll.useQuery();
  if (postLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;
  return (
    <div>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.post.getAll.useQuery();

  if (!userLoaded) return <div />;

  if (!userLoaded) return <LoadingPage />;

  return (
    <PageLayout>
      <div className="flex border-b  border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
      </div>
      {isSignedIn && <CreatePostWizard />}
      <Feed />
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </PageLayout>
  );
}
