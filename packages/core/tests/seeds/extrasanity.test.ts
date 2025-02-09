import { test, expect } from 'vitest';

import { makeTestSeed } from '../helper';

test("Can make a seed - Extrasanity", async () => {
  const res = await makeTestSeed("Extrasanity", {
    songs: 'anywhere',
    goldSkulltulaTokens: 'all',
    housesSkulltulaTokens: 'all',
    strayFairyChestShuffle: 'anywhere',
    strayFairyOtherShuffle: 'anywhere',
    townFairyShuffle: 'anywhere',
    bossKeyShuffleOot: 'anywhere',
    bossKeyShuffleMm: 'anywhere',
    smallKeyShuffleOot: 'anywhere',
    smallKeyShuffleMm: 'anywhere',
    smallKeyShuffleHideout: 'anywhere',
    cowShuffleOot: true,
    cowShuffleMm: true,
    shopShuffleOot: "full",
    shopShuffleMm: "full",
    eggShuffle: true,
    divingGameRupeeShuffle: true,
    pondFishShuffle: true,
    fairyFountainFairyShuffleOot: true,
    fairyFountainFairyShuffleMm: true,
    scrubShuffleOot: true,
    scrubShuffleMm: true,
    childWallets: true,
    colossalWallets: true,
    tingleShuffle: 'anywhere',
    owlShuffle: 'anywhere',
    shufflePotsOot: 'all',
    shufflePotsMm: 'all',
    shuffleGrassOot: 'all',
    shuffleGrassMm: 'all',
    shuffleTFGrassMm: true,
    shuffleBarrelsMm: 'all',
    shuffleCratesOot: 'all',
    shuffleCratesMm: 'all',
    shuffleFreeRupeesOot: 'all',
    shuffleFreeRupeesMm: 'all',
    shuffleFreeHeartsOot: 'all',
    shuffleFreeHeartsMm: true,
    shuffleHivesOot: true,
    shuffleHivesMm: true,
    shuffleButterfliesOot: true,
    shuffleButterfliesMm: true,
    shuffleWonderItemsOot: 'all',
    shuffleWonderItemsMm: true,
    fairySpotShuffleOot: true,
    shuffleRedBouldersOot: true,
    shuffleRedBouldersMm: true,
  });
  expect(res).toBeDefined();
});
