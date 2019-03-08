# Help

The MAGIC portal provides the functions as requested in the C3S tender “Global Climate Projections: Data Access, product
generation and impact of front-line developments” (GCP).

#### Usage
* To see pre-calculated quality indices of global circulation models, go to the [Metrics & Diagnostics](#/diagnostics) section and
navigate to your metric of choice.
* For cross-domain derived diagnostics, go to the [Tailored Products](#/tailoredproducts) page en select a diagnostic.
* To re-evaluate a metric with customized parameters on a CMIP5 dataset, sign in with your BADC/CEDA OpenID and navigate to the metric of
choice. Then click the *Calculate metric* button to enter the metric configuration page. Choose the configuration parameters
and select the input dataset of the assessment tool, and the resulting processing job will be scheduled onto the JASMIN cluster and listed in
your job list. Your job list and basket can be found on the [Calculate](#/calculate/) page.
* For a simple exploration and visualization or download of CMIP-compliant GCM output, go to [Explore Data](#/esgfsearch) and start browsing.

#### Metric documentation

The documentation for the metrics and diagnostics found in this portal has been collected in the ESMValTool Documentation page](https://esmvaltool.readthedocs.io)

#### Software documentation

The documentation for the software used to run his portal has been collected in the C3S Magic Documentation page](https://c3smagic.readthedocs.io)

#### Advanced Viewers

This portal comes with two dataset viewers aimed at metric and portal developers. The [DataSet Viewer](#/adagucviewer) allows a user to preview all the datasets configured (including custom styling) in this server.

Our advanced adaguc viewer is available for expert users to browse and inspect available datasets. There you can combine different layers and change their styling individually. It allows you to view and set other NetCDF dimensions, like elevation, member, ensemble and threshold. To browse our datasets, first click on the big gear and then on the AutoWMS menu. On the right pane you can explore our datasets. Open it [here](/adaguc-viewer) 
