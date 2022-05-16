const CONTRACT_ADDRESS = '0x7Fbb42A8e71182632eCDb353Dc5A39c44bA7c849';

const transformCharacterData = (characterData) => {
    return {
      name: characterData.name,
      imageURI: characterData.imageURI,
      hp: characterData.hp.toNumber(),
      maxHp: characterData.maxHp.toNumber(),
      attackDamage: characterData.attackDamage.toNumber(),
    };
};
  
export { CONTRACT_ADDRESS, transformCharacterData };
  