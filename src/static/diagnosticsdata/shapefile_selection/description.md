Impact modelers are often interested in data for irregular regions best defined by a shapefile. 

With the shapefile selector tool, the user can extract time series or CII data for a user defined region. The user provides a shapefile that includes one or several polygons. For each polygon, a new timeseries, or CII, is produced with only one time series per polygon. The spatial information is reduced to a representative point for the polygon ('representative') or as an average of all grid points within the polygon boundaries ('mean_inside'). If there are no grid points strictly inside the polygon, the 'mean_inside' method defaults to 'representative' for that polygon. 

An option for displaying the grid points together with the shapefile polygon allows the user to assess which method is most optimal. In case interpolation to a high input grid is necessary, this can be provided in a pre-processing stage. 

Outputs are in the form of a NetCDF file, or as ascii code in csv format.

<!--
![example output](diagnosticsdata/shapefile_selection/OBS_CRU_reanaly_1_T2Ms_tas_1990-1994.png "Example Output")
-->
