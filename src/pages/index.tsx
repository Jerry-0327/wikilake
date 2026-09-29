import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type Category = {
  emoji: string;
  title: string;
  description: string;
  link: string;
};

const categories: Category[] = [
  {emoji: '🏢', title: '建筑', description: '各建筑的介绍、位置与使用指南', link: '/buildings/'},
  {emoji: '🎭', title: '社团', description: '学生社团与组织的信息', link: '/clubs/'},
  {emoji: '🎓', title: '书院', description: '各书院的基本信息与资源', link: '/colleges/'},
  {emoji: '📚', title: '课程', description: '课程资料与学习经验', link: '/courses/'},
  {emoji: '🍜', title: '餐饮', description: '食堂菜品与餐饮攻略', link: '/foods/'},
  {emoji: '🧭', title: '指南', description: '入学、生活与学习指南', link: '/guides/'},
  {emoji: '😂', title: '梗', description: '校园梗与流行文化', link: '/memes/'},
  {emoji: '📦', title: '杂项', description: '暂未归类的内容与词条', link: '/miscs/'},
  {emoji: '👤', title: '人物', description: '校园相关人物的词条', link: '/people/'},
  {emoji: '🛠️', title: '工具', description: '实用工具、软件与资源', link: '/tools/'},
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <meta name="algolia-site-verification"  content="1BD9AB45732164E6" />
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/intro">
            进入 WikiLake 📖
          </Link>
        </div>
      </div>
    </header>
  );
}

function CategoryCard({emoji, title, description, link}: Category) {
  return (
    <div className={clsx('col col--3', styles.categoryCol)}>
      <Link to={link} className={clsx('card padding--md', styles.categoryCard)}>
        <div className={styles.categoryEmoji} aria-hidden="true">
          {emoji}
        </div>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <p className={styles.categoryDescription}>{description}</p>
      </Link>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <section className={styles.categories}>
          <div className="container">
            <div className="row">
              {categories.map((props) => (
                <CategoryCard key={props.link} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
