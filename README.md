# quiver

Quick interactive visualizations in R. Powered by D3, viewed in the browser.

This package currently includes three functions:

 - `uhist()` plots histograms, allowing the user to view one variable at a time from the provided data frame.
 - `mplot()` produces scatterplots from the provided data frame. The user can interactively select the x and y variables as well as variables for coloring the points or resizing the points.
 - `iview()` views the provided data frame in a table with easy scrolling and sorting.

All of these functions can be called on a matrix or data frame, e.g. `uhist(X)` for data frame `X`.

Install from GitHub from within R using the devtools package:

```
install.packages("devtools")
library(devtools)
install_github("aescherling/quiver")
```