import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { formatPtBr } from '../../utils/dateFormat';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: string;
    }[];
  };
}

interface Content {
  heading: string;
  body: string;
}

interface PostProps {
  post: Post;
  timeToRead: number;
}

function getWordsOnly(str: string): Array<string> {
  const matchTagsAndSpaces = /<.*?p*\/?>|[^\S\r\n]/gi;
  return str.split(matchTagsAndSpaces).filter((word: string) => word);
}

function countWords(contents: Content[]): number {
  return contents.reduce((acc, content) => {
    return (
      acc +
      getWordsOnly(content.heading).length +
      getWordsOnly(content.body).length
    );
  }, 0);
}

export default function Post({
  post,
  timeToRead,
}: PostProps): React.ReactElement {
  return (
    <>
      <Header />
      <div className={styles.imageContainer}>
        <img src={post.data.banner.url} height="400" alt="banner" />
      </div>
      <section className={styles.postData}>
        <h1 className={styles.postHead}>{post.data.title}</h1>
        <div className={styles.postInfos}>
          <div>
            <FiCalendar size={20} /> {post.first_publication_date}
          </div>
          <div>
            <FiUser size={20} /> {post.data.author}
          </div>
          <div>
            <FiClock size={20} /> {timeToRead} min
          </div>
        </div>
        {/* <p className={styles.content}>{post.data.subtitle}</p> */}
        {post.data.content.map(({ heading, body }) => (
          <>
            <h2 className={styles.heading}>{heading}</h2>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </>
        ))}
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    pageSize: 5,
  });

  const slugsToPreRender = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths: slugsToPreRender,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(params.slug), {});

  const formatedContent = response.data.content.map(content => ({
    heading: content.heading,
    body: RichText.asHtml(content.body),
  }));

  const post = {
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      content: formatedContent,
      author: response.data.author,
      banner: response.data.banner,
    },
    first_publication_date: formatPtBr(response.first_publication_date),
  };

  const timeToRead = Math.floor(countWords(formatedContent) / 200);

  console.log(timeToRead);

  return {
    props: {
      post,
      timeToRead,
    },
  };
};
