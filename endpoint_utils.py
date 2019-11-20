import numpy as np

def validate_paramters(args):
    # TODO: Investigate if it make sense to export and ordered dictionary, where the empty keys are dropped.
    # It might be slower to generate the output, but might be faster to render on the frontend.
    # Not too high priority

    # These parameters are filled and validated:
    filterParameters = {}

    # Parsing parent traits:
    if isinstance(args['parent_term'], str):
        filterParameters['parent_term'] = args['parent_term'].split('|')

    # Parsing pubmed ID:
    filterParameters['pmid'] = args['pmid'] if isinstance(args['pmid'], int) else False

    # Parse EFO:
    filterParameters['trait'] = args['trait'] if isinstance(args['trait'],str) else False

    # Parse ancestry:
    filterParameters['ancestry'] = args['ancestry'] if isinstance(args['ancestry'], str) else False

    # Parse sample:
    filterParameters['sample'] = args['sample'] if isinstance(args['sample'],str) else False

    # Parse date:
    if isinstance(args['catalog_date'], str):
        try:
            filterParameters['catalog_date'] = int(args['catalog_date'].replace("/", ""))
        except:
            filterParameters['catalog_date'] = False
    else:
        filterParameters['catalog_date'] = False

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
    summary = association_df[['REGION', 'EFO_PARENT', 'MAPPED_TRAIT']].drop_duplicates().groupby(['REGION', 'EFO_PARENT']).size()

    # The multi indexed series is then converted into a dictionary:
    dictionary = summary.unstack(fill_value = 0).to_dict(orient='index')

    # Return dictionary:
    return dictionary

