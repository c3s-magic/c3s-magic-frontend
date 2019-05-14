The goal of this diagnostic is to compute time series of a number of extreme events that are relevant for the insurance industry: heatwave, coldwave, heavy precipitation, drought and high wind. These indices are based on the ETCCDI indices, and there are currently 5 available for extreme heat (t90p), cold (t10p), wind (wx), drought(cdd) and flooding (rx5day).
Then, the user can combine these different components given weights for each of them. The result is an index similar to the Climate Extremes Index (CEI; Karl et al., 1996), the modified CEI (mCEI; Gleason et al., 2008) or the Actuaries Climate Index (ACI; American Academy of Actuaries, 2018). 

The output consists of a netcdf file containing the area-weighted and multi-metric index. 

This recipe can be applied to data with any temporal resolution, and the running average is computed based on the user-defined window length (e.g. a window length of 5 would compute the 5-years running mean to the individual index).
