import fs from 'fs';
import https from 'https';
import path from 'path';

// Rust is actually rust/rust-original.svg now or plain, let's just make sure we hit the right one.
// C# is csharp/csharp-original.svg usually.
// We can use a stable GitHub raw link for those that fail jsdelivr restrictions.
const deviconMap = {
    py: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg',
    js: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg',
    ts: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg',
    java: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg',
    cpp: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg',
    go: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg',
    rs: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-original.svg',
    cs: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/csharp/csharp-original.svg',
    kt: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/kotlin/kotlin-original.svg',
    swift: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/swift/swift-original.svg',
    rb: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/ruby/ruby-original.svg',
};

const dlDir = path.join(process.cwd(), 'src', 'assets', 'icons');
if (!fs.existsSync(dlDir)) {
    fs.mkdirSync(dlDir, { recursive: true });
}

async function download(lang, url) {
    const dest = path.join(dlDir, `${lang}.svg`);
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

(async () => {
    console.log("Downloading icons from GitHub Raw...");
    for (const [lang, url] of Object.entries(deviconMap)) {
        try {
            await download(lang, url);
            console.log(`Downloaded ${lang}.svg`);
        } catch (e) {
            console.error(e.message);
            // Fallback for rust if original doesn't exist
            if (lang === 'rs') {
               try {
                   console.log("Trying rust fallback...");
                   await download(lang, 'https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-plain.svg');
                   console.log(`Downloaded ${lang}.svg (fallback)`);
               } catch(e2) {
                   console.error("Fallback failed:", e2.message);
               }
            }
        }
    }
    console.log("Done.");
})();
