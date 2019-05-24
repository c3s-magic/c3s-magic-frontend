Meteorological drought can in its simplest form be described by a lack of precipitation. First, a wet day threshold is set, which can be either a limit related to measurement accuracy, or more directly process related to an amount that would break the drought. 

The user should define plim and frlim, where plim is the limit for a day to be considered dry (mm/day), and frlim is the shortest number of consecutive dry days for entering statistic on frequency of dry periods.

The diagnostic calculates the longest period of consecutive dry days, which is an indicator of the worst drought in the time series. Further, the diagnostic calculates the frequency of dry periods longer than a user defined number of days (frlim).

