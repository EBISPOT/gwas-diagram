# Experimenting with the GWAS Catalog diagram

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a84a757cdf8d4cf5b27c0b2eb4f0844d)](https://app.codacy.com/gh/DSuveges/gwas-diagram?utm_source=github.com&utm_medium=referral&utm_content=DSuveges/gwas-diagram&utm_campaign=Badge_Grade_Settings)

## What do we have now

1. Exported GWAS Catalog files are read and compiled into a pandas dataframe.
2. The dataframe is persisted on disk in a pickle file.
3. The filtering endpoint of the REST API accepts parameters to filter associations at `/v1/annotations` or `/v1/histogram` depending on whether you want a circle plot that aggregates associations within a region + parent trait, or a histogram view of all associations.
4. Response is an ideogram.js annotations JSON serialised object
5. Plotting is done by the [Ideogram.js](https://eweitz.github.io/ideogram/) JavaScript library

## TODO
- [ ] Modify the ideogram.js to meet our needs
- [ ] Frontend look and feel 
- [ ] Deployment
- [ ] Potentially enforce constraints to avoid plotting too many tracks (ideogram limit is 10)
- [ ] handling large response payloads

### Run locally (with docker)

```
# clone this repo 
git clone https://github.com/EBISPOT/gwas-diagram.git
cd gwas-diagram
# build docker image
docker build -t gwas-diagram .
# create a log dir
`mkdir logs`
# run the app on port 9000
`docker run -i -v ${PWD}:/application -p 9000:8000 gwas-diagram`
#The first time around the app will need to pull the data, after that it'll be pickled on disk (and you can omit the `--timeout-keep-alive 1000` timeout for future runs)
```
visit <http://localhost:9000/docs> in your browser to try out the REST API.

#### Create a diagram
With the REST api up on <http://localhost:9000>, open [diagram.html](gwas_diagram/templates/diagram.html) in your browser


### REST endpoint usage

Example for getting a single pmid of data

```bash
curl -X 'GET' \
  'http://0.0.0.0:9000/v1/annotations?pmid=36848389' \
  -H 'accept: application/json'
```

#### Response:

see [ideogram.js](https://github.com/eweitz/ideogram/blob/master/api.md) for more details.

```json

{
  "keys": [
    "name",
    "start",
    "length",
    "trackIndex"
  ],
  "annots": [
    {
      "chr": "10",
      "annots": [
        "rs1",
        1,
        1,
        1
      ]
    }
  ]
}
...
```



## Example diagram:

![Example of six parent trait categories represented](gwas_diagram/ideogram_6_traits.png)

![Example of a single chromosome view, after clicking the deisired chromosome or point](gwas_diagram/single_chromosome_view.png)

![Example of histogram of all associations for Cardiovascular disease](gwas_diagram/histogram_cardiovascular_disease.png)