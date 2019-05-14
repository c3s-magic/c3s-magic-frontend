The current generation of climate models include the representation of stratospheric processes, as the vertical coupling with the troposphere is important for the weather and climate at the surface [Baldwin and Dunkerton (2001)](https://doi.org/10.1126/science.1063315).

This metric can be used to evaluate the representation of the Northern Annular Mode - NAM [(e.g. Wallace, 2000)](https://doi.org/10.1002/qj.49712656402) in climate simulations, using reanalysis datasets as reference.

The calculation is based on the “zonal mean algorithm” proposed by [Baldwin and Thompson (2009)](https://doi.org/10.1002/qj.479), and is alternative to pressure based or height-dependent methods.

This approach provides a robust description of the stratosphere-troposphere coupling on daily timescales, requiring less subjective choices and a reduced amount of input data. Starting from daily mean geopotential height on pressure levels, the leading empirical orthogonal function/principal component are computed from zonal mean daily anomalies, with the leading principal component representing the zonal mean NAM index. The regression of the monthly mean geopotential height onto this monthly averaged index represents the NAM pattern for each selected pressure level.

The outputs of the procedure are the monthly time series and the histogram of the daily zonal-mean NAM index, and the monthly regression maps for selected pressure levels. The users can select the specific datasets (climate model simulation and/or reanalysis) to be evaluated, and a subset of pressure levels of interest.



<!---
This metric is based on the algorithm proposed by [Baldwin and Thompson, 2009], and requires the daily geopotential height field on pressure levels as input. The method is based on an EOF/PC decomposition of the zonally averaged geopotential height, with the leading pattern of variability representative of the (zonal mean) NAM. The calculation is independently repeated at each available pressure level. The daily index can be used to characterize episodic variability of the stratosphere-troposphere connection, while regression on the monthly averaged index is used to quantify the signature of the NAM on the hemispheric climate.

To evaluate the modelled strat-trop coupling, the metric is based on the spatial patterns of the zonal mean NAM index. This is obtained by projecting monthly anomalies of the geopotential height field onto the monthly averaged index, then normalized. The well-known annular pattern emerges at upper levels, and it is generally less longitudinally symmetric moving towards the surface.

Having calculated the reanalysis-based spatial patterns, it is possible to compute the difference between these patterns and those reproduced by climate models. The resulting spatial patterns can be used to assess the differences in the strength of this mode of variability and the latitudinal extent.

![example output](diagnosticsdata/stratosphere-troposphere/test250.png "Example Output")
--->
