# Fuelie

Fuelie is a Mac & Windows desktop app that helps you analyze data logged from your car's ECU. It's currently focused on helping you analyze logged air-fuel ratios from your wideband oxygen sensors.

It works with data from _any_ car or ECU provided you can get the logged data out in CSV or TSV format. See the [configuration](#configuration) section for details on setting it up for your ECU.

<img width="1537" alt="Screen Shot 2021-01-09 at 7 35 54 AM" src="https://user-images.githubusercontent.com/69169/104095853-f0275100-524d-11eb-9fbf-84236c52fc44.png">

Set up your target AFR

<img width="1105" alt="Screen Shot 2021-01-09 at 5 09 21 PM" src="https://user-images.githubusercontent.com/69169/104111965-859e0180-529d-11eb-92d4-28119c37c3dc.png">

And it will offer percentage change suggestions:

<img width="1108" alt="Screen Shot 2021-01-09 at 5 09 43 PM" src="https://user-images.githubusercontent.com/69169/104111968-8898f200-529d-11eb-9a1c-1207cb1f7bf3.png">

You can even [configure](#configuration) the math behind the suggestion.

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

Note: Check out a [JSON cheat sheet](https://cheatography.com/gaston/cheat-sheets/json/) for formatting rules. JSON is very strict: double quotes only, no stray commas, etc. If you see a not-very-descriptive error in the config editor, it's probably a JSON formatting problem. The JSON editor within the app attempts to paper over some of this (adding / converting quotes, removing trailing commas), but can't read your mind.

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
            "type": "integer" // types can be "integer", "float", or "string"
          },
          "Coolant Temp": {
            "type": "integer"
          }
          "Fuel Pulse": {
            "decimals": 2
          },
          "Dont Care": {
            "visible": false,
            "comment": "Not visible cause it is a dupe..."
          },
          "ADCR03": {
            "name": "Oil Press (psi)",
            "decimals": 1,
            "valueFormula": {
              "result": "value * 37.5 - 18.75"
            }
          },
          "ADCR01": {
            "name": "Oil Temp (F)",
            "type": "integer" // the type displayed
            "rawType": "float", // the type that feeds into value transform
            "valueTable": [
              [ 0.47, 290 ],
              [ 0.86, 240 ],
              [ 1.39, 200 ],
              [ 2.42, 150 ],
              [ 3.64, 100 ],
              [ 4.52, 50 ],
              [ 4.88, 0 ]
            ]
          }
        },

        // (optional) Specify the order to display log columns in the sidebar on
        // playback. Any columns not specified in this list will be displayed
        // after the specified columns in their original order.
        "columnDisplayOrder": [
          "Time/s",
          "Engine Load",
          "Engine Speed",
          "Throttle",
          "Vehicle Speed",
          "O2 #1",
          "O2 #2"
        ]
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

      // Settings for suggested changes
      "suggestedMixtureChange": {
        // units are used for display only at this time
        "units": "%",

        // Expression to calculate the suggested value for a single cell. This
        // expression has several variables available to it:
        //
        // * `loggedValue` - The average mixture value in the cell
        // * `targetValue` - The target mixture value in the cell
        // * `rowIndex` - The cell's row index
        // * `colIndex` - The cell's column index
        // * `avgFuelMixtureTable` - The entire table. Access cells via
        //    avgFuelMixtureTable[rowIndex][colIndex]. Each cell has a number
        //    of properties:
        //    * `value` - same as loggedValue
        //    * `rawValue` - full precision value
        //    * `min` - min mixture value sample
        //    * `max` - max mixture value sample
        //    * `length` - total samples
        //    * `weight` - total weight
        "suggestedValue": {
          "result": "(loggedValue / targetValue - 1) * 100"
        }
      },

      // Settings for mixture difference table. Used when there is more than one
      // O2 sensor reading in the log file.
      "mixtureDifference": {
        // units are used for display only at this time
        "units": "",

        // Expression to calculate the difference in a single cell. Available
        // variables:
        //
        // * `mixture0` - First O2 sensor average mixture value in the cell
        // * `mixture1` - Second O2 sensor average mixture value in the cell
        // * `targetValue` - The target mixture value in the cell
        // * `rowIndex` - The cell's row index
        // * `colIndex` - The cell's column index
        // * `avgFuelMixtureTable0` - First O2 sensor's entire table
        // * `avgFuelMixtureTable1` - Second O2 sensor's entire table
        "difference": {
          "result": "mixture1 - mixture0"
        }
      }

      // Edit this in the app's target tab
      "fuelMixtureTarget": {
        "table": []
      }
    }
  ]
}
```


## TODO

* [ ] Per-window profile selection
* [ ] Make default target afr better
* [ ] Cmd-z undo
* [ ] Can take files as parameters (open with ...)

## Dev

If you don't have it already, install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (or [nvm-windows](https://github.com/coreybutler/nvm-windows)). Then install node and yarn:

```sh
nvm install 14.15
nvm use 14.15 # make sure you're on node 14.x
npm install --global yarn
```

Then get the app running

```sh
yarn install
yarn dev # starts the app
```

Once running, you can make changes and they should immediately be reflected in the running app.

## License

MIT License
