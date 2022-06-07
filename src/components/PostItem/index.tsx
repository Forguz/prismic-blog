import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import styles from './postItem.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostItemProps {
  post: Post;
}

export function PostItem({ post }: PostItemProps): React.ReactElement {
  return (
    <Link href={`/posts/${post.uid}`}>
      <div className={styles.container}>
        <h1 className={styles.postTitle}>{post.data.title}</h1>
        <sub className={styles.postSubtitle}>{post.data.subtitle}</sub>
        <div className={styles.postInfos}>
          <span>
            <FiCalendar size={20} />
            {post.first_publication_date}
          </span>
          <span>
            <FiUser size={20} />
            {post.data.author}
          </span>
        </div>
      </div>
    </Link>
  );
}
