The Earth’s hydrological cycle is of key importance both for the climate system and society. 
For example, the intensity and distribution of precipitation determines the availability or scarcity of fresh water in a certain region, and it is also related to the severity of hazardous events such as flooding or droughts. 

The simple investigation of average precipitation quantities can clearly hide some of the most relevant aspects of the hydrological cycle and its extremes [(e.g., Giorgi et al., 2014)](https://doi.org/10.1002/2014JD022238). More in general, temperature and precipitation extremes have been the focus of recent climate studies attempting to capture the most relevant component of climate variability and impact on society in a changing climate.

A particular effort has been dedicated to developing and standardising indices that can be adopted for investigation studies with observations and climate models. 

This tool was developed to calculate a number of hydroclimatic and climate extremes indices and allow a multi-index evaluation of climate models. The tool first computes a set of 6 indices that allow to evaluate the response of the hydrological cycle to global warming with a joint view of both wet and dry extremes. 
The indices were selected following [Giorgi et al. (2014)](https://doi.org/10.1002/2014JD022238) and include the simple precipitation intensity index (SDII), the maximum dry spell length (DSL) and wet spell length (WSL), the hydroclimatic intensity index (HY-INT), which is a measure of the overall behaviour of the hydroclimatic cycle [(Giorgi et al., 2011)](https://doi.org/10.1175/2011JCLI3979.1), and the precipitation area (PA), i.e. the area over which at any given day precipitation occurs [(Giorgi et al., 2014)](https://doi.org/10.1002/2014JD022238). 

Secondly, also a selection of the 27 temperature and precipitation -based indices of extremes from the Expert Team on Climate Change Detection and Indices (ETCCDI) produced by the climdex (https://www.climdex.org) library can be ingested to produce a multi-index analysis. The tool allows then to perform a subsequent analysis of the selected indices calculating timeseries and trends over predefined continental areas, normalized to a reference period. Trends are calculated using the R lm function and significance testing performed with a Student T test on non-null coefficients hypothesis. Trend coefficients are stored together with their statistics which include standard error, t value and Pr(>|t|). 
The tool can then produce a variety of types of plots including global and regional maps, maps of comparison between models and a reference dataset, timeseries with their spread, trend lines and summary plots of trend coefficients.

<!---change the following paragraph if hyint timeseries will not be merged-->
In the following example figures we present the output figure type-1 for the hyint index calculated for EC-Earth rcp85 multi year mean over 1976-2100 with boxes for user-selected regions, and output figure type-12 and type-14 for selected indices and regions calculated for EC-Earth rcp85 over 1976-2100.

![example output](diagnosticsdata/hyint/hyint_EC-Earth_rcp85_r8i1p1_r320x160_1976_2100_ALL_myear-mean_Globe_map.png "Example Output")

<!---plots to b eremoved if hyint timeseries will not be merged-->
![example output](diagnosticsdata/hyint_timeseries/hyint_timeseries.png "Example Output")

![example output](diagnosticsdata/hyint_timeseries/hyint_trends1.png "Example Output")
![example output](diagnosticsdata/hyint_timeseries/hyint_trends2.png "Example Output")
