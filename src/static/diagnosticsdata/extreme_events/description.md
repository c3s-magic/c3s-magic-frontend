This diagnostic uses the standard climdex.pcic.ncdf R library to compute the 27 climate change indices specified by the joint CCl/CLIVAR/JCOMM Expert Team (ET) on Climate Change Detection and Indices http://etccdi.pacificclimate.org/. The needed input fields are daily average precipitation flux and minimum, maximum and average daily surface temperatures. The recipe reproduces panels of figure 9.37 of the IPCC AR5 report, producing both a Gleckler plot, with relative error metrics for the CMIP5 temperature and precipitation extreme indices, and timeseries plots comparing the enesemble spread with observations. For plotting 1 to 4 observational reference datasets are supported. If no observational reference datasets are given, the plotting routines do not work, however, index generation without plotting is still possible. All datasets are regridded to a common grid and considered only over land.

In the following figures we show examples for the two figures produced by the diagnostic. 

![example output](diagnosticsdata/extreme_events/gleckler.png "Example of Glecker plot")

A portrait plot of relative error metrics for the CMIP5 temperature and precipitation extreme indices. Reproduces Fig. 9.37 of the IPCC AR5 report, Chapter 9.


![example output](diagnosticsdata/extreme_events/cdd_timeseries.png "Example of timeseries plot")

Timeseries of Consecutive Dry Days index for CMIP5 models.

