import React from 'react';
import { Hourglass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './ChronoSphere.module.css';

const MyCollection = ({ collection }) => {
  // Raggruppa le carte per rarità
  const groupedCards = {
    Legendary: collection.filter(card => card.rarity === 'Legendary'),
    Rare: collection.filter(card => card.rarity === 'Rare'),
    Common: collection.filter(card => card.rarity === 'Common')
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Hourglass size={24} color="#fff" />
            </div>
            <div>
              <div className={styles.logoText}>ChronoSphere</div>
              <div className={styles.logoSubtext}>My Collection</div>
            </div>
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>My Collection</h1>
          <p className={styles.heroSubtitle}>
            Your historical moments collection: {collection.length} cards
          </p>
        </section>

        {Object.entries(groupedCards).map(([rarity, cards]) => (
          cards.length > 0 && (
            <section key={rarity} className={styles.collectionSection}>
              <h2 className={styles.rarityTitle}>
                <Sparkles className={styles[`rarity${rarity}Icon`]} size={24} />
                {rarity} Cards ({cards.length})
              </h2>
              <div className={styles.nftGrid}>
                {cards.map((card, index) => (
                  <article key={`${card.id}-${index}`} className={styles.card}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={card.image}
                        alt={card.title}
                        className={styles.cardImage}
                      />
                      <div className={`${styles.badge} ${styles[`rarity${rarity}`]}`}>
                        <Sparkles size={12} />
                        {card.rarity}
                      </div>
                    </div>
                    <div className={styles.cardContent}>
                      <h2 className={styles.cardTitle}>{card.title}</h2>
                      <p className={styles.cardDescription}>{card.description}</p>
                      <div className={styles.cardStats}>
                        <span className={styles.cardId}>#{card.id}</span>
                        <span className={styles.acquisitionDate}>
                          {new Date(card.acquiredAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        ))}

        {collection.length === 0 && (
          <div className={styles.emptyState}>
            <h2>No cards in your collection yet</h2>
            <p>Open some packs to start collecting historical moments!</p>
            <Link to="/" className={`${styles.button} ${styles.buttonPrimary}`}>
              Open Packs
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCollection;