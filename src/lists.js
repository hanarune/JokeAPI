// this module initializes the blacklist, whitelist and console blacklist

const jsl = require("svjsl");
const fs = require("fs");
const settings = require("../settings");
const debug = require("./verboseLogging");
const logger = require("./logger");


/**
 * Initializes all lists (blacklist, whitelist and console blacklist)
 * @returns {Promise}
 */
const init = () => {
    return new Promise((resolve, reject) => {
        //#SECTION read list files
        debug("Lists", "Reading blacklist...");
        fs.readFile(settings.lists.blacklistPath, (err1, blacklist) => {
            if(!jsl.isEmpty(err1) && !err1.toString().includes("ENOENT"))
                return reject(err1);
            else if(!jsl.isEmpty(err1) && err1.toString().includes("ENOENT"))
            {
                debug("Lists", `${jsl.colors.fg.red}No blacklist file found! Defaulting to empty list.${jsl.colors.rst}`);
                blacklist = "[\n\t\n]";
            }

            blacklist = blacklist.toString();
            debug("Lists", "Reading whitelist...");
            fs.readFile(settings.lists.whitelistPath, (err2, whitelist) => {
                if(!jsl.isEmpty(err2) && !err2.toString().includes("ENOENT"))
                    return reject(err2);
                else if(!jsl.isEmpty(err2) && err2.toString().includes("ENOENT"))
                {
                    debug("Lists", `${jsl.colors.fg.red}No whitelist file found! Defaulting to empty list.${jsl.colors.rst}`);
                    whitelist = "[\n\t\n]";
                }

                whitelist = whitelist.toString();
                debug("Lists", "Reading console blacklist...");
                fs.readFile(settings.lists.consoleBlacklistPath, (err3, consoleBlacklist) => {
                    if(!jsl.isEmpty(err3) && !err3.toString().includes("ENOENT"))
                        return reject(err3);
                    else if(!jsl.isEmpty(err3) && err3.toString().includes("ENOENT"))
                        consoleBlacklist = "[\n\t\n]";

                    consoleBlacklist = consoleBlacklist.toString();
                    
                    //#SECTION put lists in the process object
                    try
                    {
                        if(jsl.isEmpty(process.jokeapi))
                            process.jokeapi = {};
                        if(jsl.isEmpty(process.jokeapi.lists))
                            process.jokeapi.lists = {};
                        
                        process.jokeapi.lists = {
                            blacklist: JSON.parse(blacklist),
                            whitelist: JSON.parse(whitelist),
                            consoleBlacklist: JSON.parse(consoleBlacklist)
                        };
                        if(!jsl.isEmpty(process.jokeapi.lists))
                            return resolve(process.jokeapi.lists);
                        return reject(`Unexpected error: process.jokeapi.lists is empty (${typeof process.jokeapi.lists})`);
                    }
                    catch(err)
                    {
                        return reject(err);
                    }
                });
            });
        });
    });
};

/**
 * Checks whether a provided IP address is in the blacklist
 * @param {String} ip
 * @returns {Bool} true if blacklisted, false if not
 */
const isBlacklisted = ip => {
    if(jsl.isEmpty(process.jokeapi) || jsl.isEmpty(process.jokeapi.lists) || !(process.jokeapi.lists.blacklist instanceof Array))
    {
        logger("fatal", `Blacklist was not initialized when calling lists.isBlacklisted()`, true);
        throw new Error(`Blacklist was not initialized`);
    }

    if(jsl.isEmpty(process.jokeapi.lists.blacklist) || process.jokeapi.lists.blacklist.length == 0)
        return false;
    
    let returnVal = false;

    process.jokeapi.lists.blacklist.forEach(blIP => {
        if(ip == blIP)
            returnVal = true;
    });
    return returnVal;
}

/**
 * Checks whether a provided IP address is in the whitelist
 * @param {String} ip
 * @returns {Bool} true if whitelisted, false if not
 */
const isWhitelisted = ip => {
    if(jsl.isEmpty(process.jokeapi) || jsl.isEmpty(process.jokeapi.lists) || !(process.jokeapi.lists.whitelist instanceof Array))
    {
        logger("fatal", `Whitelist was not initialized when calling lists.isWhitelisted()`, true);
        throw new Error(`Whitelist was not initialized`);
    }

    if(jsl.isEmpty(process.jokeapi.lists.whitelist) || process.jokeapi.lists.whitelist.length == 0)
        return false;

    process.jokeapi.lists.whitelist.forEach(wlIP => {
        if(ip == wlIP)
            return true;
    });
    return false;
}
module.exports = { init, isBlacklisted, isWhitelisted };