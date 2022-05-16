const CONTRACT_ADDRESS = '0xC120564dF7878C0CA6fE2C38ff29db7847990f5E';

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
  