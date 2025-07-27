const LightDB = require("../src/index");

(async () => {
    const db = new LightDB("storage.jsonl", { debug: true });
    await db.init();
    
    await db.set("user1", { name: "Rezvy", age: 22 });
    await db.set("user2", { name: "Bot", age: 1 });
    
    console.log("user1 exists:", db.exists("user1"));
    console.log("user3 exists:", db.exists("user3"));

    const user1 = await db.get("user1");
    console.log("user1:", user1);
    
    await db.set("user1", { name: "Rezvy", age: 23 });
    const user1Updated = await db.get("user1");
    console.log("user1 updated:", user1Updated);
    
    const all = await db.list();
    console.log("Semua data aktif:", all);
    
    await db.delete("user2");
    console.log("user2 exists after delete:", db.exists("user2"));
    const user2 = await db.get("user2");
    console.log("user2 after delete:", user2);
    
    await db.compact();
    console.log("Setelah compact, semua data aktif:", await db.list());
    
    await db.set("user3", { name: "Baru", age: 99 });
    console.log("Setelah tambah user3:", await db.list());
})();
