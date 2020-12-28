
[ ] Status panel
  [x] what goes there for target? Maybe actual, or actual & error?
  [ ] Keep selection between tabs
[x] Add a thing so I can omit lines with accel trim
[ ] slider to walk through the logfile
[ ] Fix jank config file handling: when trailing comma, or unparsable, it will wipe the config back to default. Just error....

[ ] make default target afr better
[ ] cmd-z undo
[ ] cmd-option arrows, move through tabs
[ ] can take files as parameters

---

[x] Display another table: amount off target afr
[x] Draw status thing with the hover info
[x] draw table
  [x] hover info
    [x] show number of samples
    [x] add min / max values
[x] Updates the UI when the config changes
[x] Add target afr
  [x] add to user config
  [x] add tabs to UI for it
  [x] can edit it
[x] could make the file reload smarter
  [x] logFile.setConfig. It could use the data in mem

## Dev

```sh
nvm use # make sure you're on node 14
yarn install
yarn dev
```
