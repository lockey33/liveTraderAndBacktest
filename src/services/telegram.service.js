const TelegramBot = require('node-telegram-bot-api');
const token = '1953175315:AAEDM5VqLEgr3MtLj89qumSZDYWYgv49jo8';
const chatId= '1779029544';
const bot = new TelegramBot(token, {polling: true});

const sendMessage = async (message) =>{
  console.log('sendMessage')
  try{
    await bot.sendMessage(chatId, message);
  }catch(err){
    console.log(err)
  }
}


module.exports = {
  sendMessage,
}
