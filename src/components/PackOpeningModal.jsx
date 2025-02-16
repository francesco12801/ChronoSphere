import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import styles from './ChronoSphere.module.css';

const PackOpeningModal = ({ cards, onClose }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(-1);
  const [showCard, setShowCard] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentCardIndex === -1 && cards.length > 0) {
      // Start the sequence after a short delay
      setTimeout(() => {
        setCurrentCardIndex(0);
        setShowCard(true);
      }, 500);
    }
  }, [currentCardIndex, cards.length]);

  const handleNextCard = () => {
    setShowCard(false);
    setTimeout(() => {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setShowCard(true);
      } else {
        setIsComplete(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }, 500);
  };

  const currentCard = cards[currentCardIndex];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        {currentCardIndex === -1 && (
          <div className={styles.packAnimation}>
            <div className={styles.packGlow}>
              <h2>Opening Pack...</h2>
            </div>
          </div>
        )}

        {currentCard && !isComplete && (
          <div className={styles.cardRevealContainer}>
            <div className={`${styles.cardReveal} ${showCard ? styles.revealed : ''}`}>
              <div className={styles.cardFront}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={currentCard.image}
                    alt={currentCard.title}
                    className={styles.cardImage}
                  />
                  <div className={`${styles.badge} ${styles[`rarity${currentCard.rarity}`]}`}>
                    <Sparkles size={12} />
                    {currentCard.rarity}
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{currentCard.title}</h2>
                  <p className={styles.cardDescription}>{currentCard.description}</p>
                </div>
              </div>
              <div className={styles.cardBack}>
                <div className={styles.cardBackContent}>
                  <Sparkles size={48} />
                  <p>Click to reveal!</p>
                </div>
              </div>
            </div>

            <div className={styles.cardProgress}>
              <p>Card {currentCardIndex + 1} of {cards.length}</p>
              {!showCard && (
                <button 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={() => setShowCard(true)}
                >
                  Reveal Card
                </button>
              )}
              {showCard && currentCardIndex < cards.length - 1 && (
                <button 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={handleNextCard}
                >
                  Next Card
                </button>
              )}
              {showCard && currentCardIndex === cards.length - 1 && (
                <button 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={handleNextCard}
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        )}

        {isComplete && (
          <div className={styles.completionMessage}>
            <h2>Pack Opening Complete!</h2>
            <p>All cards have been added to your collection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackOpeningModal;