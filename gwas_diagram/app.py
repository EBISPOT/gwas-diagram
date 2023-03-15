import json
import logging
import os
import sys

# Import flask:
from flask import Blueprint, Flask, render_template
from flask_restx import Api, Resource

# Importing custom functions:
import gwas_diagram.endpoint_utils as eu
from gwas_diagram.configuration.properties import Configuration
from gwas_diagram.data_filter.data_filter import data_filter
from gwas_diagram.data_loader.data_loader import DataLoader

app = Flask(__name__)

if 'BASE_PATH' not in os.environ:
    os.environ['BASE_PATH'] = ""

bp = Blueprint('diagram', __name__, url_prefix=os.environ['BASE_PATH'])

# Setting up logging here.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(module)s - %(funcName)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logging.StreamHandler(sys.stderr)

# Initialize API with swagger parameters:
api = Api(bp, default=u'GWAS Catalog diagram',
          default_label=u'GWAS Catalog updated diagram',
          description='This application filters GWAS Catalog association data to generate diagram.',
          doc='/documentation/',
          title='API documentation')

app.register_blueprint(bp)

# List of parameters to be used to filter data:
filterParams = api.parser()
filterParams.add_argument('pmid', type=int, required=False,
                          help='Pubmed ID of a requested publication.')
filterParams.add_argument('trait', type=str, required=False,
                          help='Trait of ontology term.')
filterParams.add_argument('pvalue', type=str, required=False,
                          help='Upper boundary of the p-value (eg. 1e-8).')
filterParams.add_argument('sample', type=str, required=False,
                          help='Part of the sample description.')
filterParams.add_argument('ancestry', type=str, required=False,
                          help='Broad ancestry description of the samples.')
filterParams.add_argument('catalog_date', type=str, required=False,
                          help='Upper boundary for the catalog publish date (eg. 2014-01-03).')
filterParams.add_argument('parent_term', type=str, required=False,
                          help='Pipe separated list of required parent terms.')
filterParams.add_argument('dataType', type=str, required=False,
                          help='Requested data type: "traits" or "associations".')
filterParams.add_argument('cytological_band', type=str,
                          required=False, help='Cytological band of the sample.')

# Loading data - loaded once, filtered after:
gwas_data_loader = DataLoader(Configuration)

gwas_data = gwas_data_loader.get_data()


@api.route('/v1/filter')
@api.expect(filterParams, validate=True)
class diagramFilter(Resource):

    @api.doc('Filter diagram data')
    def post(self):
        global gwas_data

        # Parsing and validating input paramters
        parameters = eu.validate_paramters(filterParams.parse_args())
        logging.info(
            f'Diagram filter. Parsed parameters: {json.dumps(parameters)}')

        # Get filtered dataset:
        filteredData = data_filter(gwas_data, parameters)
        logging.info(
            f'Number of associations/traits after filtering: {len(filteredData)}')

        # reshape the filtered data:
        reshaped_data = eu.reshape_data(filteredData)

        return reshaped_data


@api.route('/v1/retrieve')
@api.expect(filterParams, validate=True)
class dataRetriever(Resource):

    @api.doc('Extract diagram data for a given cytoloical band and trait category.')
    def post(self):
        global gwas_data

        # Parsing and validating input paramters
        parameters = eu.validate_paramters(filterParams.parse_args())
        logging.info(
            f'Association retriever. Parsed parameters: {json.dumps(parameters)}')

        # For retrieving associations, the dataType needs to be set null:
        if 'dataType' in parameters:
            parameters['dataType'] = None

        # Filter associations based on input parameters:
        filteredData = data_filter(gwas_data, parameters)

        # reshape the filtered data:
        reshaped_data = eu.consolidate(filteredData)
        logging.info(f'Number of associations returned: {len(reshaped_data)}')

        return reshaped_data

# The following endpoint serves testing purposes only to demonstrate the flexibility of the template generation.


@app.route('/diagram')
def template_test():
    return render_template('diagram.html')


if __name__ == '__main__':

    # Setting up the server:
    app.run(debug=False)
