import numpy as np

def validate_paramters(args):

    # These parameters are filled and validated:
    filterParameters = {}

    # Parsing pubmed ID:
    filterParameters['pmid'] = args['pmid'] if isinstance(args['pmid'], int) else False

    # Parse EFO:
    filterParameters['efo'] = args['efo'] if isinstance(args['efo'],str) else False

    # Parse p-value:
    if isinstance(args['pvalue'], str):
        pval = args['pvalue'].lower()
        scientific = pval.split('e')
        if len(scientific) == 2:
            try:
                filterParameters['pvalue'] = -int(scientific[1]) - np.log10(float(scientific[0]))
            except:
                filterParameters['pvalue'] = False
        else:
            try:
                filterParameters['pvalue'] = -1 * np.log10(float(pval))
            except:
                filterParameters['pvalue'] = False

    else:
        filterParameters['pvalue'] = False

    return(filterParameters)


def reshape_data(association_df):
    ## Once the data is filtered, we have to reshape the data into the final form

    # The dataframe is grouped by region and EFO_PARENT then get count:
    summary = association_df.groupby(['REGION', 'EFO_PARENT']).size()

    # The multi indexed series is then converted into a dictionary:
    dictionary = summary.unstack().to_dict(orient='index')

    # Return dictionary:
    return dictionary

