const fs = require("fs");
const readline = require("readline");

let compacted = false;

class LightDB {
    constructor(filePath = "storage.jsonl", options = {}) {
        this.filePath = filePath;
        this.index = new Map();
        this.debug = options.debug || false;

        this.setupExitHandlers();
    }

    setupExitHandlers() {
        const onExit = async () => {
            if (compacted) return;
            compacted = true;
            this.debug && console.log("[LightDB] Compacting before exit...");
            await this.compact().catch(err => {
                console.warn("[LightDB] Compact error:", err.message);
            });
        };

        process.once("SIGINT", async () => {
            await onExit();
            process.exit(0);
        });

        process.once("SIGTERM", async () => {
            await onExit();
            process.exit(0);
        });

        process.once("beforeExit", onExit);
    }

    exists(key) {
        return this.index.has(key);
    }

    async init() {
        this.index.clear();

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "");
        }

        const fileStream = fs.createReadStream(this.filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let byteOffset = 0;

        for await (const line of rl) {
            try {
                const value = JSON.parse(line);
                if (value.key && !value._deleted) {
                    this.index.set(value.key, byteOffset);
                } else if (value.key && value._deleted) {
                    this.index.delete(value.key);
                }
            } catch (e) {
                if (this.debug) console.warn("Baris rusak:", line);
            }

            byteOffset += Buffer.byteLength(line, "utf8") + 1;
        }

        if (this.debug) console.log(`[LightDB] Index built: ${this.index.size} records`);
    }

    async set(key, value) {
        const record = { key, ...value };
        const json = JSON.stringify(record) + "\n";
        await fs.promises.appendFile(this.filePath, json, "utf8");

        const stats = await fs.promises.stat(this.filePath);
        const byteOffset = stats.size - Buffer.byteLength(json, "utf8");
        this.index.set(key, byteOffset);
    }

    async get(key) {
        const offset = this.index.get(key);
        if (offset === undefined) return null;

        const file = await fs.promises.open(this.filePath, "r");
        const stream = file.createReadStream({ start: offset });
        const rl = readline.createInterface({ input: stream });

        for await (const line of rl) {
            const value = JSON.parse(line);
            if (value.key === key && !value._deleted) {
                await file.close();
                return value;
            }
        }

        await file.close();
        return null;
    }

    async delete(key) {
        if (!this.index.has(key)) return false;

        const deletionRecord = { key, _deleted: true };
        const json = JSON.stringify(deletionRecord) + "\n";

        await fs.promises.appendFile(this.filePath, json, "utf8");
        this.index.delete(key);
        return true;
    }

    async compact() {
        const tempPath = this.filePath + ".tmp";
        const temp = fs.createWriteStream(tempPath);

        const fileStream = fs.createReadStream(this.filePath);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        const latestRecords = new Map();

        for await (const line of rl) {
            try {
                const value = JSON.parse(line);
                if (value.key) latestRecords.set(value.key, value);
            } catch {}
        }

        for (const [key, value] of latestRecords.entries()) {
            if (value._deleted) continue;
            temp.write(JSON.stringify(value) + "\n");
        }

        temp.end();
        await new Promise(resolve => temp.on("finish", resolve));

        await fs.promises.rename(tempPath, this.filePath);
        await this.init();
    }

    async list() {
        const results = [];
        const handle = await fs.promises.open(this.filePath, 'r');

        for (const [key, offset] of this.index.entries()) {
            let buffer = Buffer.alloc(1024);
            let line = "";
            let pos = offset;
            let found = false;

            while (!found) {
                const { bytesRead } = await handle.read(buffer, 0, buffer.length, pos);
                if (bytesRead === 0) break;

                const chunk = buffer.slice(0, bytesRead).toString('utf8');
                const newlineIndex = chunk.indexOf("\n");

                if (newlineIndex !== -1) {
                    line += chunk.slice(0, newlineIndex);
                    found = true;
                } else {
                    line += chunk;
                    pos += bytesRead;
                }
            }

            try {
                const value = JSON.parse(line);
                if (value.key && !value._deleted) {
                    results.push(value);
                }
            } catch (e) {
                if (this.debug) console.warn("Gagal parse baris:", line);
            }
        }

        await handle.close();
        return results;
    }
}

module.exports = LightDB;