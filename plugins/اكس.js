// plugins/xo.js
import TicTacToe from '../lib/tictactoe.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // تأكد من وجود مساحة لتخزين الألعاب
    if (!conn.game) conn.game = {}

    // تحقق إذا اللاعب بالفعل في لعبة
    if (Object.values(conn.game).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender))) 
        throw `❏ انت ما زلت في الجيم, لحذف الجيم اكتب: *${usedPrefix}حذففف*`

    if (!text) throw `✳️ ضع رقم الغرفة`

    // ابحث عن غرفة انتظار بنفس الاسم (إذا تم توفير text)
    let room = Object.values(conn.game).find(room => room.state === 'WAITING' && (text ? room.name === text : true))

    if (room) {
        // تم العثور على شريك
        m.reply('*تم إيجاد الشخص الآخر*')
        room.o = m.chat
        room.game.playerO = m.sender
        room.state = 'PLAYING'

        // عرض اللوحة
        let arr = room.game.render().map(v => {
            return {
                X: '❎',
                O: '⭕',
                1: '1️⃣',
                2: '2️⃣',
                3: '3️⃣',
                4: '4️⃣',
                5: '5️⃣',
                6: '6️⃣',
                7: '7️⃣',
                8: '8️⃣',
                9: '9️⃣',
            }[v]
        })
        let str = `
انتظر @${room.game.currentTurn.split('@')[0]} هو اللاعب الأول

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

▢ *Room ID:* ${room.id}

❏ *القوانين*
‣ اصنع 3 صفوف من الرموز عموديا، أفقيا أو منقطًا للفوز
‣ اكتب *surrender* للانسحاب
`.trim()

        // إرسال الرسالة لكل اللاعبين
        if (room.x !== room.o) await conn.reply(room.x, str, m, { mentions: conn.parseMention(str) })
        await conn.reply(room.o, str, m, { mentions: conn.parseMention(str) })

    } else {
        // إنشاء غرفة جديدة
        room = {
            id: 'tictactoe-' + (+new Date),
            x: m.chat,
            o: '',
            game: new TicTacToe(m.sender, 'o'),
            state: 'WAITING'
        }
        if (text) room.name = text

        conn.reply(m.chat, `❏ *توقع الشريك*\nاكتب الامر التالي للدخول في نفس الغرفة:
❏ *${usedPrefix + command} ${text}*

❏ *الجائزة: 4999 XP*`, m)

        
        conn.game[room.id] = room
    }
}

handler.help = ['tictactoe <room number>']
handler.tags = ['game']
handler.command = ['tictactoe', 'ttc', 'xo', 'اكس']

export default handler
