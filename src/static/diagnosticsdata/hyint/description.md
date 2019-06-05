The Earth’s hydrological cycle is of key importance both for the climate system and society. 
For example, the intensity and distribution of precipitation determines the availability or scarcity of fresh water in a certain region, and it is also related to the severity of hazardous events such as flooding or droughts. 

The simple investigation of average precipitation quantities can clearly hide some of the most relevant aspects of the hydrological cycle and its extremes [(e.g., Giorgi et al., 2014)](https://doi.org/10.1002/2014JD022238). More in general, temperature and precipitation extremes have been the focus of recent climate studies attempting to capture the most relevant component of climate variability and impact on society in a changing climate.

A particular effort has been dedicated to developing and standardising indices that can be adopted for investigation studies with observations and climate models. 

This tool was developed to calculate a number of hydroclimatic and climate extremes indices and allow a multi-index evaluation of climate models. The tool first computes a set of 6 indices that allow to evaluate the response of the hydrological cycle to global warming with a joint view of both wet and dry extremes. 
The indices were selected following [Giorgi et al. (2014)](https://doi.org/10.1002/2014JD022238) and include the simple precipitation intensity index (SDII), the maximum dry spell length (DSL) and wet spell length (WSL), the hydroclimatic intensity index (HY-INT), which is a measure of the overall behaviour of the hydroclimatic cycle [(Giorgi et al., 2011)](https://doi.org/10.1175/2011JCLI3979.1), and the precipitation area (PA), i.e. the area over which at any given day precipitation occurs [(Giorgi et al., 2014)](https://doi.org/10.1002/2014JD022238). 

Secondly, also a selection of the 27 temperature and precipitation -based indices of extremes from the Expert Team on Climate Change Detection and Indices (ETCCDI) produced by the climdex (https://www.climdex.org) library can be ingested to produce a multi-index analysis. The tool allows then to perform a subsequent analysis of the selected indices calculating timeseries and trends over predefined continental areas, normalized to a reference period. Trends are calculated using the R lm function and significance testing performed with a Student T test on non-null coefficients hypothesis. Trend coefficients are stored together with their statistics which include standard error, t value and Pr(>|t|). 
The tool can then produce a variety of types of plots including global and regional maps, maps of comparison between models and a reference dataset, timeseries with their spread, trend lines and summary plots of trend coefficients.

The following are examples of output figures type-1, type-12, type-14 and type-15 for selected hyint and ETCCDI indices, individual models or ensemble of CMIP5 models.

![example output](diagnosticsdata/hyint/hyint_maps.png "Example Output")
Mean hydroclimatic intensity (figure type 1) for the EC-EARTH model historical + rcp8.5 projection over 1976-2099.

![example output](diagnosticsdata/hyint/hyint_timeseries.png "Example Output")
Timeseries for multiple indices and regions (figure type 12) for the ACCESS1-0 model historical + RCP8.5 projection over 1976-2099.

![example output](diagnosticsdata/hyint/hyint_trends1.png "Example Output")
Multi-region trend coefficients over selected ETCDDI indices (figure type 14) for rcp85 2006-2099 future projection normalized to the 1976-2005 historical period.

![example output](diagnosticsdata/hyint/hyint_trends2.png "Example Output")
Multi-model trend coefficients over selected indices (figure type 15) for rcp85 2006-2099 future projection normalized to the 1976-2005 historical period.

