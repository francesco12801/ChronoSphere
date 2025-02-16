// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ChronoSphereNFT is ERC721URIStorage, Ownable {
    IERC20 public yodaToken;
    address public compotAddress;
    uint256 private _nextTokenId;
    
    // Mappings
    mapping(uint256 => CardInfo) public cardInfo;
    mapping(address => uint256[]) public userCards;
    mapping(Rarity => uint256) public rarityPoints;
    mapping(address => uint256) public userScores;
    
    // Dynamic arrays
    address[] public leaderboard;

    // Costanti per i punteggi
    uint256 public constant LEGENDARY_POINTS = 100;
    uint256 public constant RARE_POINTS = 50;
    uint256 public constant COMMON_POINTS = 10;

    // Prezzi dei pacchetti in YODA
    uint256 public constant BASIC_PACK_PRICE = 50;
    uint256 public constant ADVANCED_PACK_PRICE = 100;
    uint256 public constant PREMIUM_PACK_PRICE = 200;

    enum Rarity { Common, Rare, Legendary }
    enum PackType { Basic, Advanced, Premium }

    struct CardInfo {
        string title;
        string description;
        Rarity rarity;
        uint256 mintTimestamp;
    }

    struct LeaderboardEntry {
        address user;
        uint256 score;
        uint256 legendaryCount;
        uint256 rareCount;
        uint256 commonCount;
    }

    struct PackInfo {
        uint256 price;
        uint8 cardsCount;
        bool guaranteedRare;
        bool guaranteedLegendary;
        uint8 commonProbability;
        uint8 rareProbability;
        uint8 legendaryProbability;
    }

    event CardMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string title,
        Rarity rarity,
        uint256 points
    );

    event PackOpened(
        address indexed user,
        PackType packType,
        uint256[] tokenIds
    );

    event ScoreUpdated(
        address indexed user,
        uint256 newScore,
        Rarity rarity
    );

    constructor(
        address _yodaToken,
        address _compotAddress
    ) ERC721("ChronoSphere", "CHRONO") Ownable(msg.sender) {
        yodaToken = IERC20(_yodaToken);
        compotAddress = _compotAddress;
        
        // Inizializza i punteggi per rarità
        rarityPoints[Rarity.Legendary] = LEGENDARY_POINTS;
        rarityPoints[Rarity.Rare] = RARE_POINTS;
        rarityPoints[Rarity.Common] = COMMON_POINTS;
    }

    function getPackInfo(PackType packType) internal pure returns (PackInfo memory) {
        if (packType == PackType.Basic) {
            return PackInfo({
                price: BASIC_PACK_PRICE,
                cardsCount: 3,
                guaranteedRare: false,
                guaranteedLegendary: false,
                commonProbability: 70,
                rareProbability: 25,
                legendaryProbability: 5
            });
        } else if (packType == PackType.Advanced) {
            return PackInfo({
                price: ADVANCED_PACK_PRICE,
                cardsCount: 5,
                guaranteedRare: true,
                guaranteedLegendary: false,
                commonProbability: 60,
                rareProbability: 30,
                legendaryProbability: 10
            });
        } else {
            return PackInfo({
                price: PREMIUM_PACK_PRICE,
                cardsCount: 7,
                guaranteedRare: true,
                guaranteedLegendary: true,
                commonProbability: 40,
                rareProbability: 40,
                legendaryProbability: 20
            });
        }
    }

    function random(uint256 seed) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, seed)));
    }

    function generateRarity(PackInfo memory packInfo, uint256 seed) internal view returns (Rarity) {
        uint256 rand = random(seed) % 100;
        uint256 cumulativeProbability = packInfo.commonProbability;

        if (rand < cumulativeProbability) {
            return Rarity.Common;
        }
        
        cumulativeProbability += packInfo.rareProbability;
        if (rand < cumulativeProbability) {
            return Rarity.Rare;
        }
        
        return Rarity.Legendary;
    }

    function openPack(PackType packType) public returns (uint256[] memory) {
        PackInfo memory pack = getPackInfo(packType);
        
        // Verifica che l'utente abbia abbastanza YODA
        require(yodaToken.balanceOf(msg.sender) >= pack.price, "Insufficient YODA balance");
        
        // Trasferisci gli YODA
        require(yodaToken.transferFrom(msg.sender, owner(), pack.price), "Payment failed");
        
        // Trasferisci 1 YODA al ComPot
        require(yodaToken.transferFrom(msg.sender, compotAddress, 1), "ComPot fee failed");

        uint256[] memory mintedTokens = new uint256[](pack.cardsCount);
        bool hasRare = false;
        bool hasLegendary = false;

        // Prima gestisci le carte garantite
        uint256 startIndex = 0;
        if (pack.guaranteedLegendary) {
            mintedTokens[startIndex] = mintCard(msg.sender, Rarity.Legendary);
            hasLegendary = true;
            startIndex++;
        }
        if (pack.guaranteedRare && !hasRare) {
            mintedTokens[startIndex] = mintCard(msg.sender, Rarity.Rare);
            hasRare = true;
            startIndex++;
        }

        // Genera le carte rimanenti
        for (uint256 i = startIndex; i < pack.cardsCount; i++) {
            Rarity rarity = generateRarity(pack, random(i));
            mintedTokens[i] = mintCard(msg.sender, rarity);
        }

        emit PackOpened(msg.sender, packType, mintedTokens);
        return mintedTokens;
    }

    function mintCard(address to, Rarity rarity) internal returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        // Genera metadati della carta basati sulla rarità
        string memory title = generateCardTitle(rarity, tokenId);
        string memory description = generateCardDescription(rarity, tokenId);
        string memory tokenURI = generateTokenURI(rarity, tokenId);

        _setTokenURI(tokenId, tokenURI);

        cardInfo[tokenId] = CardInfo({
            title: title,
            description: description,
            rarity: rarity,
            mintTimestamp: block.timestamp
        });

        userCards[to].push(tokenId);
        updateUserScore(to, rarity);

        emit CardMinted(tokenId, to, title, rarity, rarityPoints[rarity]);

        return tokenId;
    }

    function updateUserScore(address user, Rarity rarity) internal {
        uint256 points = rarityPoints[rarity];
        userScores[user] += points;
        
        // Aggiorna la leaderboard
        if (leaderboard.length == 0) {
            leaderboard.push(user);
        } else {
            bool userExists = false;
            for (uint i = 0; i < leaderboard.length; i++) {
                if (leaderboard[i] == user) {
                    userExists = true;
                    break;
                }
            }
            if (!userExists) {
                leaderboard.push(user);
            }
        }
        
        sortLeaderboard();
        emit ScoreUpdated(user, userScores[user], rarity);
    }

    function sortLeaderboard() internal {
        for (uint i = 0; i < leaderboard.length - 1; i++) {
            for (uint j = 0; j < leaderboard.length - i - 1; j++) {
                if (userScores[leaderboard[j]] < userScores[leaderboard[j + 1]]) {
                    address temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }
    }

    function getLeaderboard(uint256 limit) public view returns (LeaderboardEntry[] memory) {
        uint256 size = limit < leaderboard.length ? limit : leaderboard.length;
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](size);
        
        for (uint256 i = 0; i < size; i++) {
            address user = leaderboard[i];
            (uint256 score, uint256 legendary, uint256 rare, uint256 common) = getUserStats(user);
            
            entries[i] = LeaderboardEntry({
                user: user,
                score: score,
                legendaryCount: legendary,
                rareCount: rare,
                commonCount: common
            });
        }
        
        return entries;
    }

    function getUserStats(address user) public view returns (
        uint256 score,
        uint256 legendaryCount,
        uint256 rareCount,
        uint256 commonCount
    ) {
        uint256[] memory userTokens = userCards[user];
        score = userScores[user];
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            Rarity rarity = cardInfo[userTokens[i]].rarity;
            if (rarity == Rarity.Legendary) legendaryCount++;
            else if (rarity == Rarity.Rare) rareCount++;
            else commonCount++;
        }
        
        return (score, legendaryCount, rareCount, commonCount);
    }

    function getUserCards(address user) public view returns (uint256[] memory) {
        return userCards[user];
    }

    // Funzioni helper per generare metadati (da implementare in base alle tue esigenze)
    function generateCardTitle(Rarity rarity, uint256 tokenId) internal pure returns (string memory) {
        // Implementa la logica per generare il titolo
        return "Card Title";
    }

    function generateCardDescription(Rarity rarity, uint256 tokenId) internal pure returns (string memory) {
        // Implementa la logica per generare la descrizione
        return "Card Description";
    }

    function generateTokenURI(Rarity rarity, uint256 tokenId) internal pure returns (string memory) {
        // Implementa la logica per generare l'URI dei metadati
        return "Token URI";
    }

    // Override necessario per il tracking delle carte
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        if (from != address(0)) {
            uint256[] storage fromTokens = userCards[from];
            for (uint256 i = 0; i < fromTokens.length; i++) {
                if (fromTokens[i] == tokenId) {
                    fromTokens[i] = fromTokens[fromTokens.length - 1];
                    fromTokens.pop();
                    break;
                }
            }
        }
        if (to != address(0)) {
            userCards[to].push(tokenId);
        }
        
        return from;
    }
}