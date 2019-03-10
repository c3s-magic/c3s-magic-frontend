Part of the ESMValTool recipe MId-Latitude Evaluation System (MiLES), the teleconnection diagnostic is calculated using daily 500hPa geopotential height data (with data interpolated on a common 2.5x2.5 grid).

The Z500 Empirical Orthogonal Functions are Based on SVD. The first 4 EOFs for North Atlantic (over the 90W-40E 20N-85N box) and Northern Hemisphere (20N-85N) or a custom region are computed. North Atlantic Oscillation, East Atlantic Pattern, and Arctic Oscillation can be evaluated. Figures showing linear regression of PCs on monthly Z500 are provided. PCs and eigenvectors, as well as the variances explained are provided in NetCDF4 Zip format.

The teleconnection diagnostic is implemented in the ESMValTool recipe MId-Latitude Evaluation System (MiLES), also available as [stand-alone package](https://github.com/oloapinivad/MiLES).
<!--
![example output](diagnosticsdata/teleconnections/EOF1_MPI-ESM-P_r1_1951_2005_DJF.png "NAO EOF1")
-->
