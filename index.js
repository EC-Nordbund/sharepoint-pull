const {
  readdirSync,
  statSync,
  unlinkSync,
  readFileSync,
  writeFileSync,
  existsSync,
} = require("fs");

const chalk = require('chalk');
const { join } = require("path");
const { sppull } = require("sppull");

function lock(file) {
  if (existsSync(file)) {
    throw new Error('Lock exists!')
  }

  writeFileSync(file, "");

  return () => {
    unlinkSync(file)
  }
}

function log(msg) {
  console.log(`${chalk.red('[SHAREPOINT-PULL]')} ${chalk.blue(msg)}`)
}

function checkVersion(file, currentVersion) {
  if (existsSync(file)) {
    if (readFileSync(file, 'utf-8') === currentVersion) {
      return true
    }

    writeFileSync(file, currentVersion)
  }
  return false
}


function readDirRec(dir) {
  let r = [];

  const ff = readdirSync(dir);

  ff.forEach((f) => {
    const file = join(dir, f);
    if (statSync(file).isFile()) {
      r.push(file);
    } else {
      r.push(...readDirRec(file));
    }
  });

  return r;
}


(async () => {
  const unlock = lock("/sharepoint/.lock");

  const {
    SP_BASE_URL,
    SP_CRED_CLIENTID,
    SP_CRED_CLIENTSECRET,
    SP_CRED_REALM,
    SP_ROOT_FOLDER,
    SP_DELETE,
  } = process.env;

  log(`Root Folder: ${SP_ROOT_FOLDER}`);

  if (
    [
      SP_BASE_URL,
      SP_CRED_CLIENTID,
      SP_CRED_CLIENTSECRET,
      SP_CRED_REALM,
      SP_ROOT_FOLDER,
    ].some((v) => !v)
  ) {
    throw "You need to provide all required ENV-Vars";
  }

  const result = await sppull(
    {
      siteUrl: SP_BASE_URL,
      creds: {
        clientId: SP_CRED_CLIENTID,
        clientSecret: SP_CRED_CLIENTSECRET,
        realm: SP_CRED_REALM,
      },
    },
    {
      spRootFolder: SP_ROOT_FOLDER,
      dlRootFolder: "/sharepoint",
    }
  );

  log(`Alle Daten geladen!`);

  const filesWritten = result.map((v) => v.SavedToLocalPath).sort();
  const filesRead = readDirRec("/sharepoint");

  const version = result
    .map((v) => v.TimeLastModified)
    .sort()
    .reverse()[0];

  const changed = checkVersion("/sharepoint/.version", version)

  if (changed) {
    writeFileSync("/sharepoint/.restart", "");
    log('There are some changes!')
  }

  const toDelete = filesRead.filter(
    (v) => !filesWritten.includes(v) && !v.startsWith("/sharepoint/.")
  );

  if (toDelete.length === 0) {
    log('No files to delete')
    unlock()
    return;
  }

  log('Files to delete found')

  if (SP_DELETE === 'verify') {
    log('Start deleting files')
    toDelete.map((f) => {
      unlinkSync(f);
    });
    writeFileSync("/sharepoint/.restart", "");
    log('Finished deleting files')
  } else {
    toDelete.forEach(f => log(`DELETE: ${f}`))

    log('To Delete these files set env SP_DELETE = "verify"')
  }

  unlock()
})();
