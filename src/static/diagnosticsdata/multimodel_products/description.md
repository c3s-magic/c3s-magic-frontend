The goal of this diagnostic is to compute the multi-model ensemble mean for a set of models selected by the user for individual variables and different temporal resolutions (annual, seasonal, monthly). 

After selecting the region (defined by the lowermost and uppermost longitudes and latitudes), the mean for the selected reference period is subtracted from the projections in order to obtain the anomalies for the desired period. 

In addition, the recipe computes the percentage of models agreeing on the sign of this anomaly, thus providing some indication on the robustness of the climate signal. 

The output of the recipe consists of a colored map showing the time average of the multi-model mean anomaly and stippling to indicate locations where the percentage of models agreeing on the sign of the anomaly exceeds a threshold selected by the user. Furthermore, a time series of the area-weighted mean anomaly for the projections is plotted. 
For the plots, the user can select the length of the running window for temporal smoothing and choose to display the ensemble mean with a light shading to represent the spread of the ensemble or choose to display each individual models.


