# Fuelie

Fuelie is a Mac & Windows desktop app that helps you analyze data logged from your car's ECU. It's currently focused on helping you analyze logged air-fuel-ratios from your wideband oxygen sensors.

It works with data from _any_ car or ECU provided you can get the logged data out in CSV or TSV format.

<img width="1537" alt="Screen Shot 2021-01-09 at 7 35 54 AM" src="https://user-images.githubusercontent.com/69169/104095853-f0275100-524d-11eb-9fbf-84236c52fc44.png">

## Playback

Playback your logfile:

![fuelie-logging](https://user-images.githubusercontent.com/69169/104095856-f3bad800-524d-11eb-886c-b1c5f108c8fa.gif)

## Configuration

Currently you setup the app for your car / ECU by editing a JSON config. Open the app then open the file with `cmd+,` or `ctrl+,`

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

      // Setup how the app should read your logfile
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

        // (optional) Setup specific columns for correct display in the sidebar
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

* [ ] Status panel: Keep selection between tabs
* [ ] make default target afr better
* [ ] cmd-z undo
* [ ] can take files as parameters
* [ ] Make error better when user.json error

## Dev

```sh
nvm use # make sure you're on node 14
yarn install
yarn dev
```
