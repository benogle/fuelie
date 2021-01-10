# Fuelie

Fuelie is a Mac & Windows desktop app that helps you analyze data logged from your car's ECU. It's currently focused on helping you analyze logged air-fuel ratios from your wideband oxygen sensors.

It works with data from _any_ car or ECU provided you can get the logged data out in CSV or TSV format. See the [configuration](#configuration) section for details on setting it up for your ECU.

<img width="1537" alt="Screen Shot 2021-01-09 at 7 35 54 AM" src="https://user-images.githubusercontent.com/69169/104095853-f0275100-524d-11eb-9fbf-84236c52fc44.png">

Set up your target AFR

<img width="1105" alt="Screen Shot 2021-01-09 at 5 09 21 PM" src="https://user-images.githubusercontent.com/69169/104111965-859e0180-529d-11eb-92d4-28119c37c3dc.png">

And it will offer percentage change suggestions:

<img width="1108" alt="Screen Shot 2021-01-09 at 5 09 43 PM" src="https://user-images.githubusercontent.com/69169/104111968-8898f200-529d-11eb-9a1c-1207cb1f7bf3.png">

## Playback

Play back your logfile:

![fuelie-logging](https://user-images.githubusercontent.com/69169/104095856-f3bad800-524d-11eb-886c-b1c5f108c8fa.gif)

Playback UI features

![playback](https://user-images.githubusercontent.com/69169/104111837-fcd29600-529b-11eb-962d-77c11e9bea7c.jpg)

## Keyboard Shortcuts

* `arrows`:
  * When grid is selected: move selection
  * When grid is _not_ selected: `left` & `right` scrub playback by one sample
* `shift+left|right`: scrub playback by 10 samples
* `space` bar: play / pause from current location
* `cmd+option+left|right` (`ctrl+option+left|right` Windows): move between tabs
* `cmd+c` (`ctrl+c` Windows) in the grid: copy selected cells
* `cmd+v` (`ctrl+v` Windows) in the grid: paste selected cells (pasting/editing only available in target AFR)
* `cmd+,` (`ctrl+,` Windows): open your configuration file

## Configuration

Before you open a log file, you will probably need to configure the app to work with your setup.

At this time, you set the app up for your car / ECU by editing a JSON config file. Open the app then open the file with `cmd+,` or `ctrl+,`

Note: [JSON](https://cheatography.com/gaston/cheat-sheets/json/) is very sensitive: double quotes only, no stray commas, etc. If you see a complicated-but-not-very-descriptive error about user.json, it's probably a JSON formatting problem.

```js
{
  // Matches the profile.name from the list of profiles
  "currentProfile": "Default",

  "profiles": [
    {
      "name": "Default",

      // The fuel map headers will be used to locate which cells are accessed in
      // your fuel table.
      "fuelMap": {
        // Row headers
        "rows": [9, 6, 3, 1, -0, -1, -2, -3, -4, -5, -6, -8, -9, -10, -11, -12, -13],
        // Column headers
        "columns": [ 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6550, 7000, 7500, 8000, 8500, 9000, 9500, 10000, 10500]
      },
      "units": {
        "mixture": "afr"
      },

      // Set up how the app should read your logfile
      "logFile": {
        // Currently time should be decimal seconds starting from 0
        "time": "Time/s",

        // Table row will be interpolated based on the row headers and the CSV
        // column specified here
        "row": "Engine Load",

        // Table column will be interpolated based on the column headers and the
        // CSV column specified here
        "column": "Engine Speed",

        // Specify one or more oxygen sensor columns
        "mixture": ["O2 #1"],

        // Parse values as this by default. float is recommended
        "defaultType": "float",

        // (optional) Set up specific columns for correct display in the sidebar
        "columns": {
          "Engine Speed": {
            "type": "integer"
          },
          "Coolant Temp": {
            "type": "integer"
          }
          "Fuel Pulse": {
            "decimals": 2
          },
        }
      },

      // Settings for the average fuel mixture table(s)
      "avgFuelMixture": {
        // Values outside this range will be ignored
        "minValue": 7,
        "maxValue": 20,


        // A log line must cross this cell weight threshhold to be included in
        // the average. Range 0 to 1.

        // When a row and column are calculated from the engine load & speed, a
        // single cell is almost never used by the ECU. It uses a blend
        // (interpolation) of 4 cells. The higher the value, the more a log
        // sample is affecting this cell.
        "minWeight": 0.2,

        // The aggregate weights of all samples in this cell must be over this
        // threshhold to be included in the average table.
        "minTotalWeight": 1,

        // (optional) ignore rows that meet some condition. You can access any
        // column in the log file
        "ignore": [{
          "accel": "Fuel Trim (Accel)",
          "condition": "accel > 600"
        }]
      },

      // Edit this in the app's target tab
      "fuelMixtureTarget": {
        "table": []
      }
    }
  ]
}
```


## TODO

* [ ] Make error better when user.json issue
* [ ] Per-window profile selection
* [ ] Make default target afr better
* [ ] Cmd-z undo
* [ ] Can take files as parameters (open with ...)

## Dev

```sh
nvm use # make sure you're on node 14
yarn install
yarn dev # starts the app
```
