const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/database.sqlite');
const dryRun = process.argv.includes('--dry-run') || process.env.npm_config_dry_run === 'true';

function run(db, sql, parameters = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, parameters, function (error) {
            if (error) return reject(error);
            resolve(this);
        });
    });
}

function all(db, sql, parameters = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, parameters, (error, rows) => {
            if (error) return reject(error);
            resolve(rows);
        });
    });
}

function close(db) {
    return new Promise((resolve, reject) => {
        db.close(error => error ? reject(error) : resolve());
    });
}

async function renumberRepairOrders() {
    const db = await new Promise((resolve, reject) => {
        const connection = new sqlite3.Database(dbPath, error => {
            if (error) return reject(error);
            resolve(connection);
        });
    });

    try {
        const tickets = await all(db, `
            SELECT id, repairOrderNumber, date
            FROM tickets
            ORDER BY date ASC, id ASC
        `);

        if (tickets.length === 0) {
            console.log('No repair orders found.');
            return;
        }

        console.log('Repair order numbers to be assigned:');
        tickets.forEach((ticket, index) => {
            console.log(`${ticket.repairOrderNumber || '(blank)'} -> ${index + 1} (${ticket.date})`);
        });

        if (dryRun) {
            console.log('Dry run complete. No changes were made.');
            return;
        }

        await run(db, 'BEGIN TRANSACTION');
        try {
            for (const ticket of tickets) {
                await run(db, 'UPDATE tickets SET repairOrderNumber = ? WHERE id = ?', [`__renumber_${ticket.id}__`, ticket.id]);
            }

            for (const [index, ticket] of tickets.entries()) {
                await run(db, 'UPDATE tickets SET repairOrderNumber = ? WHERE id = ?', [String(index + 1), ticket.id]);
            }

            await run(db, 'COMMIT');
        } catch (error) {
            await run(db, 'ROLLBACK');
            throw error;
        }

        console.log(`Renumbered ${tickets.length} repair order(s).`);
    } finally {
        await close(db);
    }
}

renumberRepairOrders().catch(error => {
    console.error(`Failed to renumber repair orders: ${error.message}`);
    process.exitCode = 1;
});