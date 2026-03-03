const fs = require('fs');
const cp = require('child_process');

// 1. Reset kanjiData.json
try {
    cp.execSync('git checkout HEAD -- src/data/kanjiData.json');
    console.log('Restored kanjiData.json from HEAD.');
} catch (e) {
    console.error('Failed to restore kanjiData.json', e.message);
}

// 2. Get files to run
const files = fs.readdirSync('.').filter(f => f.endsWith('.cjs'));

const scripts = files
    .map(f => ({ f, t: fs.statSync(f).mtime.getTime() }))
    // Filter only previous agent scripts
    .filter(obj => obj.t < 1772465500000)
    // Sort by time
    .sort((a, b) => a.t - b.t)
    // Get filenames
    .map(obj => obj.f)
    // Filter out pure diagnostic scripts to save time
    .filter(f => !f.startsWith('audit') && !f.startsWith('check') && !f.startsWith('get') && !f.startsWith('detect') && !f.startsWith('test') && !f.startsWith('align'));

console.log(`Found ${scripts.length} mutating scripts from the previous agent.`);

// 3. Execute sequentially
for (const script of scripts) {
    console.log(`[Replaying] node ${script} ...`);
    try {
        cp.execSync(`node ${script}`, { stdio: 'ignore' });
    } catch (e) {
        console.log(` -> Script ${script} returned non-zero. Continuing anyway.`);
    }
}

console.log('--- REPLAY COMPLETE ---');
console.log('Running final audit...');
try {
    const auditRes = cp.execSync('node audit_script.cjs').toString();
    console.log(auditRes);
} catch (e) {
    console.log('Audit failed to run.');
}
