import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";

type PostWithUser = RouterOutputs["post"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
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
          <Link href={`/@${props.author.username}`}>
            <span>{`@${props.author.username} `}&nbsp;</span>
          </Link>
          <Link href={`/post/${props.id}`}>
            <span>{` - ${dayjs(props.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-xl">{props.content}</span>
      </div>
    </div>
  );
};
