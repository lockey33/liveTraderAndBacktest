const axios = require('axios');
const fs = require('fs');
const path = require('path');
const appDir = path.resolve('./');

const launch = async () => {
  const exchangeInfos = await axios.get('http://localhost:3000/v1/exchange/exchangeinfos')
  //let rankedTokens = await axios.get('http://localhost:3000/v1/exchange/rankedtokens')
  let actualCoins = await axios.get('http://localhost:3000/v1/exchange/getActualCoins')
  actualCoins = actualCoins.data
  //rankedTokens = rankedTokens.data.result
  //rankedTokens = rankedTokens.slice(0,100)
  let rankedTokens =
    [
      {pair: 'BTCUSDT', asset1: 'BTC', asset2: 'USDT'},
      {pair: 'ETHUSDT', asset1: 'ETH', asset2: 'USDT'},
      {pair: 'BNBUSDT', asset1: 'BNB', asset2: 'USDT'},
      {pair: 'ADAUSDT', asset1: 'ADA', asset2: 'USDT'},
      {pair: 'XRPUSDT', asset1: 'XRP', asset2: 'USDT'},
      {pair: 'SOLUSDT', asset1: 'SOL', asset2: 'USDT'},
      {pair: 'DOTUSDT', asset1: 'DOT', asset2: 'USDT'},
      {pair: 'DOGEUSDT', asset1: 'DOGE', asset2: 'USDT'},
      {pair: 'LUNAUSDT', asset1: 'LUNA', asset2: 'USDT'},
      {pair: 'UNIUSDT', asset1: 'UNI', asset2: 'USDT'},
      {pair: 'AVAXUSDT', asset1: 'AVAX', asset2: 'USDT'},
      {pair: 'LTCUSDT', asset1: 'LTC', asset2: 'USDT'},
      {pair: 'LINKUSDT', asset1: 'LINK', asset2: 'USDT'},
      {pair: 'SHIBUSDT', asset1: 'SHIB', asset2: 'USDT'},
      {pair: 'BCHUSDT', asset1: 'BCH', asset2: 'USDT'},
      {pair: 'ALGOUSDT', asset1: 'ALGO', asset2: 'USDT'},
      {pair: 'MATICUSDT', asset1: 'MATIC', asset2: 'USDT'},
      {pair: 'XLMUSDT', asset1: 'XLM', asset2: 'USDT'},
      {pair: 'FILUSDT', asset1: 'FIL', asset2: 'USDT'},
      {pair: 'ATOMUSDT', asset1: 'ATOM', asset2: 'USDT'},
      {pair: 'AXSUSDT', asset1: 'AXS', asset2: 'USDT'},
      {pair: 'ICPUSDT', asset1: 'ICP', asset2: 'USDT'},
      {pair: 'ETCUSDT', asset1: 'ETC', asset2: 'USDT'},
      {pair: 'VETUSDT', asset1: 'VET', asset2: 'USDT'},
      {pair: 'TRXUSDT', asset1: 'TRX', asset2: 'USDT'},
      {pair: 'FTTUSDT', asset1: 'FTT', asset2: 'USDT'},
      {pair: 'XTZUSDT', asset1: 'XTZ', asset2: 'USDT'},
      {pair: 'THETAUSDT', asset1: 'THETA', asset2: 'USDT'},
      {pair: 'FTMUSDT', asset1: 'FTM', asset2: 'USDT'},
      {pair: 'HBARUSDT', asset1: 'HBAR', asset2: 'USDT'},
      {pair: 'XMRUSDT', asset1: 'XMR', asset2: 'USDT'},
      {pair: 'EGLDUSDT', asset1: 'EGLD', asset2: 'USDT'},
      {pair: 'CAKEUSDT', asset1: 'CAKE', asset2: 'USDT'},
      {pair: 'EOSUSDT', asset1: 'EOS', asset2: 'USDT'},
      {pair: 'XECUSDT', asset1: 'XEC', asset2: 'USDT'},
      {pair: 'KLAYUSDT', asset1: 'KLAY', asset2: 'USDT'},
      {pair: 'AAVEUSDT', asset1: 'AAVE', asset2: 'USDT'},
      {pair: 'NEARUSDT', asset1: 'NEAR', asset2: 'USDT'},
      {pair: 'QNTUSDT', asset1: 'QNT', asset2: 'USDT'},
      {pair: 'WAVESUSDT', asset1: 'WAVES', asset2: 'USDT'},
      {pair: 'GRTUSDT', asset1: 'GRT', asset2: 'USDT'},
      {pair: 'NEOUSDT', asset1: 'NEO', asset2: 'USDT'},
      {pair: 'KSMUSDT', asset1: 'KSM', asset2: 'USDT'},
      {pair: 'STXUSDT', asset1: 'STX', asset2: 'USDT'},
      {pair: 'BTTUSDT', asset1: 'BTT', asset2: 'USDT'},
      {pair: 'MKRUSDT', asset1: 'MKR', asset2: 'USDT'},
      {pair: 'ONEUSDT', asset1: 'ONE', asset2: 'USDT'},
      {pair: 'OMGUSDT', asset1: 'OMG', asset2: 'USDT'},
      {pair: 'HNTUSDT', asset1: 'HNT', asset2: 'USDT'},
      {pair: 'DASHUSDT', asset1: 'DASH', asset2: 'USDT'},
      {pair: 'ARUSDT', asset1: 'AR', asset2: 'USDT'},
      {pair: 'CHZUSDT', asset1: 'CHZ', asset2: 'USDT'},
      {pair: 'CELOUSDT', asset1: 'CELO', asset2: 'USDT'},
      {pair: 'COMPUSDT', asset1: 'COMP', asset2: 'USDT'},
      {pair: 'DCRUSDT', asset1: 'DCR', asset2: 'USDT'},
      {pair: 'RUNEUSDT', asset1: 'RUNE', asset2: 'USDT'},
      {pair: 'HOTUSDT', asset1: 'HOT', asset2: 'USDT'},
      {pair: 'XEMUSDT', asset1: 'XEM', asset2: 'USDT'},
      {pair: 'TFUELUSDT', asset1: 'TFUEL', asset2: 'USDT'},
      {pair: 'ZECUSDT', asset1: 'ZEC', asset2: 'USDT'},
      {pair: 'ICXUSDT', asset1: 'ICX', asset2: 'USDT'},
      {pair: 'MANAUSDT', asset1: 'MANA', asset2: 'USDT'},
      {pair: 'QTUMUSDT', asset1: 'QTUM', asset2: 'USDT'},
      {pair: 'SUSHIUSDT', asset1: 'SUSHI', asset2: 'USDT'},
      {pair: 'ENJUSDT', asset1: 'ENJ', asset2: 'USDT'},
      {pair: 'YFIUSDT', asset1: 'YFI', asset2: 'USDT'},
      {pair: 'BTGUSDT', asset1: 'BTG', asset2: 'USDT'},
      {pair: 'DYDXUSDT', asset1: 'DYDX', asset2: 'USDT'},
      {pair: 'CRVUSDT', asset1: 'CRV', asset2: 'USDT'},
      {pair: 'MDXUSDT', asset1: 'MDX', asset2: 'USDT'},
      {pair: 'FLOWUSDT', asset1: 'FLOW', asset2: 'USDT'},
      {pair: 'MINAUSDT', asset1: 'MINA', asset2: 'USDT'},
      {pair: 'ZILUSDT', asset1: 'ZIL', asset2: 'USDT'},
      {pair: 'SNXUSDT', asset1: 'SNX', asset2: 'USDT'},
      {pair: 'PERPUSDT', asset1: 'PERP', asset2: 'USDT'},
      {pair: 'RVNUSDT', asset1: 'RVN', asset2: 'USDT'},
      {pair: 'BATUSDT', asset1: 'BAT', asset2: 'USDT'},
      {pair: 'RENUSDT', asset1: 'REN', asset2: 'USDT'},
      {pair: 'SRMUSDT', asset1: 'SRM', asset2: 'USDT'},
      {pair: 'IOSTUSDT', asset1: 'IOST', asset2: 'USDT'},
      {pair: 'SCUSDT', asset1: 'SC', asset2: 'USDT'},
      {pair: 'BNTUSDT', asset1: 'BNT', asset2: 'USDT'},
      {pair: 'CELRUSDT', asset1: 'CELR', asset2: 'USDT'},
      {pair: 'ZRXUSDT', asset1: 'ZRX', asset2: 'USDT'},
      {pair: 'ZENUSDT', asset1: 'ZEN', asset2: 'USDT'},
      {pair: 'ONTUSDT', asset1: 'ONT', asset2: 'USDT'},
      {pair: 'AUDIOUSDT', asset1: 'AUDIO', asset2: 'USDT'},
      {pair: 'DGBUSDT', asset1: 'DGB', asset2: 'USDT'},
      {pair: 'NANOUSDT', asset1: 'NANO', asset2: 'USDT'},
      {pair: 'RAYUSDT', asset1: 'RAY', asset2: 'USDT'},
      {pair: 'ANKRUSDT', asset1: 'ANKR', asset2: 'USDT'},
      {pair: 'IOTXUSDT', asset1: 'IOTX', asset2: 'USDT'},
      {pair: 'SANDUSDT', asset1: 'SAND', asset2: 'USDT'},
      {pair: 'SKLUSDT', asset1: 'SKL', asset2: 'USDT'},
      {pair: 'UMAUSDT', asset1: 'UMA', asset2: 'USDT'},
      {pair: 'BAKEUSDT', asset1: 'BAKE', asset2: 'USDT'},
      {pair: 'FETUSDT', asset1: 'FET', asset2: 'USDT'},
      {pair: 'KAVAUSDT', asset1: 'KAVA', asset2: 'USDT'},
      {pair: 'DENTUSDT', asset1: 'DENT', asset2: 'USDT'},
      {pair: '1INCHUSDT', asset1: '1INCH', asset2: 'USDT'},
      {pair: 'WAXPUSDT', asset1: 'WAXP', asset2: 'USDT'},
      {pair: 'BTCSTUSDT', asset1: 'BTCST', asset2: 'USDT'},
      {pair: 'LRCUSDT', asset1: 'LRC', asset2: 'USDT'},
      {pair: 'OCEANUSDT', asset1: 'OCEAN', asset2: 'USDT'},
      {pair: 'STORJUSDT', asset1: 'STORJ', asset2: 'USDT'},
      {pair: 'GNOUSDT', asset1: 'GNO', asset2: 'USDT'},
      {pair: 'POLYUSDT', asset1: 'POLY', asset2: 'USDT'},
      {pair: 'NMRUSDT', asset1: 'NMR', asset2: 'USDT'},
      {pair: 'COTIUSDT', asset1: 'COTI', asset2: 'USDT'},
      {pair: 'SXPUSDT', asset1: 'SXP', asset2: 'USDT'},
      {pair: 'ALPHAUSDT', asset1: 'ALPHA', asset2: 'USDT'},
      {pair: 'CKBUSDT', asset1: 'CKB', asset2: 'USDT'},
      {pair: 'LSKUSDT', asset1: 'LSK', asset2: 'USDT'},
      {pair: 'WINUSDT', asset1: 'WIN', asset2: 'USDT'},
      {pair: 'XVGUSDT', asset1: 'XVG', asset2: 'USDT'},
      {pair: 'WRXUSDT', asset1: 'WRX', asset2: 'USDT'},
      {pair: 'VTHOUSDT', asset1: 'VTHO', asset2: 'USDT'},
      {pair: 'LPTUSDT', asset1: 'LPT', asset2: 'USDT'},
      {pair: 'ELFUSDT', asset1: 'ELF', asset2: 'USDT'},
      {pair: 'INJUSDT', asset1: 'INJ', asset2: 'USDT'},
      {pair: 'BADGERUSDT', asset1: 'BADGER', asset2: 'USDT'},
      {pair: 'CFXUSDT', asset1: 'CFX', asset2: 'USDT'},
      {pair: 'ARDRUSDT', asset1: 'ARDR', asset2: 'USDT'},
      {pair: 'CVCUSDT', asset1: 'CVC', asset2: 'USDT'},
      {pair: 'PAXGUSDT', asset1: 'PAXG', asset2: 'USDT'},
      {pair: 'XVSUSDT', asset1: 'XVS', asset2: 'USDT'},
      {pair: 'STMXUSDT', asset1: 'STMX', asset2: 'USDT'},
      {pair: 'RLCUSDT', asset1: 'RLC', asset2: 'USDT'},
      {pair: 'ONGUSDT', asset1: 'ONG', asset2: 'USDT'},
      {pair: 'REEFUSDT', asset1: 'REEF', asset2: 'USDT'},
      {pair: 'HIVEUSDT', asset1: 'HIVE', asset2: 'USDT'},
      {pair: 'ROSEUSDT', asset1: 'ROSE', asset2: 'USDT'},
      {pair: 'STRAXUSDT', asset1: 'STRAX', asset2: 'USDT'},
      {pair: 'OGNUSDT', asset1: 'OGN', asset2: 'USDT'},
      {pair: 'BANDUSDT', asset1: 'BAND', asset2: 'USDT'},
      {pair: 'ALICEUSDT', asset1: 'ALICE', asset2: 'USDT'},
      {pair: 'REPUSDT', asset1: 'REP', asset2: 'USDT'},
      {pair: 'NKNUSDT', asset1: 'NKN', asset2: 'USDT'},
      {pair: 'REQUSDT', asset1: 'REQ', asset2: 'USDT'},
      {pair: 'CTSIUSDT', asset1: 'CTSI', asset2: 'USDT'},
      {pair: 'MLNUSDT', asset1: 'MLN', asset2: 'USDT'},
      {pair: 'OXTUSDT', asset1: 'OXT', asset2: 'USDT'},
      {pair: 'MTLUSDT', asset1: 'MTL', asset2: 'USDT'},
      {pair: 'FUNUSDT', asset1: 'FUN', asset2: 'USDT'},
      {pair: 'C98USDT', asset1: 'C98', asset2: 'USDT'},
      {pair: 'GALAUSDT', asset1: 'GALA', asset2: 'USDT'},
      {pair: 'YGGUSDT', asset1: 'YGG', asset2: 'USDT'},
      {pair: 'PUNDIXUSDT', asset1: 'PUNDIX', asset2: 'USDT'},
      {pair: 'ILVUSDT', asset1: 'ILV', asset2: 'USDT'},
      {pair: 'TWTUSDT', asset1: 'TWT', asset2: 'USDT'},
      {pair: 'MBOXUSDT', asset1: 'MBOX', asset2: 'USDT'},
      {pair: 'KNCUSDT', asset1: 'KNC', asset2: 'USDT'},
      {pair: 'RADUSDT', asset1: 'RAD', asset2: 'USDT'},
      {pair: 'FIDAUSDT', asset1: 'FIDA', asset2: 'USDT'},
      {pair: 'MASKUSDT', asset1: 'MASK', asset2: 'USDT'},
      {pair: 'AGLDUSDT', asset1: 'AGLD', asset2: 'USDT'},
      {pair: 'RAREUSDT', asset1: 'RARE', asset2: 'USDT'},
      {pair: 'KEEPUSDT', asset1: 'KEEP', asset2: 'USDT'},
      {pair: 'ORNUSDT', asset1: 'ORN', asset2: 'USDT'},
      {pair: 'MIRUSDT', asset1: 'MIR', asset2: 'USDT'},
      {pair: 'EPSUSDT', asset1: 'EPS', asset2: 'USDT'},
      {pair: 'PHAUSDT', asset1: 'PHA', asset2: 'USDT'},
      {pair: 'RIFUSDT', asset1: 'RIF', asset2: 'USDT'},
      {pair: 'LINAUSDT', asset1: 'LINA', asset2: 'USDT'},
      {pair: 'TKOUSDT', asset1: 'TKO', asset2: 'USDT'},
      {pair: 'NUUSDT', asset1: 'NU', asset2: 'USDT'},
      {pair: 'TOMOUSDT', asset1: 'TOMO', asset2: 'USDT'},
      {pair: 'IDEXUSDT', asset1: 'IDEX', asset2: 'USDT'},
      {pair: 'ANTUSDT', asset1: 'ANT', asset2: 'USDT'},
      {pair: 'WANUSDT', asset1: 'WAN', asset2: 'USDT'},
      {pair: 'JSTUSDT', asset1: 'JST', asset2: 'USDT'},
      {pair: 'TLMUSDT', asset1: 'TLM', asset2: 'USDT'},
      {pair: 'SYSUSDT', asset1: 'SYS', asset2: 'USDT'},
      {pair: 'UTKUSDT', asset1: 'UTK', asset2: 'USDT'},
      {pair: 'POLSUSDT', asset1: 'POLS', asset2: 'USDT'},
      {pair: 'STPTUSDT', asset1: 'STPT', asset2: 'USDT'},
      {pair: 'ATAUSDT', asset1: 'ATA', asset2: 'USDT'},
      {pair: 'TROYUSDT', asset1: 'TROY', asset2: 'USDT'},
      {pair: 'SLPUSDT', asset1: 'SLP', asset2: 'USDT'},
      {pair: 'YFIIUSDT', asset1: 'YFII', asset2: 'USDT'},
      {pair: 'CLVUSDT', asset1: 'CLV', asset2: 'USDT'},
      {pair: 'AVAUSDT', asset1: 'AVA', asset2: 'USDT'},
      {pair: 'DODOUSDT', asset1: 'DODO', asset2: 'USDT'},
      {pair: 'BALUSDT', asset1: 'BAL', asset2: 'USDT'},
      {pair: 'CHRUSDT', asset1: 'CHR', asset2: 'USDT'},
      {pair: 'SUNUSDT', asset1: 'SUN', asset2: 'USDT'},
      {pair: 'ALPACAUSDT', asset1: 'ALPACA', asset2: 'USDT'},
      {pair: 'BTSUSDT', asset1: 'BTS', asset2: 'USDT'},
      {pair: 'KMDUSDT', asset1: 'KMD', asset2: 'USDT'},
      {pair: 'QUICKUSDT', asset1: 'QUICK', asset2: 'USDT'},
      {pair: 'ERNUSDT', asset1: 'ERN', asset2: 'USDT'},
      {pair: 'MFTUSDT', asset1: 'MFT', asset2: 'USDT'},
      {pair: 'IRISUSDT', asset1: 'IRIS', asset2: 'USDT'},
      {pair: 'FORTHUSDT', asset1: 'FORTH', asset2: 'USDT'},
      {pair: 'SFPUSDT', asset1: 'SFP', asset2: 'USDT'},
      {pair: 'DATAUSDT', asset1: 'DATA', asset2: 'USDT'},
      {pair: 'RAMPUSDT', asset1: 'RAMP', asset2: 'USDT'},
      {pair: 'BONDUSDT', asset1: 'BOND', asset2: 'USDT'},
      {pair: 'TVKUSDT', asset1: 'TVK', asset2: 'USDT'},
      {pair: 'ARPAUSDT', asset1: 'ARPA', asset2: 'USDT'},
      {pair: 'FARMUSDT', asset1: 'FARM', asset2: 'USDT'},
      {pair: 'CTKUSDT', asset1: 'CTK', asset2: 'USDT'},
      {pair: 'GTCUSDT', asset1: 'GTC', asset2: 'USDT'},
      {pair: 'LITUSDT', asset1: 'LIT', asset2: 'USDT'},
      {pair: 'FIROUSDT', asset1: 'FIRO', asset2: 'USDT'},
      {pair: 'GHSTUSDT', asset1: 'GHST', asset2: 'USDT'},
      {pair: 'WNXMUSDT', asset1: 'WNXM', asset2: 'USDT'},
      {pair: 'TRBUSDT', asset1: 'TRB', asset2: 'USDT'},
      {pair: 'DNTUSDT', asset1: 'DNT', asset2: 'USDT'},
      {pair: 'BELUSDT', asset1: 'BEL', asset2: 'USDT'},
      {pair: 'BZRXUSDT', asset1: 'BZRX', asset2: 'USDT'},
      {pair: 'AKROUSDT', asset1: 'AKRO', asset2: 'USDT'},
      {pair: 'FRONTUSDT', asset1: 'FRONT', asset2: 'USDT'},
      {pair: 'AIONUSDT', asset1: 'AION', asset2: 'USDT'},
      {pair: 'LTOUSDT', asset1: 'LTO', asset2: 'USDT'},
      {pair: 'COSUSDT', asset1: 'COS', asset2: 'USDT'},
      {pair: 'OMUSDT', asset1: 'OM', asset2: 'USDT'},
      {pair: 'PSGUSDT', asset1: 'PSG', asset2: 'USDT'},
      {pair: 'BURGERUSDT', asset1: 'BURGER', asset2: 'USDT'},
      {pair: 'WTCUSDT', asset1: 'WTC', asset2: 'USDT'},
      {pair: 'BEAMUSDT', asset1: 'BEAM', asset2: 'USDT'},
      {pair: 'HARDUSDT', asset1: 'HARD', asset2: 'USDT'},
      {pair: 'DIAUSDT', asset1: 'DIA', asset2: 'USDT'},
      {pair: 'BLZUSDT', asset1: 'BLZ', asset2: 'USDT'},
      {pair: 'CVPUSDT', asset1: 'CVP', asset2: 'USDT'},
      {pair: 'TORNUSDT', asset1: 'TORN', asset2: 'USDT'},
      {pair: 'FLMUSDT', asset1: 'FLM', asset2: 'USDT'},
      {pair: 'PONDUSDT', asset1: 'POND', asset2: 'USDT'},
      {pair: 'MBLUSDT', asset1: 'MBL', asset2: 'USDT'},
      {pair: 'FIOUSDT', asset1: 'FIO', asset2: 'USDT'},
      {pair: 'DEGOUSDT', asset1: 'DEGO', asset2: 'USDT'},
      {pair: 'BARUSDT', asset1: 'BAR', asset2: 'USDT'},
      {pair: 'TRUUSDT', asset1: 'TRU', asset2: 'USDT'},
      {pair: 'DOCKUSDT', asset1: 'DOCK', asset2: 'USDT'},
      {pair: 'DUSKUSDT', asset1: 'DUSK', asset2: 'USDT'},
      {pair: 'AUTOUSDT', asset1: 'AUTO', asset2: 'USDT'},
      {pair: 'NULSUSDT', asset1: 'NULS', asset2: 'USDT'},
      {pair: 'FORUSDT', asset1: 'FOR', asset2: 'USDT'},
      {pair: 'VIDTUSDT', asset1: 'VIDT', asset2: 'USDT'},
      {pair: 'MITHUSDT', asset1: 'MITH', asset2: 'USDT'},
      {pair: 'UNFIUSDT', asset1: 'UNFI', asset2: 'USDT'},
      {pair: 'KEYUSDT', asset1: 'KEY', asset2: 'USDT'},
      {pair: 'DEXEUSDT', asset1: 'DEXE', asset2: 'USDT'},
      {pair: 'PERLUSDT', asset1: 'PERL', asset2: 'USDT'},
      {pair: 'VITEUSDT', asset1: 'VITE', asset2: 'USDT'},
      {pair: 'CTXCUSDT', asset1: 'CTXC', asset2: 'USDT'},
      {pair: 'WINGUSDT', asset1: 'WING', asset2: 'USDT'},
      {pair: 'PNTUSDT', asset1: 'PNT', asset2: 'USDT'},
      {pair: 'ATMUSDT', asset1: 'ATM', asset2: 'USDT'},
      {pair: 'GTOUSDT', asset1: 'GTO', asset2: 'USDT'},
      {pair: 'ACMUSDT', asset1: 'ACM', asset2: 'USDT'},
      {pair: 'MDTUSDT', asset1: 'MDT', asset2: 'USDT'},
      {pair: 'COCOSUSDT', asset1: 'COCOS', asset2: 'USDT'},
      {pair: 'DREPUSDT', asset1: 'DREP', asset2: 'USDT'},
      {pair: 'TCTUSDT', asset1: 'TCT', asset2: 'USDT'},
      {pair: 'DFUSDT', asset1: 'DF', asset2: 'USDT'},
      {pair: 'JUVUSDT', asset1: 'JUV', asset2: 'USDT'},
      {pair: 'FISUSDT', asset1: 'FIS', asset2: 'USDT'},
      {pair: 'ONEUSDT', asset1: 'ONE', asset2: 'USDT'},
      {pair: 'ASRUSDT', asset1: 'ASR', asset2: 'USDT'},
      {pair: 'BONDUSDT', asset1: 'BOND', asset2: 'USDT'},
      {pair: 'OGUSDT', asset1: 'OG', asset2: 'USDT'},
      {pair: 'HOTUSDT', asset1: 'HOT', asset2: 'USDT'},
      {pair: 'RUNEUSDT', asset1: 'RUNE', asset2: 'USDT'},
      {pair: 'MIRUSDT', asset1: 'MIR', asset2: 'USDT'},
      {pair: 'GTCUSDT', asset1: 'GTC', asset2: 'USDT'},
      {pair: 'ONGUSDT', asset1: 'ONG', asset2: 'USDT'},
      {pair: 'MASKUSDT', asset1: 'MASK', asset2: 'USDT'},
      {pair: 'PNTUSDT', asset1: 'PNT', asset2: 'USDT'},
      {pair: 'ACMUSDT', asset1: 'ACM', asset2: 'USDT'},
      {pair: 'STXUSDT', asset1: 'STX', asset2: 'USDT'},
      {pair: 'LITUSDT', asset1: 'LIT', asset2: 'USDT'},
      {pair: 'FORUSDT', asset1: 'FOR', asset2: 'USDT'},
      {pair: 'UNIUSDT', asset1: 'UNI', asset2: 'USDT'},
      {pair: 'LUNAUSDT', asset1: 'LUNA', asset2: 'USDT'},
      {pair: 'COMPUSDT', asset1: 'COMP', asset2: 'USDT'},
      {pair: 'BETAUSDT', asset1: 'BETA', asset2: 'USDT'},
      {pair: 'TRUUSDT', asset1: 'TRU', asset2: 'USDT'},
      {pair: 'GRTUSDT', asset1: 'GRT', asset2: 'USDT'},
      {pair: 'NBSUSDT', asset1: 'NBS', asset2: 'USDT'},
      {pair: 'RUNEUSDT', asset1: 'RUNE', asset2: 'USDT'},
      {pair: 'BETAUSDT', asset1: 'BETA', asset2: 'USDT'},
      {pair: 'EPSUSDT', asset1: 'EPS', asset2: 'USDT'},
      {pair: 'TCTUSDT', asset1: 'TCT', asset2: 'USDT'},
      {pair: 'CVCUSDT', asset1: 'CVC', asset2: 'USDT'}
    ]
  const blackList = ["PERPUSDT", "RAREUSDT", "REQUSDT", "UMAUSDT", "SUSHIUSDT", "XECUSDT", "XEMUSDT", "FLOWUSDT", "BTCSTUSDT", "SHIBUSDT"]
  const customInterval = "5m_1m";

  for(const actualCoin of actualCoins){
    let found = false

    rankedTokens.map((coin, index) => {
      if(coin.pair === actualCoin.pair){
        found = true
      }
      if(blackList.includes(coin.pair)){
        rankedTokens.splice(index, 1)
      }
    })
    if(!found){
      rankedTokens.push(actualCoin)
    }
  }


  for (const token of rankedTokens) {
    const params = {
      interval: '5m_1m',
      limit: '1000',
      realTrading: "0",
      signals: '1',
      formatIndex: '1',
      asset1: token.asset1,
      asset2: token.asset2,
      strategy: 'multiIntervalStrategy',
      spacing: "20",
      oneOrderSignalPassed : "1",
      waitForClose: "1"
    }

    if(token.asset1 === "BTC" || token.asset1 === "ETH"){
      params.interval = customInterval
    }

    const liveSignal = await axios.post('http://localhost:3000/v1/exchange/pair/sockettrading', params)
  }
}


launch().then(() => {
    console.log("launched");

  });

