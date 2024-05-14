import JSZip from 'jszip';

import { Random, sample, shuffle } from '../random';
import { toU32Buffer } from '../util';
import { Game } from '../config';
import { RomBuilder } from '../rom-builder';
import { Monitor } from '../monitor';
import { LogWriter } from '../util/log-writer';

type MusicEntry = {
  type: 'bgm' | 'fanfare';
  name: string;
  oot?: number[];
  mm?: number[];
}

const MUSIC: {[k: string]: MusicEntry} = {
  OOT_HYRULE_FIELD: { type: 'bgm', name: 'Hyrule Field', oot: [0x02] },
  OOT_KAKARIKO_ADULT: { type: 'bgm', name: 'Kakariko Adult', oot: [0x19] },
  OOT_BATTLE: { type: 'bgm', name: 'Battle (OoT)', oot: [0x1a] },
  OOT_BATTLE_BOSS: { type: 'bgm', name: 'Boss Battle (OoT)', oot: [0x1b] },
  OOT_DEKU_TREE: { type: 'bgm', name: 'Deku Tree', oot: [0x1c] },
  OOT_MARKET: { type: 'bgm', name: 'Market', oot: [0x1d] },
  OOT_TITLE: { type: 'bgm', name: 'Title Theme', oot: [0x1e] },
  OOT_HOUSES: { type: 'bgm', name: 'Houses', oot: [0x1f] },
  OOT_JABU_JABU: { type: 'bgm', name: 'Jabu Jabu', oot: [0x26] },
  OOT_KAKARIKO_CHILD: { type: 'bgm', name: 'Kakariko Child', oot: [0x27] },
  OOT_FAIRY_FOUNTAIN: { type: 'bgm', name: 'Fairy Fountain', oot: [0x28, 0x57] },
  OOT_ZELDA_THEME: { type: 'bgm', name: 'Zelda Theme', oot: [0x29] },
  OOT_TEMPLE_FIRE: { type: 'bgm', name: 'Fire Temple', oot: [0x2a] },
  OOT_TEMPLE_FOREST: { type: 'bgm', name: 'Forest Temple', oot: [0x2c] },
  OOT_CASTLE_COURTYARD: { type: 'bgm', name: 'Castle Courtyard', oot: [0x2d] },
  OOT_GANONDORF_THEME: { type: 'bgm', name: 'Ganondorf Theme', oot: [0x2e] },
  OOT_LON_LON_RANCH: { type: 'bgm', name: 'Lon Lon Ranch', oot: [0x2f] },
  OOT_GORON_CITY: { type: 'bgm', name: 'Goron City', oot: [0x30] },
  OOT_BATTLE_MINIBOSS: { type: 'bgm', name: 'Miniboss Battle', oot: [0x38] },
  OOT_TEMPLE_OF_TIME: { type: 'bgm', name: 'Temple of Time', oot: [0x3a] },
  OOT_KOKIRI_FOREST: { type: 'bgm', name: 'Kokiri Forest', oot: [0x3c] },
  OOT_LOST_WOODS: { type: 'bgm', name: 'Lost Woods', oot: [0x3e] },
  OOT_TEMPLE_SPIRIT: { type: 'bgm', name: 'Spirit Temple', oot: [0x3f] },
  OOT_HORSE_RACE: { type: 'bgm', name: 'Horse Race', oot: [0x40] },
  OOT_INGO_THEME: { type: 'bgm', name: 'Ingo Theme', oot: [0x42] },
  OOT_FAIRY_FLYING: { type: 'bgm', name: 'Fairy Flying', oot: [0x4a] },
  OOT_THEME_DEKU_TREE: { type: 'bgm', name: 'Deku Tree Theme', oot: [0x4b] },
  OOT_WINDMILL_HUT: { type: 'bgm', name: 'Windmill Hut', oot: [0x4c] },
  OOT_SHOOTING_GALLERY: { type: 'bgm', name: 'Shooting Gallery', oot: [0x4e] },
  OOT_SHEIK_THEME: { type: 'bgm', name: 'Sheik Theme', oot: [0x4f] },
  OOT_ZORAS_DOMAIN: { type: 'bgm', name: 'Zoras Domain', oot: [0x50] },
  OOT_SHOP: { type: 'bgm', name: 'Shop', oot: [0x55] },
  OOT_SAGES: { type: 'bgm', name: 'Chamber of the Sages', oot: [0x56] },
  OOT_ICE_CAVERN: { type: 'bgm', name: 'Ice Cavern', oot: [0x58] },
  OOT_KAEPORA_GAEBORA: { type: 'bgm', name: 'Kaepora Gaebora', oot: [0x5a] },
  OOT_TEMPLE_SHADOW: { type: 'bgm', name: 'Shadow Temple', oot: [0x5b] },
  OOT_TEMPLE_WATER: { type: 'bgm', name: 'Water Temple', oot: [0x5c] },
  OOT_GERUDO_VALLEY: { type: 'bgm', name: 'Gerudo Valley', oot: [0x5f] },
  OOT_POTION_SHOP: { type: 'bgm', name: 'Potion Shop (OoT)', oot: [0x60] },
  OOT_KOTAKE_KOUME: { type: 'bgm', name: 'Kotake and Koume', oot: [0x61] },
  OOT_ESCAPE_CASTLE: { type: 'bgm', name: 'Castle Escape', oot: [0x62] },
  OOT_UNDERGROUND_CASTLE: { type: 'bgm', name: 'Castle Underground', oot: [0x63] },
  OOT_BATTLE_GANONDORF: { type: 'bgm', name: 'Ganondorf Battle', oot: [0x64] },
  OOT_BATTLE_BOSS_FIRE: { type: 'bgm', name: 'Fire Temple Boss', oot: [0x6b] },
  OOT_MINIGAME: { type: 'bgm', name: 'Minigame', oot: [0x6c] },
  MM_TERMINA_FIELD: { type: 'bgm', name: 'Termina Field', mm: [0x02] },
  MM_TEMPLE_STONE_TOWER: { type: 'bgm', name: 'Stone Tower Temple', mm: [0x06] },
  MM_TEMPLE_STONE_TOWER_INVERTED: { type: 'bgm', name: 'Stone Tower Temple Inverted', mm: [0x07] },
  MM_SOUTHERN_SWAMP: { type: 'bgm', name: 'Southern Swamp', mm: [0x0c] },
  MM_ALIENS: { type: 'bgm', name: 'Aliens', mm: [0x0d] },
  MM_MINIGAME: { type: 'bgm', name: 'Minigame (MM)', mm: [0x0e] },
  MM_SHARP_CURSE: { type: 'bgm', name: 'Sharp Curse', mm: [0x0f] },
  MM_GREAT_BAY_COAST: { type: 'bgm', name: 'Great Bay Coast', mm: [0x10] },
  MM_IKANA_VALLEY: { type: 'bgm', name: 'Ikana Valley', mm: [0x11] },
  MM_COURT_DEKU_KING: { type: 'bgm', name: 'Court of the Deku King', mm: [0x12] },
  MM_MOUNTAIN_VILLAGE: { type: 'bgm', name: 'Mountain Village', mm: [0x13] },
  MM_PIRATES_FORTRESS: { type: 'bgm', name: 'Pirates Fortress', mm: [0x14] },
  MM_CLOCK_TOWN_DAY_1: { type: 'bgm', name: 'Clock Town Day 1', mm: [0x15, 0x1d] },
  MM_CLOCK_TOWN_DAY_2: { type: 'bgm', name: 'Clock Town Day 2', mm: [0x16, 0x23] },
  MM_CLOCK_TOWN_DAY_3: { type: 'bgm', name: 'Clock Town Day 3', mm: [0x17] },
  MM_BATTLE_BOSS: { type: 'bgm', name: 'Boss Battle (MM)', mm: [0x1b] },
  MM_WOODFALL_TEMPLE: { type: 'bgm', name: 'Woodfall Temple', mm: [0x1c] },
  MM_STOCK_POT_INN: { type: 'bgm', name: 'Stock Pot Inn', mm: [0x1f] },
  MM_MINIGAME2: { type: 'bgm', name: 'Minigame 2 (MM)', mm: [0x25] },
  MM_GORON_RACE: { type: 'bgm', name: 'Goron Race', mm: [0x26] },
  MM_MUSIC_BOX_HOUSE: { type: 'bgm', name: 'Music Box House', mm: [0x27] },
  MM_FAIRYS_FOUNTAIN: { type: 'bgm', name: 'Fairy\'s Fountain', mm: [0x28] },
  MM_MARINE_RESEARCH_LABORATORY: { type: 'bgm', name: 'Marine Research Laboratory', mm: [0x2c] },
  MM_ROMANI_RANCH: { type: 'bgm', name: 'Romani Ranch', mm: [0x2f] },
  MM_GORON_VILLAGE: { type: 'bgm', name: 'Goron Village', mm: [0x30] },
  MM_MAYOR_DOTOUR: { type: 'bgm', name: 'Mayor Dotour', mm: [0x31] },
  MM_ZORA_HALL: { type: 'bgm', name: 'Zora Hall', mm: [0x36] },
  MM_MINIBOSS: { type: 'bgm', name: 'Mini Boss', mm: [0x38] },
  MM_ASTRAL_OBSERVATORY: { type: 'bgm', name: 'Astral Observatory', mm: [0x3a] },
  MM_BOMBERS_HIDEOUT: { type: 'bgm', name: 'Bombers Hideout', mm: [0x3b] },
  MM_MILK_BAR_LATTE: { type: 'bgm', name: 'Milk Bar Latte', mm: [0x3c] },
  MM_WOODS_OF_MYSTERY: { type: 'bgm', name: 'Woods of Mystery', mm: [0x3e] },
  MM_GORMAN_RACE: { type: 'bgm', name: 'Gorman Race', mm: [0x40] },
  MM_GORMAN_BROS: { type: 'bgm', name: 'Gorman Bros.', mm: [0x42] },
  MM_KOTAKE_POTION_SHOP: { type: 'bgm', name: 'Kotake\'s Potion Shop', mm: [0x43] },
  MM_STORE: { type: 'bgm', name: 'Store', mm: [0x44] },
  MM_TARGET_PRACTICE: { type: 'bgm', name: 'Target Practice', mm: [0x46] },
  MM_SWORD_TRAINING: { type: 'bgm', name: 'Sword Training', mm: [0x50] },
  MM_FINAL_HOURS: { type: 'bgm', name: 'Final Hours', mm: [0x57] },
  MM_TEMPLE_SNOWHEAD: { type: 'bgm', name: 'Snowhead Temple', mm: [0x65] },
  MM_TEMPLE_GREAT_BAY: { type: 'bgm', name: 'Great Bay Temple', mm: [0x66] },
  MM_BATTLE_MAJORA3: { type: 'bgm', name: 'Majora\'s Wrath', mm: [0x69] },
  MM_BATTLE_MAJORA2: { type: 'bgm', name: 'Majora\'s Incarnation', mm: [0x6a] },
  MM_BATTLE_MAJORA1: { type: 'bgm', name: 'Majora\'s Mask', mm: [0x6b] },
  MM_IKANA_CASTLE: { type: 'bgm', name: 'Ikana Castle', mm: [0x6f] },
  MM_CLEAR_WOODFALL: { type: 'bgm', name: 'Woodfall Clear', mm: [0x78] },
  MM_CLEAR_SNOWHEAD: { type: 'bgm', name: 'Snowhead Clear', mm: [0x79] },
  FANFARE_SHARED_ITEM_MAJOR: { type: 'fanfare', name: 'Fanfare Item Major', oot: [0x22], mm: [0x22] },
  FANFARE_SHARED_ITEM_HEART_PIECE: { type: 'fanfare', name: 'Fanfare Item Heart Piece', oot: [0x39], mm: [0x39] },
  FANFARE_SHARED_ITEM_HEART_CONTAINER: { type: 'fanfare', name: 'Fanfare Item Heart Container', oot: [0x24], mm: [0x24] },
  FANFARE_SHARED_ITEM_MASK: { type: 'fanfare', name: 'Fanfare Item Mask', oot: [], mm: [0x37] },
  FANFARE_SHARED_ITEM_STONE: { type: 'fanfare', name: 'Fanfare Item Stone', oot: [0x32], mm: [] },
  FANFARE_SHARED_ITEM_MEDALLION: { type: 'fanfare', name: 'Fanfare Item Medallion', oot: [0x43], mm: [] },
  FANFARE_SHARED_ITEM_OCARINA: { type: 'fanfare', name: 'Fanfare Item Ocarina', oot: [0x3d], mm: [0x52] },
};

type MusicFile = {
  type: 'bgm' | 'fanfare';
  seq: Buffer;
  bankIdOot: number | null;
  bankIdMm: number | null;
  bankCustom: { meta: Buffer, data: Buffer } | null;
  filename: string;
  name: string;
  games: Game[];
};

function saneName(name: string) {
  /* Force NFC */
  name = name.normalize('NFC');

  /* A diacritics */
  for (const m of ['á', 'à', 'â', 'ä']) {
    name = name.replace(m, 'a');
  }
  for (const m of ['Á', 'À', 'Â', 'Ä']) {
    name = name.replace(m, 'A');
  }

  /* E diacritics */
  for (const m of ['é', 'è', 'ê', 'ë']) {
    name = name.replace(m, 'e');
  }
  for (const m of ['É', 'È', 'Ê', 'Ë']) {
    name = name.replace(m, 'E');
  }

  /* I diacritics */
  for (const m of ['í', 'ì', 'î', 'ï']) {
    name = name.replace(m, 'i');
  }
  for (const m of ['Í', 'Ì', 'Î', 'Ï']) {
    name = name.replace(m, 'I');
  }

  /* O diacritics */
  for (const m of ['ó', 'ò', 'ô', 'ö']) {
    name = name.replace(m, 'o');
  }
  for (const m of ['Ó', 'Ò', 'Ô', 'Ö']) {
    name = name.replace(m, 'O');
  }

  /* U diacritics */
  for (const m of ['ú', 'ù', 'û', 'ü']) {
    name = name.replace(m, 'u');
  }
  for (const m of ['Ú', 'Ù', 'Û', 'Ü']) {
    name = name.replace(m, 'U');
  }

  /* Y diacritics */
  for (const m of ['ý', 'ÿ']) {
    name = name.replace(m, 'y');
  }
  for (const m of ['Ý', 'Ÿ']) {
    name = name.replace(m, 'Y');
  }

  /* C diacritics */
  for (const m of ['ç']) {
    name = name.replace(m, 'c');
  }
  for (const m of ['Ç']) {
    name = name.replace(m, 'C');
  }

  /* N diacritics */
  for (const m of ['ñ']) {
    name = name.replace(m, 'n');
  }
  for (const m of ['Ñ']) {
    name = name.replace(m, 'N');
  }

  /* AE */
  name = name.replace('æ', 'ae');
  name = name.replace('Æ', 'AE');

  /* OE */
  name = name.replace('œ', 'oe');
  name = name.replace('Œ', 'OE');

  /* Remove every other non-ascii */
  name = name.replace(/[^ -~]/g, '');

  return name;
}

function isMusicSuitable(entry: MusicEntry, file: MusicFile) {
  if (entry.type !== file.type) return false;
  if (entry.oot !== undefined && !file.games.includes('oot')) return false;
  if (entry.mm !== undefined && !file.games.includes('mm')) return false;

  return true;
}

function mmrSampleBank(sb: number) {
  if (sb === 0xff) {
    return 0xff;
  }
  return sb + 8;
}

class MusicInjector {
  private musics: MusicFile[];
  private namesBuffer: Buffer;
  private bankId: number;

  constructor(
    private writer: LogWriter,
    private monitor: Monitor,
    private builder: RomBuilder,
    private random: Random,
    private musicZipData: Buffer,
  ) {
    this.musics = [];
    this.namesBuffer = Buffer.alloc(256 * 2 * 48);
    this.bankId = 0x60;
  }

  private isMaxBank() {
    return this.bankId >= 0xf0;
  }

  private addCustomBank(meta: Buffer, data: Buffer) {
    const bankId = this.bankId++;
    const dataVrom = this.appendAudio(data);
    const dataSize = data.length;
    const prefix = toU32Buffer([dataVrom, dataSize]);
    const fullmeta = Buffer.concat([prefix, meta]);
    const customFile = this.builder.fileByNameRequired('custom/bank_table');
    const offset = (bankId - 0x60) * 0x10;
    fullmeta.copy(customFile.data, offset);
    return bankId;
  }

  private registerName(seqId: number, name: string) {
    /* Cut name to 48 characters */
    name = name.slice(0, 48);

    /* Write to buffer */
    const offset = seqId * 48;
    this.namesBuffer.write(name, offset, 'utf-8');
  }

  private async loadMusicsOotrs(files: JSZip.JSZipObject[]) {
    for (const f of files) {
      /* Get the music zip */
      const musicZipBuffer = await f.async('nodebuffer');
      let musicZip: JSZip;
      try {
        musicZip = await JSZip.loadAsync(musicZipBuffer);
      } catch (e) {
        this.monitor.warn(`Skipped music file ${f.name}: invalid zip file`);
        continue;
      }

      /* Look for custom bank data */
      const filesBank = musicZip.file(/\.z?bank$/);
      if (filesBank.length > 1) {
        this.monitor.warn(`Skipped music file ${f.name}: multiple bank files`);
        continue;
      }
      const filesBankmeta = musicZip.file(/\.z?bankmeta$/);
      if (filesBankmeta.length > 1) {
        this.monitor.warn(`Skipped music file ${f.name}: multiple bankmeta files`);
        continue;
      }

      if (filesBank.length !== filesBankmeta.length) {
        this.monitor.warn(`Skipped music file ${f.name}: bank and bankmeta mismatch`);
        continue;
      }

      const badFiles = musicZip.file(/\.z?sound$/);
      if (badFiles.length > 0) {
        this.monitor.warn(`Skipped music file ${f.name}: unsupported files found`);
        continue;
      }

      /* Find the meta file */
      const metaFile = musicZip.file(/\.meta$/);
      if (metaFile.length !== 1) {
        this.monitor.warn(`Skipped music file ${f.name}: multiple metadata files`);
        continue;
      }

      /* Find the seq file */
      const seqFiles = musicZip.file(/\.seq$/);
      if (seqFiles.length !== 1) {
        this.monitor.warn(`Skipped music file ${f.name}: multiple sequence files`);
        continue;
      }

      /* Parse the metadata */
      const metaRaw = await metaFile[0].async('text');
      const meta = metaRaw.split(/\r?\n/);
      if (meta.length < 3) {
        this.monitor.warn(`Skipped music file ${f.name}: metadata must have at least 3 lines`);
        continue;
      }
      const filename = f.name.split('/').pop()!;
      const name = saneName(meta[0]);
      const type = meta[2].toLowerCase();
      const games: Game[] = ['oot'];
      if (type !== 'bgm' && type !== 'fanfare') {
        this.monitor.warn(`Skipped music file ${f.name}: unknown type ${type}`);
        continue;
      }

      let bankCustom: { meta: Buffer, data: Buffer } | null = null;
      let bankIdOot: number | null = null;
      let bankIdMm: number | null = null;

      if (filesBank.length) {
        const bank = await filesBank[0].async('nodebuffer');
        const bankmeta = await filesBankmeta[0].async('nodebuffer');
        if (bankmeta.length !== 0x08) {
          this.monitor.warn(`Skipped music file ${f.name}: invalid bankmeta length`);
          continue;
        }
        bankCustom = { meta: bankmeta, data: bank };
        games.push('mm');
      } else {
        bankIdOot = Number(meta[1]);
        if (bankIdOot >= 2) {
          bankIdMm = bankIdOot + 0x30;
          games.push('mm');
        }
      }

      /* Add the music */
      const seq = await seqFiles[0].async('nodebuffer');
      const music: MusicFile = { type, seq, bankIdOot, bankIdMm, bankCustom, filename, name, games };
      this.musics.push(music);
    }
  }

  private async loadMusicsMmrs(files: JSZip.JSZipObject[]) {
    for (const f of files) {
      /* Get the music zip */
      const musicZipBuffer = await f.async('nodebuffer');
      let musicZip: JSZip;
      try {
        musicZip = await JSZip.loadAsync(musicZipBuffer);
      } catch (e) {
        this.monitor.warn(`Skipped music file ${f.name}: invalid zip file`);
        continue;
      }

      /* Look for custom bank data */
      const filesBank = musicZip.file(/\.z?bank$/);
      if (filesBank.length > 1) {
        this.monitor.warn(`Skipped music file ${f.name}: multiple bank files`);
        continue;
      }
      const filesBankmeta = musicZip.file(/\.z?bankmeta$/);
      if (filesBankmeta.length > 1) {
        this.monitor.warn(`Skipped music file ${f.name}: multiple bankmeta files`);
        continue;
      }

      if (filesBank.length !== filesBankmeta.length) {
        this.monitor.warn(`Skipped music file ${f.name}: bank and bankmeta mismatch`);
        continue;
      }

      const badFiles = musicZip.file(/\.z?sound$/);
      if (badFiles.length > 0) {
        this.monitor.warn(`Skipped music file ${f.name}: unsupported files found`);
        continue;
      }

      /* Find the zseq file */
      const zseqFiles = musicZip.file(/\.zseq$/);
      if (zseqFiles.length !== 1) {
        this.monitor.warn(`Skipped music file ${f.name}: multiple sequence files`);
        continue;
      }

      /* Get the categories.txt file */
      const categoriesTxt = musicZip.file('categories.txt');
      if (!categoriesTxt) {
        this.monitor.warn(`Skipped music file ${f.name}: categories.txt not found`);
        continue;
      }
      const categoriesData = await categoriesTxt.async('text');
      const categories = categoriesData.split(',').map(x => parseInt(x, 10));

      /* Extract the bank ID from the zseq filename */
      let zseqFilename = zseqFiles[0].name;
      if (zseqFilename.includes('/')) {
        zseqFilename = zseqFilename.split('/').pop()!;
      }
      const bankIdRaw = zseqFilename.split('.')[0];

      /* Add the music */
      const seq = await zseqFiles[0].async('nodebuffer');
      const games: Game[] = ['mm'];
      const type = [8, 9, 10].some(x => categories.includes(x)) ? 'fanfare' : 'bgm';
      const filename = f.name.split('/').pop()!;
      const name = saneName(filename.replace('.mmrs', ''));

      let bankCustom: { meta: Buffer, data: Buffer } | null = null;
      let bankIdOot: number | null = null;
      let bankIdMm: number | null = null;

      if (filesBank.length) {
        const bank = await filesBank[0].async('nodebuffer');
        const bankmeta = await filesBankmeta[0].async('nodebuffer');
        if (bankmeta.length !== 0x08) {
          this.monitor.warn(`Skipped music file ${f.name}: invalid bankmeta length`);
          continue;
        }
        const sampleBank1 = mmrSampleBank(bankmeta.readUInt8(0x02));
        const sampleBank2 = mmrSampleBank(bankmeta.readUInt8(0x03));
        const sampleBanks = Buffer.from([sampleBank1, sampleBank2]);
        sampleBanks.copy(bankmeta, 0x02);
        bankCustom = { meta: bankmeta, data: bank };
        games.push('oot');
      } else {
        bankIdMm = parseInt(bankIdRaw, 16);
        if (bankIdMm >= 2) {
          bankIdOot = bankIdMm + 0x30;
          games.push('oot');
        }
      }

      const music: MusicFile = { type, seq, bankIdOot, bankIdMm, bankCustom, filename, name, games };
      this.musics.push(music);
    }
  }

  private async loadMusics(data: Buffer) {
    const zip = await JSZip.loadAsync(data);
    await this.loadMusicsOotrs(zip.file(/\.ootrs$/));
    await this.loadMusicsMmrs(zip.file(/\.mmrs$/));
  }

  private appendAudio(seq: Buffer) {
    const vrom = this.builder.addFile({ game: 'custom', type: 'uncompressed', data: seq })!;
    return vrom;
  }

  private async injectMusicMeta(game: Game, slot: number, vrom: number, seqLength: number, bankId: number, name: string) {
    const fileSeqTable = this.builder.fileByNameRequired(`${game}/seq_table`);
    const fileSeqBanks = this.builder.fileByNameRequired(`${game}/seq_banks`);

    /* Patch the bank ID */
    const bankIdBuf = Buffer.alloc(1);
    bankIdBuf.writeUInt8(bankId);
    bankIdBuf.copy(fileSeqBanks.data, slot);

    /* Add the pointer */
    const seqTableData = toU32Buffer([vrom, seqLength]);
    seqTableData.copy(fileSeqTable.data, slot * 0x10);

    /* Register the name */
    this.registerName(game === 'mm' ? slot + 256 : slot, name);
  }

  private async injectMusic(slot: string, music: MusicFile) {
    const entry = MUSIC[slot];
    const vrom = this.appendAudio(music.seq);
    let customBankId: number | null = null;

    if (music.bankCustom) {
      customBankId = this.addCustomBank(music.bankCustom.meta, music.bankCustom.data);
    }

    for (const id of entry.oot || []) {
      await this.injectMusicMeta('oot', id, vrom, music.seq.length, customBankId || music.bankIdOot!, music.name);
    }

    for (const id of entry.mm || []) {
      await this.injectMusicMeta('mm', id, vrom, music.seq.length, customBankId || music.bankIdMm!, music.name);
    }
  }

  private patchOot() {
    /* Disable battle music */
    const filePlayerActor = this.builder.fileByNameRequired('oot/ovl_player_actor');
    const z = Buffer.alloc(1);
    z.writeUInt8(0);
    z.copy(filePlayerActor.data, 0x1690f);
  }

  private patchMm() {
    /* Disable battle music */
    const filePlayerActor = this.builder.fileByNameRequired('mm/ovl_player_actor');
    const z = Buffer.alloc(2);
    z.writeUInt16BE(0x1000);
    z.copy(filePlayerActor.data, 0x16818);
  }

  private async shuffleMusics() {
    const slots = shuffle(this.random, Object.keys(MUSIC));
    const musics = new Set(this.musics);

    this.writer.indent('Music');
    for (;;) {
      if (musics.size === 0 || slots.length === 0) {
        break;
      }

      const slot = slots.pop()!;
      let candidates = Array.from(musics).filter(x => isMusicSuitable(MUSIC[slot], x));
      if (this.isMaxBank()) {
        candidates = candidates.filter(x => x.bankCustom === null);
      }

      if (candidates.length === 0) {
        continue;
      }

      const music = sample(this.random, candidates);
      musics.delete(music);
      await this.injectMusic(slot, music);
      const entry = MUSIC[slot];
      this.writer.write(`${entry.name}: ${music.name} (${music.filename})`);

      /* DEBUG */
      if (music.bankCustom && music.games[0] === 'oot') {
        console.log(slot);
      }
    }
    this.writer.unindent();
  }

  async run() {
    /* Extract the list of musics */
    await this.loadMusics(this.musicZipData);

    /* Shuffle musics */
    await this.shuffleMusics();

    /* Run misc. patches */
    this.patchOot();
    this.patchMm();

    /* Inject the music names */
    this.builder.addFile({ game: 'custom', type: 'uncompressed', vaddr: 0xf1000000, data: this.namesBuffer });
  }
}

export async function randomizeMusic(writer: LogWriter, monitor: Monitor, builder: RomBuilder, random: Random, data: Buffer) {
  const injector = new MusicInjector(writer, monitor, builder, random, data);
  await injector.run();
}
