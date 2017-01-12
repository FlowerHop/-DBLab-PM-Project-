# -DBLab-Alarm-Project-
This is a project about my master's thesis. I plant to make an physiological parameters monitoring system combination of the indoor location system.

## Todo List
1. Build environment 
2. Database
3. API <-
4. UI

## Data Format
1. Biosignal 
   {
     inPlace, // where sent from 
     bioWatchID, // what sent from
     index, // numbers sent since bioWatch has turned on
     pulse, 
     rssi, 
     timestamp // the timing receive 
   }

2. Bioframe (sent from Biowatch) 
   {
     type,
     remote16,
     rssi,
     receiveOptions,
     data: <Buffer 30 32 00 00 00 00 01 74>
     ( first two: 30 32 -> Biowatch ID )
     ( then: 00 00 00 00 01 -> index )
     ( last one: 74 -> pulse )
   }
