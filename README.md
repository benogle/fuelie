
[ ] Status panel
  [ ] what goes there for target? Maybe actual, or actual & error?
  [ ] Keep selection between tabs
[ ] Display another table: amount off target afr
[ ] slider to walk through the logfile
[ ] make default target afr better
[ ] cmd-z undo
[ ] cmd-option arrows, move through tabs
[ ] can take files as parameters

[ ] Fix
  [ ] rename things
    [ ] is config.headers right? might need stuff like units

---

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
