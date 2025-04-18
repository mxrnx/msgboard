import ejs from 'ejs'
import fs from 'fs'
import path from 'path'
import { openDb } from "./db";

const templateDir = path.join(__dirname, '../views')
const publicDir = path.join(__dirname, '../public')

export async function generatePages(callback?: () => void) {
    const db = await openDb();
    const posts = await db.all('SELECT * FROM posts ORDER BY timestamp ASC')
    const threads = posts.filter(p => p.type === 'thread')
    const replies = posts.filter(p => p.type === 'reply')

    const threadMap = threads.map(thread => {
        const children = replies.filter(r => r.reply_to === thread.id).slice(-2)
        return { ...thread, replies: children }
    })

    render('index.ejs', { threads: threadMap }, 'index.html')

    for (const thread of threads) {
        const children = replies.filter(r => r.reply_to === thread.id)
        render('thread.ejs', { thread, replies: children }, `${thread.id}.html`)
    }

    if (callback) callback()
}

function render(template: string, data: any, outFile: string) {
    const filePath = path.join(templateDir, template)
    const layoutPath = path.join(templateDir, 'layout.ejs')
    const content = fs.readFileSync(filePath, 'utf8')
    const body = ejs.render(content, data, { filename: filePath })
    const html = ejs.render(fs.readFileSync(layoutPath, 'utf8'), { title: 'Forum Romanum', body })
    fs.writeFileSync(path.join(publicDir, outFile), html)
}
