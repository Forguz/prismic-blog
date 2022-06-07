import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Head from 'next/head';
import { useState } from 'react';

import { formatPtBr } from '../utils/dateFormat';

import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { PostItem } from '../components/PostItem';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function formatResults(postsData: PostPagination): Post[] {
  return postsData.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: formatPtBr(post.first_publication_date),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle.split('\n')[0],
        author: post.data.author,
      },
    };
  });
}

export default function Home({
  postsPagination,
}: HomeProps): React.ReactElement {
  const [results, setResults] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  async function loadMorePosts(next_page: string): Promise<void> {
    const response = await fetch(next_page);
    const data = await response.json();
    setResults(oldResults => [...oldResults, ...formatResults(data)]);
    setNextPage(data.next_page);
  }

  return (
    <>
      <Head>
        <title>Home | Prismic Blog</title>
      </Head>
      <header className={styles.header}>
        <img src="/assets/Logo.svg" alt="logo" />
      </header>
      <main className={styles.contentContainer}>
        {results.map(post => (
          <PostItem post={post} />
        ))}
        {nextPage && (
          <button
            className={styles.loadButton}
            type="button"
            onClick={() => loadMorePosts(nextPage)}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const posts = formatResults(postsResponse);

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
