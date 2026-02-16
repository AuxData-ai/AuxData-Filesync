# AuxData Filesynchronisation tool with KnowledgeDB

This tool synchronises local filesystems oder sharepoint Servers with the AuxData.ai Knowledge DB. 
The database is empty and can be filled with data.

## Documentation

There are 2 different possibilities to start the app.

## Execution syncrhonisation
Command: ```filesync.exe```

loads the configuration from the file database and executes the sync process

## Open the Configuration editor
Command: ```filesync.exe -service```

starts the rest Backend and opens the browser on port 9180 to edit the configurations.


## Compatibility

The application was written in go. On this site we offer only a windows executable at the moment. But if you need it for any other os just write a email to support@auxdata.ai
