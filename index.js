(async () => {
  const { sppull } = require('sppull');

  const {
    SP_BASE_URL,
    SP_CRED_USER,
    SP_CRED_PASS,
    SP_ROOT_FOLDER,
    SP_DELETE
  } = process.env

  if ([SP_BASE_URL,
    SP_CRED_USER,
    SP_CRED_PASS,
    SP_ROOT_FOLDER].some(v => !v)) {
    throw 'You need to provide all required ENV-Vars'
  }

  const result = await sppull({
    siteUrl: SP_BASE_URL,
    creds: {
      username: SP_CRED_USER,
      password: SP_CRED_PASS
    }
  }, {
    spRootFolder: SP_ROOT_FOLDER,
    dlRootFolder: '/sharepoint'
  })

  console.log('PULL - Successfull')

  const filesWritten = result.map(v=>v.SavedToLocalPath).sort()
  const filesRead = readDirRec('/sharepoint')

  const toDelete = filesRead.filter(v=>!filesWritten.includes(v))

  if(toDelete.length===0) return;
 
  console.log('exists-check | Finished')
  console.log('files to delete')
  console.log(toDelete.join('\n'))

  if(SP_DELETE === 'verify') {
    console.log('start deleting')
    toDelete.map(f => {
      unlinkSync(f)
    })
  } else {
    console.log('To Delete these files set env SP_DELETE = "verify"')
  }
})()

const { readdirSync, statSync, unlinkSync } = require('fs')
const { join } = require('path')

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
