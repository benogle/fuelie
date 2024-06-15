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
          13,
          16
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
          8500,
          10500
        ]
      },
      "units": {
        "mixture": "afr",
        "temperature": "f",
        "pressure": "psi",
        "speed": "mph"
      },
      "suggestedMixtureChange": {
        "units": "%",
        "suggestedValue": {
          "result": "(loggedCorrectedValue / targetValue - 1) * 100"
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
        "mixtureCorrection": [
          "CL Lambda  Fuel  Corr.",
          "CL Lambda  Fuel  Corr. 2"
        ],
        "defaultType": "float",
        "columns": {
          "Engine Speed": {
            "type": "integer"
          },
          "Driving Wheel Speed": {
            "type": "integer"
          },
          "TPS (Main)": {
            "type": "integer"
          },
          "Gear": {
            "type": "integer"
          },
          "Fuel Table 1": {
            "type": "float"
          },
          "Fuel Table 2": {
            "type": "float"
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
            "type": "float"
          },
          "Fuel Pressure": {
            "type": "float"
          },
          "Oil Temperature": {
            "type": "integer"
          },
          "CL Lambda  Fuel  Corr.": {
            "type": "float"
          },
          "CL Lambda  Fuel  Corr. 2": {
            "type": "float"
          },
          "AFR/Lambda Target": {
            "type": "float",
            "name": "Lambda  Target"
          },
          "CL Lambda Target Error 1": {
            "type": "float",
            "name": "Lambda  Err 1"
          },
          "CL Lambda Target Error 2": {
            "type": "float",
            "name": "Lambda  Err 2"
          },
          "GP Analog 3 - Ext CAN Volts": {
            "type": "float",
            "name": "CAN Volts"
          },
          "GP Analog 2 - Ambient IAT": {
            "type": "integer",
            "name": "Amb IAT"
          },
          "Aux 5 - VTEC Solenoid": {
            "type": "integer",
            "name": "VTEC, yo"
          }
        },
        "showSpecifiedColumnsOnly": true,
        "columnDisplayOrder": [
          "TPS (Main)",
          "Gear",
          "Driving Wheel Speed",
          "MGP",
          "Engine Speed",
          "Lambda 1",
          "Lambda 2",
          "CL Lambda  Fuel  Corr.",
          "Lambda  Fuel  Corr 1",
          "CL Lambda  Fuel  Corr. 2",
          "Lambda  Fuel  Corr 2",
          "AFR/Lambda Target",
          "Lambda  Target",
          "CL Lambda Target Error 1",
          "Lambda  Err 1",
          "CL Lambda Target Error 2",
          "Lambda  Err 2",
          "IAT",
          "Amb IAT",
          "ECT",
          "Oil Temperature",
          "Oil Pressure",
          "Fuel Pressure",
          "VTEC, yo",
          "Fuel Table 1",
          "Fuel Table 2",
          "IAT Fuel Corr.",
          "Accel Fuel",
          "TPS Delta",
          "Injector Duty Cycle",
          "Injection Actual PW",
          "Injector Duty Cycle (Sec)",
          "Injector PW (Sec)",
          "Ignition Angle",
          "Knock Level Detected",
          "Knock Level Normalised",
          "Knock I-Trim Cyl 2",
          "Knock I-Trim Cyl 5",
          "Batt Voltage",
          "CAN Volts",
          "ECU Temperature",
          "Aux 5 - VTEC Solenoid",
          "Lateral (X) Acceleration",
          "Longitudinal (Y) Acceleration",
          "Vertical (Z) Acceleration"
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
          "afrCorrect": {
            "range": [
              -20,
              20
            ]
          },
          "iatCorrect": {
            "range": [
              -6,
              6
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
              20
            ]
          },
          "fuelAccel": {
            "range": [
              0,
              2
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
                    "show": true
                  }
                ]
              },
              {
                "height": "20%",
                "lines": [
                  {
                    "column": "CL Lambda  Fuel  Corr.",
                    "scale": "afrCorrect",
                    "show": true
                  },
                  {
                    "column": "CL Lambda  Fuel  Corr. 2",
                    "scale": "afrCorrect",
                    "show": true
                  },
                  {
                    "column": "IAT Fuel Corr.",
                    "scale": "iatCorrect"
                  }
                ]
              },
              {
                "height": "20%",
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
                  },
                  {
                    "column": "ECU Temperature",
                    "scale": "tempF",
                    "show": true
                  }
                ]
              },
              {
                "height": "20%",
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
                  }
                ]
              }
            ]
          }
        ]
      },
      "avgFuelMixture": {
        "minValue": -18,
        "maxValue": 18.3,
        "minWeight": 0.4,
        "minTotalWeight": 3,
        "ignore": [
          {
            "accel": "Accel Fuel",
            "condition": "accel > 1"
          }
        ]
      },
      "fuelMixtureTarget": {
        "table": [
          [
            14.2,
            14.2,
            14.2,
            14.2,
            14.2,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7
          ],
          [
            14.2,
            14.2,
            14.2,
            14.2,
            14.2,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7
          ],
          [
            14.2,
            14.2,
            14.2,
            14.2,
            14.2,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7
          ],
          [
            14.2,
            14.2,
            14.2,
            14.2,
            14.2,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7
          ],
          [
            14.2,
            14.2,
            14.2,
            14.2,
            14.2,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7,
            14.7
          ],
          [
            14,
            14,
            14,
            14,
            14,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5,
            14.5
          ],
          [
            14,
            14,
            14,
            14,
            14,
            14,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33,
            14.33
          ],
          [
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14
          ],
          [
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14,
            14
          ],
          [
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6,
            13.6
          ],
          [
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1,
            13.1
          ],
          [
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12,
            12
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
          ]
        ]
      },
      "suggestCalc": "afr"
    }
  ]
}
