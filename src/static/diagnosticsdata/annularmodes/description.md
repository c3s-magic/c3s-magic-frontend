The current generation of climate models include the representation of stratospheric processes, as the vertical coupling with the troposphere is important for the weather and climate at the surface [Baldwin and Dunkerton (2001)](https://doi.org/10.1126/science.1063315).

This metric can be used to evaluate the representation of the Northern Annular Mode - NAM [(e.g. Wallace, 2000)](https://doi.org/10.1002/qj.49712656402) in climate simulations, using reanalysis datasets as reference.

The metric calculation is based on the algorithm proposed by [Baldwin and Thompson (2009)](https://doi.org/10.1002/qj.479), and requires the daily geopotential height field on pressure levels as input. The method is based on an EOF/PC decomposition of the zonally averaged geopotential height, with the leading pattern of variability representative of the (zonal mean) NAM. The calculation is independently repeated at each available pressure level. The daily index can be used to characterize episodic variability of the stratosphere-troposphere connection, while regression on the monthly averaged index is used to quantify the signature of the NAM on the hemispheric climate.

For the diagnostic “Indices of annular modes”, two kind of outputs are produced. The first product is the plot of a monthly timeseries of the zonal mean NAM index, from which information on the yearly variability of this pattern can be visualized, and long-term trends can be calculated. When the index is strongly positive, the polar vortex in the stratosphere is concurrently stronger, and positive geopotential height anomalies are found at midlatitudes. The opposite for the other polarity of this index.

The monthly averaging smooths fluctuations of the zonal mean index at higher frequencies, which can however be important for the coupling between the troposphere and the stratosphere. For this reason, the daily values of the index are used to build a frequency histogram. From the statistical properties of the resulting probability density function, it is possible to evaluate the realism of a simulated stratospheric variability, by comparing against reanalysis datasets.

Note this Metric is based on the same calculations as the Stratosphere Troposphere Coupling metric.

<!--

![example output](diagnosticsdata/annularmodes/CMIP5_MPI-ESM-MR_amip_r1i1p1_1979-2008_250hPa_mo_ts.png "Example Output")

![example output](diagnosticsdata/annularmodes/CMIP5_MPI-ESM-MR_amip_r1i1p1_1979-2008_250hPa_da_pdf.png "Example Output")


-->
