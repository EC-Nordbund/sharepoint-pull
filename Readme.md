# Pull Folder from Sharepoint

## Build
```sh
docker build -t sharepoint-pull . 
```

## Run 
```sh
docker run -v /samba-share/test-folder:/sharepoint --env SP_BASE_URL=https://who.sharepoint.com/sites/team --env SP_ROOT_FOLDER=Servertest --env SP_CRED_USER=user@domain.de --env SP_CRED_PASS=pass sharepoint-pull
```
