const { readdirSync, statSync, unlinkSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

(async () => {
  const { sppull } = require('sppull');
  writeFileSync('/sharepoint/.lock', '')

  const {
    SP_BASE_URL,
    SP_CRED_CLIENTID,
    SP_CRED_CLIENTSECRET,
    SP_CRED_REALM,
    SP_ROOT_FOLDER,
    SP_DELETE
  } = process.env

  console.log(SP_ROOT_FOLDER)

  if ([SP_BASE_URL,
    SP_CRED_CLIENTID,
    SP_CRED_CLIENTSECRET,
    SP_CRED_REALM,
    SP_ROOT_FOLDER].some(v => !v)) {
    throw 'You need to provide all required ENV-Vars'
  }

  const result = await sppull({
    siteUrl: SP_BASE_URL,
    creds: {
       clientId: SP_CRED_CLIENTID,
       clientSecret: SP_CRED_CLIENTSECRET,
       realm: SP_CRED_REALM
    }
  }, {
    spRootFolder: SP_ROOT_FOLDER,
    dlRootFolder: '/sharepoint'
  })

  console.log('PULL - Successfull')

  const filesWritten = result.map(v=>v.SavedToLocalPath).sort()
  const filesRead = readDirRec('/sharepoint')

  const version = result.map(v=>v.TimeLastModified).sort().reverse()[0]

  const oldVersion = readFileSync('/sharepoint/.version', 'utf8')

  if (version !== oldVersion) {
    writeFileSync('/sharepoint/.version', version)
    writeFileSync('/sharepoint/.restart', '')
  }

  const toDelete = filesRead.filter(v=>!filesWritten.includes(v) && !v.startsWith('/sharepoint/.'))

  if(toDelete.length===0) {unlinkSync('/sharepoint/.lock')
  return;}
 
  console.log('exists-check | Finished')
  console.log('files to delete')
  console.log(toDelete.join('\n'))

  if(SP_DELETE === 'verify') {
    console.log('start deleting')
    toDelete.map(f => {
      unlinkSync(f)
    })
    if(toDelete.length > 0) writeFileSync('/sharepoint/.restart', '');
  } else {
    console.log('To Delete these files set env SP_DELETE = "verify"')
  }
  unlinkSync('/sharepoint/.lock')
})()

function readDirRec(dir) {
  let r = []

  const ff = readdirSync(dir)

  ff.forEach(f => {
    const file = join(dir, f)
    if (statSync(file).isFile()) {
      r.push(file)
    } else {
      r.push(...readDirRec(file))
    }
  })

  return r
}
