[RainFARM](https://github.com/jhardenberg/RainFARM.jl) is a Julia library and command-line tools implementing the RainFARM stochastic precipitation downscaling method adapted for climate models. 

Precipitation extremes and small-scale variability are essential drivers in many climate change impact studies. However, the spatial resolution currently achieved by global and regional climate models is still insufficient to correctly identify the fine structure of precipitation intensity fields. In the absence of a proper physically based representation, this scale gap can be at least temporarily bridged by adopting a stochastic rainfall downscaling technique [(Rebora et al, 2006)](https://doi.org/10.1175/JHM517.1). 

With this aim, the Rainfall Filtered Autoregressive Model (RainFARM) was developed to apply the stochastic precipitation downscaling method to climate models.
The stochastic method is a weather generator which allows to generate fine-scale precipitation fields with a realistic correlation structure, extrapolating to fine scales information  simulated by climate models at regional scales.  RainFARM exploits the nonlinear transformation of a Gaussian random precipitation field obtained extrapolating to small scales the large-scale power spectrum of the fields. It conserves average precipitation at coarse scale [(Rebora et al. 2006](https://doi.org/10.1175/JHM517.1), [D'Onofrio et al. 2014)](https://doi.org/10.1175/JHM-D-13-096.1). 
Description of user-changeable settings on webpage 1) Selection of model; 2) Selection of period; 3) Selection of longitude and latitude.

Figures: original precipitation (mm/day) field and the downscaled field for the EC-Earth model over central Europe.

