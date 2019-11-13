from flask import Flask, request, send_file,render_template
from flask_restplus import Resource, Api, reqparse

# from flask_cors import CORS
from flask import Blueprint, url_for
import sys,os
# from urllib.parse import unquote

# Import logging related functions:
# import logging

# Importing custom functions:
import endpoint_utils as eu
from configuration.properties import Configuration
from data_loader.data_loader import load_data
from data_filter.filter import filter

app = Flask(__name__)

if 'BASE_PATH' not in os.environ:
    os.environ['BASE_PATH'] = ""

bp = Blueprint('diagram', __name__, url_prefix=os.environ['BASE_PATH'])

# Initialize API with swagger parameters:
api = Api(bp, default=u'GWAS Catalog diagram',
          default_label=u'GWAS Catalog updated diagram',
          description='This application filters GWAS Catalog association data to generate diagram.',
          doc='/documentation/',
          title = 'API documentation')

app.register_blueprint(bp)

# Preparing for filter paramters:
fiterParams = api.parser()
fiterParams.add_argument('pmid', type=int, required=False, help='Pubmed ID of a requested publication.')
fiterParams.add_argument('efo', type=str, required=False, help='EFO id of the term.')
fiterParams.add_argument('pvalue', type=str, required=False, help='Upper boundary of the p-value (eg. 1e-8).')
fiterParams.add_argument('catalog_date', type=str, required=False, help='Upper boundary for the catalog publish date (eg. 2014-01-03).')


# Enabling cross-site scripting (might need to be removed later):
# cors = CORS(app)

# Parameters for filtering template spreadsheets:
# fiterParams = api.model( "Diagram data filter application",{
#     'pmid' : fields.String(description="Pubmed ID of a requested publication", required=False, default=False),
#     'efo' : fields.String(description="EFO id of the term", required=False, default=False),
#     'pvalue' : fields.String(description="Upper boundary of the p-value (eg. 1e-8)", required=False, default=False),
# })

# Loading data - loaded once, filtered after:
parent_mapping_file = Configuration.parent_mapping_file
association_file = Configuration.association_file
gwas_data = load_data(parent_mapping_file,association_file)

@api.route('/v1/filter')
@api.expect(fiterParams, validate=True)
class diagarmFilter(Resource):

    @api.doc('Filter diagram data')
    def post(self):
        global gwas_data

        # Parsing and validating input paramters
        parameters = eu.validate_paramters(fiterParams.parse_args())
        print(parameters)

        # Get filtered dataset:
        filteredData = filter(gwas_data, parameters)

        # reshape the filtered data:
        reshaped_data = eu.reshape_data(filteredData)

        return reshaped_data

# The following endpoint serves testing purposes only to demonstrate the flexibility of the template generation.
@app.route('/diagram')
def template_test():
    return render_template('diagram.html')

if __name__ == '__main__':
    app.run(debug=False)

    # Setting up logging here.

