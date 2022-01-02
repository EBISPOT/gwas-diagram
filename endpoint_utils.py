from logging import ERROR

import numpy as np
import pandas as pd


def validate_paramters(args: dict) -> dict:
    """The parameters received by the endpoints are parsed and validated.py

    Args:
        args {dict} -- dictionary with the argument keys and values.
    Returns:
        dict -- dictionary with the validated arguments ready to be used as filters.
    """

    filterParameters = {}

    # datatype tells if associations or traits are requested:
    if isinstance(args['dataType'], str):
        filterParameters['dataType'] = args['dataType']

    # Parsing parent traits:
    if isinstance(args['parent_term'], str):
        filterParameters['parent_term'] = args['parent_term'].split('|')

    # Parsing pubmed ID:
    filterParameters['pmid'] = args['pmid'] if isinstance(
        args['pmid'], int) else False

    # Parse EFO:
    filterParameters['trait'] = args['trait'] if isinstance(
        args['trait'], str) else False

    # Parse ancestry:
    filterParameters['ancestry'] = args['ancestry'] if isinstance(
        args['ancestry'], str) else False

    # Parse sample:
    filterParameters['sample'] = args['sample'] if isinstance(
        args['sample'], str) else False

    # Parse date:
    if isinstance(args['catalog_date'], str):
        try:
            filterParameters['catalog_date'] = int(
                args['catalog_date'].replace("/", ""))
        except ERROR:
            filterParameters['catalog_date'] = False
    else:
        filterParameters['catalog_date'] = False

    # Parse p-value:
    if isinstance(args['pvalue'], str):
        pval = args['pvalue'].lower()
        scientific = pval.split('e')
        if len(scientific) == 2:
            try:
                filterParameters['pvalue'] = - \
                    int(scientific[1]) - np.log10(float(scientific[0]))
            except ERROR:
                filterParameters['pvalue'] = False
        else:
            try:
                filterParameters['pvalue'] = -1 * np.log10(float(pval))
            except ERROR:
                filterParameters['pvalue'] = False

    else:
        filterParameters['pvalue'] = False

    # Parsing cytological band:
    if 'cytological_band' in args and isinstance(args['cytological_band'], str):
        filterParameters['cytological_band'] = args['cytological_band']

    return filterParameters


def reshape_data(association_df: pd.DataFrame) -> dict:
    """The filtered dataframe is grouped by cytological band and EFO_PARENT then get count

    Arguments: association_df {pd.DataFrame} -- dataframe columns: REGION, EFO_PARENT

    Returns: {dict} -- dictionary with the following structure:
    """

    # The dataframe is grouped by region and EFO_PARENT then get count:
    summary = (
        association_df
        .groupby(['REGION', 'EFO_PARENT'])
        .size()
    )

    # The multi indexed series is then converted into a dictionary:
    dictionary = (
        summary
        .unstack(fill_value=0)
        .to_dict(orient='index')
    )

    # Return dictionary:
    return dictionary


def consolidate(association_df: pd.DataFrame) -> dict:
    """The dataframe is shaped into a dictionary."""

    # Once the data is filtered, we have to reshape the data into the final form
    columns_map = {
        'PUBMEDID': 'pmid',
        'STUDY ACCESSION': 'studyAccession',
        'INITIAL SAMPLE SIZE': 'initialSampleDescription',
        'REPLICATION SAMPLE SIZE': 'replicationSampleDescription',

        'REGION': 'cytologicalBand',
        'CHR_ID': 'chr',
        'CHR_POS': 'pos',
        'CONTEXT': 'mostSevereConsequence',
        'SNP_GENE_IDS': 'targetId',
        'PVALUE_MLOG': 'minusLogPValue',

        'MAPPED_TRAIT': 'trait',
        'DISEASE/TRAIT': 'reportedTrait',
        'EFO_PARENT': 'traitCategory',
    }

    # The dataframe is grouped by region and EFO_PARENT then get count:
    associations = (
        association_df

        # Filtering for columns:
        [list(columns_map.keys())]

        # Rename columns:
        .rename(columns=columns_map)

        # Get unique records:
        .drop_duplicates(keep='first')

        # Sort by genomic location:
        .sort_values(by=['chr', 'pos'])

        # Format datafrme into a dictionary:
        .to_dict(orient='records')
    )

    # Return dictionary:
    return associations
