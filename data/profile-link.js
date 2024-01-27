{
  "currentProfile": "Default",
  "profiles": [
    {
      "name": "Default",
      "fuelMap": {
        "rows": [
          -14.5,
          -13.1,
          -11.6,
          -10.2,
          -8.7,
          -7.3,
          -5.8,
          -4.4,
          -2.9,
          -1.5,
          0,
          1.5,
          4,
          7,
          10,
          13
        ],
        "columns": [
          0,
          500,
          750,
          1000,
          1250,
          1500,
          2000,
          2500,
          3000,
          3500,
          4000,
          4500,
          5000,
          5500,
          6000,
          6500,
          7000,
          7500,
          8000,
          8500
        ]
      },
      "units": {
        "mixture": "afr"
      },
      "suggestedMixtureChange": {
        "units": "%",
        "suggestedValue": {
          "result": "(loggedValue / targetValue - 1) * 100"
        }
      },
      "mixtureDifference": {
        "units": "",
        "difference": {
          "result": "mixture1 - mixture0"
        }
      },
      "logFile": {
        "time": "File Time",
        "row": "MGP",
        "column": "Engine Speed",
        "mixture": [
          "Lambda 1",
          "Lambda 2"
        ],
        "defaultType": "float",
        "columns": {
          "Engine Speed": {
            "type": "integer"
          },
          "Gear": {
            "type": "integer"
          },
          "Fuel Table 1": {
            "type": "integer"
          },
          "Accel Fuel": {
            "type": "float"
          },
          "IAT": {
            "type": "integer"
          },
          "ECT": {
            "type": "integer"
          },
          "Oil Pressure": {
            "type": "float",
          },
          "Fuel Pressure": {
            "type": "float",
          },
          "Oil Temperature": {
            "type": "float",
          }
        },
        "showSpecifiedColumnsOnly": true,
        "columnDisplayOrder": [
          "File Time",
          "TPS (Main)",
          "Gear",
          "Driving Wheel Speed",
          "MGP",
          "Engine Speed",
          "Lambda 1",
          "Lambda 2",
          "CL Lambda  Fuel  Corr.",
          "CL Lambda  Fuel  Corr. 2",
          "AFR/Lambda Target",
          "CL Lambda Target Error 1",
          "CL Lambda Target Error 2",
          "IAT",
          "ECT",
          "Oil Temperature",
          "Oil Pressure",
          "Fuel Pressure",
          "Fuel Table 1",
          "Accel Fuel",
          "IAT Fuel Corr.",
          "Injector Duty Cycle",
          "Injection Actual PW",
          "Injector Duty Cycle (Sec)",
          "Injector PW (Sec)",
          "Ignition Angle",
          "Knock Level Detected",
          "Knock Level Normalised",

          "Batt Voltage",
          "ECU Temperature",

          // "Lateral (X) Acceleration",
          // "Longitudinal (Y) Acceleration",
          // "Vertical (Z) Acceleration",
          // "MAP",
          // "BAP",
          // "Acceleration"
        ]
      },
      "charting": {
        "zoom": {
          "pointsInView": 1526,
          "maxPointsInView": 6000
        },
        "scales": {
          "tempF": {
            "range": [
              100,
              250
            ]
          },
          "afr": {
            "range": [
              8,
              20
            ]
          },
          "mapPsi": {
            "range": [
              -14,
              11
            ]
          },
          "oilPsi": {
            "range": [
              0,
              100
            ]
          },
          "fuelPsi": {
            "range": [
              0,
              100
            ]
          },
          "%": {
            "range": [
              0,
              100
            ]
          },
          "rpm": {
            "range": [
              0,
              8500
            ]
          },
          "pulsewidth": {
            "range": [
              0,
              5
            ]
          },
          "fuelAccel": {
            "range": [
              0,
              20
            ]
          },
          "fuelAccelDTPS": {
            "range": [
              0,
              25
            ]
          },
          "deg": {
            "range": [
              0,
              50
            ]
          },
          "battVolts": {
            "range": [
              10,
              15
            ]
          },
          "fiveV": {
            "range": [
              0,
              5
            ]
          },
          "battOffset": {
            "range": [
              300,
              800
            ]
          }
        },
        "pages": [
          {
            "name": "Charts",
            "charts": [
              {
                "lines": [
                  {
                    "column": "Lambda 1",
                    "scale": "afr",
                    "show": true
                  },
                  {
                    "column": "Lambda 2",
                    "scale": "afr",
                    "show": true
                  },
                  {
                    "column": "MGP",
                    "scale": "mapPsi",
                    "show": true
                  },
                  {
                    "column": "TPS (Main)",
                    "scale": "%",
                    "show": true
                  },
                  {
                    "column": "Engine Speed",
                    "scale": "rpm",
                    "show": true
                  },
                  {
                    "column": "Oil Pressure",
                    "scale": "oilPsi",
                    "show": true
                  },
                  {
                    "column": "Fuel Pressure",
                    "scale": "fuelPsi",
                    "show": false
                  }
                ]
              },
              {
                "height": "25%",
                "lines": [
                  {
                    "column": "IAT",
                    "color": "rgba(255,0,255,0.8)",
                    "scale": "tempF",
                    "show": true
                  },
                  {
                    "column": "ECT",
                    "scale": "tempF",
                    "show": true
                  },
                  {
                    "column": "Oil Temperature",
                    "scale": "tempF",
                    "show": true
                  }
                ]
              },
              {
                "height": "25%",
                "lines": [
                  {
                    "column": "Ignition Angle",
                    "scale": "deg"
                  },
                  {
                    "column": "Injection Actual PW",
                    "scale": "pulsewidth",
                    "show": true
                  },
                  {
                    "column": "Accel Fuel",
                    "color": "rgba(255,0,255,0.8)",
                    "scale": "fuelAccel"
                  },
                  {
                    "column": "Batt Voltage",
                    "scale": "battVolts",
                    "color": "black"
                  },
                ]
              }
            ]
          }
        ]
      },
      "avgFuelMixture": {
        "minValue": 8,
        "maxValue": 18.3,
        "minWeight": 0.3,
        "minTotalWeight": 1,
        "ignore": [
          {
            "accel": "Accel Fuel",
            "condition": "accel > 100"
          }
        ]
      },
      "fuelMixtureTarget": {
        "table": [
          [
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5
          ],
          [
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5,
            11.5
          ],
          [
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9,
            11.9
          ],
          [
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1,
            12.1
          ],
          [
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5
          ],
          [
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5,
            12.5
          ],
          [
            12.8,
            12.8,
            12.9,
            12.9,
            12.9,
            12.9,
            12.9,
            12.9,
            12.8,
            12.7,
            12.7,
            12.7,
            12.7,
            12.7,
            12.7,
            12.7,
            12.7,
            12.7,
            12.7,
            12.7,
            12.7
          ],
          [
            12.9,
            12.9,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13,
            13
          ],
          [
            13,
            13,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ],
          [
            13.75,
            13.75,
            13.75,
            14.7,
            14.7,
            14.7,
            14.7,
            13.7,
            13.7,
            13.7,
            13.7,
            13.7,
            13.7,
            13.7,
            13.7,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ],
          [
            14.7,
            14.7,
            14.2,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.3,
            14.15,
            14,
            13.9,
            13.7,
            13.7,
            13.7,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ],
          [
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.3,
            14.15,
            14,
            13.9,
            13.7,
            13.7,
            13.7,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ],
          [
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.3,
            14.15,
            14,
            13.9,
            13.7,
            13.7,
            13.7,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ],
          [
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.3,
            14.15,
            14,
            13.9,
            13.7,
            13.7,
            13.7,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ],
          [
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.3,
            14.15,
            14,
            13.9,
            13.7,
            13.7,
            13.7,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ],
          [
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.3,
            14.15,
            14,
            13.9,
            13.7,
            13.7,
            13.7,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ],
          [
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.3,
            14.15,
            14,
            13.9,
            13.7,
            13.7,
            13.7,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5,
            13.5
          ]
        ]
      },
      "suggestCalc": "afr"
    }
  ]
}
