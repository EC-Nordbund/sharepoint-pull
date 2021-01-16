(async () => {
  const { sppull } = require('sppull');

  const {
    SP_BASE_URL,
    SP_CRED_USER,
    SP_CRED_PASS,
    SP_ROOT_FOLDER
  } = process.env

  if ([SP_BASE_URL,
    SP_CRED_USER,
    SP_CRED_PASS,
    SP_ROOT_FOLDER].some(v => !v)) {
    throw 'You need to provide all required ENV-Vars'
  }

  await sppull({
    siteUrl: SP_BASE_URL,
    cred: {
      username: SP_CRED_USER,
      password: SP_CRED_PASS
    }
  }, {
    spRootFolder: SP_ROOT_FOLDER,
    dlRootFolder: '/sharepoint'
  })

  console.log('PULL - Successfull')
})()
