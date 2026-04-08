# AuxData Filesynchronisation tool to AuxData.ai Platform Knowledge Database

This tool synchronises local filesystems oder sharepoint Servers with the AuxData.ai Knowledge DB. This tool is intended for admin use. You should be familiar with your filesystem, Microsoft Sharepoint sites and the AuxData.ai platform. If not contact support@auxdata.ai and we will help you with the configuration.
The database is empty and can be filled with data.

## Features

- checks for new files in the configured directories or sharepoint drives and uploads it in the defined agent knowledgedb
- checks for changes in configured directories or sharepoint drives und updates it in the defined agent knowledgedb
- checks for deleted files locally or in your sharepoint drives and deletes it int the defined agent knowledgedb
- configuring local directories for synchronisation
- configuring sharepoint site, drives and folders  for synchronisation

## Compatibility
The application was written in go. On this site we offer only a windows executable at the moment. But if you need it for any other os just write a email to support@auxdata.ai

## Development
This application was created by the AuxData.ai platform on it's own with support of some developers for improvements and code reviews. This is the reason why it looks a little bit different to the AuxData.ai platform.

## Documentation

There are 2 different possibilities to start the app.

### Execution syncrhonisation

Command: ```filesync.exe -exec```

loads the configuration from the file database and executes the sync process

### Open the Configuration editor

Command: ```filesync.exe -service```

starts the rest Backend and opens the browser on port 9180 to edit the configurations.

Here will come more informations in the future.

### Database

we use a small sqilte3 database to store the configs, storing the file infos. If you want to look inside feel free.

### Logging

If something does not work, like you expected you will find all logs in the logging tables. There you will find the complete output.

### Auto synchronising

create a cron job which starts the ```filesync.exe``` in the intervall you want.

