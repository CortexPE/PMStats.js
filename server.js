/**
 * 
 *  ____  __  __ ____  _        _          _     
 * |  _ \|  \/  / ___|| |_ __ _| |_ ___   (_)___ 
 * | |_) | |\/| \___ \| __/ _` | __/ __|  | / __|
 * |  __/| |  | |___) | || (_| | |_\__ \_ | \__ \
 * |_|   |_|  |_|____/ \__\__,_|\__|___(_)/ |___/
 *                                      |__/     
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author CortexPE
 * @link https://CortexPE.xyz
 *
 */

"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");

const dbConfig = require("./config/database.json");
const app = express();
const db = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: dbConfig.pool,
    logging: null // stfu sequelize
});

app.use(bodyParser.json());

db.authenticate().then(() => {
    console.log("Connection has been established successfully.");
}).catch (err => {
    console.error("Unable to connect to the database:", err);
});

const Servers = db.define("servers", {
    uniqueServerId: {
        type: Sequelize.STRING,
        unique: true
    },
    uniqueMachineId: {
        type: Sequelize.STRING
    },
    port: {
        type: Sequelize.INTEGER
    },
    software: {
        type: Sequelize.STRING
    },
    fullVersion: {
        type: Sequelize.STRING
    },
    build: {
        type: Sequelize.INTEGER
    },
    api: {
        type: Sequelize.STRING
    },
    minecraftVersion: {
        type: Sequelize.STRING
    },
    protocol: {
        type: Sequelize.INTEGER
    },
    operatingSystem: {
        type: Sequelize.STRING
    },
    cores: {
        type: Sequelize.INTEGER
    },
    phpVersion: {
        type: Sequelize.STRING
    },
    machine: {
        type: Sequelize.STRING
    },
    release: {
        type: Sequelize.STRING
    },
    platform: {
        type: Sequelize.STRING
    },
    plugins: {
        type: Sequelize.TEXT("medium"),
        get() {
            return JSON.parse(this.getDataValue("plugins") || "{}");
        },
        set(value) {
            this.setDataValue("plugins", JSON.stringify(value));
        },
    },
    ticksPerSecond: {
        type: Sequelize.FLOAT
    },
    tickUsage: {
        type: Sequelize.FLOAT
    },
    playerCount: {
        type: Sequelize.INTEGER
    },
    playerLimit: {
        type: Sequelize.INTEGER
    },
    playerList: {
        type: Sequelize.TEXT("medium"),
        get() {
            return JSON.parse(this.getDataValue("playerList") || "{}");
        },
        set(value) {
            this.setDataValue("playerList", JSON.stringify(value));
        },
    },
    historyList: {
        type: Sequelize.TEXT("medium"),
        get() {
            return JSON.parse(this.getDataValue("historyList") || "{}");
        },
        set(value) {
            this.setDataValue("historyList", JSON.stringify(value));
        },
    },
    ticks: {
        type: Sequelize.INTEGER
    },
    mainMemory: {
        type: Sequelize.INTEGER
    },
    totalMemory: {
        type: Sequelize.INTEGER
    },
    availableMemory: {
        type: Sequelize.INTEGER
    },
    threadCount: {
        type: Sequelize.INTEGER
    },
    online: {
        type: Sequelize.BOOLEAN
    },
    crashed: {
        type: Sequelize.BOOLEAN
    },
});

app.post("/api/post", function (req, res) {
    let data = req.body;
    //console.log(data);
    switch (data.event) {
        case "open":
            Servers.upsert({
                uniqueServerId: data.uniqueServerId,
                uniqueMachineId: data.uniqueMachineId,
                port: data.server.port,
                software: data.server.software,
                fullVersion: data.server.fullVersion,
                build: data.server.build,
                api: data.server.api,
                minecraftVersion: data.server.minecraftVersion,
                protocol: data.server.protocol,
                operatingSystem: data.system.operatingSystem,
                cores: data.system.cores,
                phpVersion: data.system.phpVersion,
                machine: data.system.machine,
                release: data.system.release,
                platform: data.system.platform,
                playerCount: data.players.count,
                playerLimit: data.players.limit,
                plugins: data.plugins,
                online: true,
                crashed: false,
            });
            break;
        case "close":
            Servers.update({
                online: true,
                crashed: false,
            }, {
                where: {
                    uniqueServerId: data.uniqueServerId
                }
            });
            break;
        case "status":
            Servers.update({
                ticksPerSecond: data.server.ticksPerSecond,
                tickUsage: data.server.tickUsage,
                playerCount: data.players.count,
                playerLimit: data.players.limit,
                playerList: data.players.currentList,
                historyList: data.players.historyList,
                mainMemory: data.system.mainMemory,
                totalMemory: data.system.totalMemory,
                availableMemory: data.system.availableMemory,
                threadCount: data.system.threadCount,
                online: false,
                crashed: data.crashing,
            }, {
                where: {
                    uniqueServerId: data.uniqueServerId
                }
            });
            break;
    }
});

db.sync().then(() => {
    app.listen(80, () => console.log("PMMP Statistics server backend API is now running!"))
});