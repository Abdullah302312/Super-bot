const { makeWASocket, useMultiFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys')
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" })
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const sock = makeWASocket({ auth: state, printQRInTerminal: true })
  sock.ev.on('messages.upsert', async ({messages})=>{
    const msg=messages[0]; if(!msg) return
    const jid=msg.key.remoteJid
    let userText=msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || ""
    try{
      let imageBase64=null
      if(msg.message?.imageMessage){
        const buffer=await downloadMediaMessage(msg,'buffer',{})
        imageBase64=buffer.toString('base64')
      }
      const content=imageBase64? [{type:"text",text:userText||"Is photo ko detail me batao"},{type:"image_url",image_url:{url:`data:image/jpeg;base64,${imageBase64}`}}]:userText
      if(!content || content=="") return
      const res=await openai.chat.completions.create({model:"llama-3.2-11b-vision-preview",messages:[{role:"system",content:"Tu WhatsApp Super AI hai, Urdu me jawab de"},{role:"user",content:content}]})
      await sock.sendMessage(jid,{text:res.choices[0].message.content})
    }catch(e){console.log(e)}
  })
  sock.ev.on('creds.update',saveCreds)
}
start()
