# api-express

## nodejs

`sudo apt-get install nodejs`

## nvm

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash`

## yarn

`curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`
`echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`
`sudo apt update && sudo apt install yarn`

## Docker

`sudo apt-get install docker.io`
`sudo groupadd docker`
`sudo usermod -aG docker $USER`
Log out and log in or `newgrp docker`

### Docker with WSL

Install Docker Desktop:
https://docs.docker.com/docker-for-windows/wsl-tech-preview/

## MongoDB docker

`docker pull mongo`
`docker run -d -it -p 27017:27017 mongo`

GUI --> MongoDB Compass

### MongoDB beginning

`docker exec -it <container_neme> mongo`
`use <db_name>` to open (or create) a database
`db` to se the actual db
`show dbs` to see the list of databases
`db.<collection>.insert(document)` to add a new document in a collection

## eslint

https://eslint.org/docs/user-guide/configuring
https://gist.github.com/dahjelle/8ddedf0aebd488208a9a7c829f19b9e8
