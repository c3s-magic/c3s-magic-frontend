The goal of this diagnostic is to simulate single-model ensembles from an observational dataset to investigate the effect of observational uncertainy. For further discussion of this synthetic value generator, its general application to forecasts and its limitations, see [Weigel et al. (2008)](https://doi.org/10.1002/qj.210). 

The output is a netcdf file containing the synthetic observations. Due to the sampling of the perturbations from a Gaussian distribution, running the recipe multiple times, with the same observation dataset and input parameters, will result in different outputs.
