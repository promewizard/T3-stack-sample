import Head from "next/head";
import Link from "next/link";
import { SignIn, SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";

const CreatePostWizard = () => {
  const { user } = useUser();
  console.log(user);
  if (!user) return null;
  return (
    <div className="flex gap-3 ">
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
      />
    </div>
  );
};

export default function Home() {
  const { data, isLoading } = api.post.getAll.useQuery();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400 md:max-w-2xl">
          <div className="border-b border-slate-400 p-4">
            {!isLoading && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isLoading && <CreatePostWizard />}
          </div>
          <div>
            {[...data, ...data]?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.id} />
            ))}
          </div>
        </div>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </main>
    </>
  );
}

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  return (
    <div key={props.id} className="flex gap-3 border-b border-slate-400 p-8">
      <Image
        src={props.author.profilePicture}
        alt="Profile image"
        width={56}
        height={56}
        className="flex h-14 w-14 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex font-bold text-slate-300">
          <span>{`@${props.author.username} `}&nbsp;</span>
          <span>{` - ${dayjs(props.createdAt).fromNow()}`}</span>
        </div>
        <span>{props.content}</span>
      </div>
    </div>
  );
};
