import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Hourglass, Wallet, Sparkles, Package, Star } from "lucide-react";
import styles from "./ChronoSphere.module.css";
import PackOpeningModal from "./PackOpeningModal";

const ChronoSphere = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [yodaBalance, setYodaBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [collection, setCollection] = useState([]);
  const [showPackOpening, setShowPackOpening] = useState(false);
  const [packCards, setPackCards] = useState([]);
  const [queuedCards, setQueuedCards] = useState([]);

  
  useEffect(() => {
    if (queuedCards.length > 0) {
      // Aggiungiamo la data di acquisizione a ogni carta
      const cardsWithDate = queuedCards.map(card => ({
        ...card,
        acquiredAt: new Date().toISOString()
      }));
      setCollection(prev => [...prev, ...cardsWithDate]);
      setQueuedCards([]);
    }
  }, [queuedCards, setCollection]);

  const packs = [
    {
      id: 1,
      title: "Time Capsule Basic",
      description: "3 random historical moments. Chance for rare finds!",
      price: "50 YODA",
      image: "/api/placeholder/400/300",
      cardsCount: 3,
      rarityGuarantee: "Chance for Rare",
      odds: {
        common: 70,
        rare: 25,
        legendary: 5,
      },
    },
    {
      id: 2,
      title: "Chronologist's Cache",
      description: "5 historical moments with guaranteed Rare card!",
      price: "100 YODA",
      image: "/api/placeholder/400/300",
      cardsCount: 5,
      rarityGuarantee: "1 Guaranteed Rare",
      odds: {
        common: 60,
        rare: 30,
        legendary: 10,
      },
    },
    {
      id: 3,
      title: "Legendary Timeline",
      description: "7 historical moments with guaranteed Legendary card!",
      price: "200 YODA",
      image: "/api/placeholder/400/300",
      cardsCount: 7,
      rarityGuarantee: "1 Guaranteed Legendary",
      odds: {
        common: 40,
        rare: 40,
        legendary: 20,
      },
    },
  ];

  const allCards = {
    legendary: [
      {
        id: "L1",
        title: "First Man on the Moon",
        description: "The historic 1969 moon landing.",
        rarity: "Legendary",
        image: "/api/placeholder/400/300",
      },
      {
        id: "L2",
        title: "Discovery of DNA Structure",
        description: "Watson and Crick's groundbreaking discovery.",
        rarity: "Legendary",
        image: "/api/placeholder/400/300",
      },
    ],
    rare: [
      {
        id: "R1",
        title: "Launch of the First iPhone",
        description: "The moment that changed mobile technology.",
        rarity: "Rare",
        image: "/api/placeholder/400/300",
      },
      {
        id: "R2",
        title: "First Tweet Ever",
        description: "The birth of Twitter.",
        rarity: "Rare",
        image: "/api/placeholder/400/300",
      },
    ],
    common: [
      {
        id: "C1",
        title: "First YouTube Video",
        description: "The video that started it all.",
        rarity: "Common",
        image: "/api/placeholder/400/300",
      },
      {
        id: "C2",
        title: "Bitcoin Pizza Purchase",
        description: "The first real-world Bitcoin transaction.",
        rarity: "Common",
        image: "/api/placeholder/400/300",
      },
    ],
  };

  const generateRandomCard = (odds, guaranteedRarity = null) => {
    if (guaranteedRarity) {
      return allCards[guaranteedRarity][
        Math.floor(Math.random() * allCards[guaranteedRarity].length)
      ];
    }

    const rand = Math.random() * 100;
    let rarity;
    if (rand < odds.common) rarity = "common";
    else if (rand < odds.common + odds.rare) rarity = "rare";
    else rarity = "legendary";

    const cardsOfRarity = allCards[rarity];
    return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
  };

  const openPack = async (pack) => {
    try {
      const newCards = [];

      // Gestisci la carta garantita prima
      if (pack.rarityGuarantee.includes("Legendary")) {
        newCards.push(generateRandomCard(pack.odds, "legendary"));
      } else if (pack.rarityGuarantee.includes("Rare")) {
        newCards.push(generateRandomCard(pack.odds, "rare"));
      }

      // Genera le carte rimanenti
      const remainingCards = pack.cardsCount - newCards.length;
      for (let i = 0; i < remainingCards; i++) {
        newCards.push(generateRandomCard(pack.odds));
      }

      // Prima mostra il modale di apertura pacchetto
      setPackCards(newCards);
      setShowPackOpening(true);

      // Le carte verranno aggiunte alla collezione quando il modale viene chiuso
      setQueuedCards(newCards);

      // Registra la transazione
      const newTransaction = {
        timestamp: new Date().toISOString(),
        type: "Pack Opening",
        item: pack.title,
        price: pack.price,
        compotFee: "1 YODA",
      };
      setTransactions((prev) => [...prev, newTransaction]);

      // Aggiorna il balance
      const price = parseInt(pack.price.split(" ")[0]);
      setYodaBalance((prev) => prev - price - 1);
    } catch (error) {
      console.error("Error opening pack:", error);
      alert("Failed to open pack!");
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        await loadYodaBalance(accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Error connecting to wallet!");
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask to use ChronoSphere!");
    }
  };

  const loadYodaBalance = async (address) => {
    // Mock function - To be replaced with actual Yoda token contract call
    setYodaBalance(10000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Hourglass size={24} color="#fff" />
            </div>
            <div>
              <div className={styles.logoText}>ChronoSphere</div>
              <div className={styles.logoSubtext}>The Future of History</div>
            </div>
          </div>
          <div className={styles.actions}>
            {account && (
              <>
                <div className={styles.balance}>{yodaBalance} YODA</div>
                <Link
                  to="/collection"
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  My Collection
                </Link>
              </>
            )}
            {!account ? (
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet size={16} style={{ marginRight: "0.5rem" }} />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <div
                className={`${styles.button} ${styles.buttonPrimary} ${styles.fadeIn}`}>
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        {!account ? (
          <div className={styles.welcomeContainer}>
            <h1 className={styles.welcomeTitle}>Welcome to ChronoSphere</h1>
            <p className={styles.welcomeQuote}>
              "Every moment in history is a brushstroke on the canvas of time.
              Here, you don't just witness history - you own it. Connect your
              wallet to begin your journey through time."
            </p>
          </div>
        ) : (
          <div className={styles.fadeIn}>
            <section className={styles.hero}>
              <h1 className={styles.heroTitle}>Welcome to ChronoSphere</h1>
              <p className={styles.heroSubtitle}>
                Open packs to collect unique historical moments
              </p>
            </section>

            <section className={`${styles.packGrid} ${styles.slideIn}`}>
              {packs.map((pack) => (
                <article key={pack.id} className={styles.packCard}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={pack.image}
                      alt={pack.title}
                      className={styles.packImage}
                    />
                    <div className={styles.badge}>
                      <Package size={12} />
                      {pack.cardsCount} Cards
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h2 className={styles.cardTitle}>{pack.title}</h2>
                    <p className={styles.cardDescription}>{pack.description}</p>
                    <div className={styles.guaranteeTag}>
                      <Star size={12} />
                      {pack.rarityGuarantee}
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.price}>
                        <span className={styles.priceLabel}>Price</span>
                        <span className={styles.priceValue}>{pack.price}</span>
                      </div>
                      <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={() => openPack(pack)}
                      >
                        Open Pack
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </div>
        )}
      </main>
      {showPackOpening && (
        <PackOpeningModal
          cards={packCards}
          onClose={() => {
            setShowPackOpening(false);
            setPackCards([]);
          }}
        />
      )}
    </div>
  );
};

export default ChronoSphere;
