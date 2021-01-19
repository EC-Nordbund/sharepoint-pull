# Pull Folder from Sharepoint

## Build
```sh
docker build -t sharepoint-pull . 
```

## Run 
```sh
docker run -v /samba-share/test-folder:/sharepoint --env SP_BASE_URL=https://who.sharepoint.com/sites/team --env SP_ROOT_FOLDER=Servertest --env SP_CRED_USER=user@domain.de --env SP_CRED_PASS=pass sharepoint-pull
```

## Delete old files
***IMPORTANT:*** Files that are in sharepoint and got changed will overwrite local files. If a file is deleted in Sharepoint the code detects it but DON'T delete it! To allow deletion add `--env SP_DELETE=verify` to the command. This is to ensure that no file is deleted when you don't want that - or when the pull has problems.

