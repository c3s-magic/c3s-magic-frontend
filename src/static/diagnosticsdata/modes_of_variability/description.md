The goal of this recipe is to compute modes of variability from a reference/observational dataset and a set of climate projections and calculate the Root Mean Square Error (RMSE) between the mean anomalies obtained for the clusters from the reference and projection data sets. 
This is done through K-means clustering applied either directly to the spatial data or after computing the EOFs. 

The user can specify the number of clusters to be computed. 

The recipe's output consist of netcdf files containing the time series of the cluster occurrences, the mean anomaly corresponding to each cluster at each location, and the corresponding p-value for both the observed and projected weather regimes and the RMSE between them.

