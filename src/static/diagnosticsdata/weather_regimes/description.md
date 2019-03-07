Part of the ESMValTool recipe MId-Latitude Evaluation System (MiLES), the weather regimes diagnostic is calculated using daily 500hPa geopotential height data (with data interpolated on a common 2.5x2.5 grid) and provides the following diagnostics':'

* North Atlantic Weather Regimes':' 

Following k-means clustering of 500hPa geopotential height. 4 weather regimes over North Atlantic (80W-40E 30N-87.5N) are evaluated using anomalies from daily seasonal cycle. This is done retaining the first North Atlantic EOFs which explains the 80% of the variance to reduce the phase-space dimensions and then applying k-means clustering using Hartigan-Wong algorithm with k=4. Figures report patterns and frequencies of occurrence. NetCDF4 Zip data are saved. Only 4 regimes and DJF supported so far.

The diagnostic is implemented in the ESMValTool recipe MId-Latitude Evaluation System (MiLES), also available as [stand-alone package](https://github.com/oloapinivad/MiLES). 

![example output](diagnosticsdata/teleconnections/Regime2_MPI-ESM-P_r1_1951_2005_DJF.png "Regimes")


