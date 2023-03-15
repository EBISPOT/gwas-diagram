
import pandas as pd


def data_filter(association_df: pd.DataFrame, filter_parameters: dict) -> pd.DataFrame:
    """Filtering the association data.

    Args:
        association_df (pd.DataFrame): A dataframe containing the association data.
        filter_parameters (dict): A dictionary containing the filter parameters.
    Returns:
        pd.DataFrame: A dataframe containing the filtered association data.
    """

    # Create a copy of the association df
    filtered_df = association_df.copy(deep=True)

    if 'parent_term' in filter_parameters and filter_parameters['parent_term']:
        filtered_df = filtered_df.loc[filtered_df.EFO_PARENT.isin(
            filter_parameters['parent_term'])]

    # {"pmid": 123, "efo": "EFO_000123", "pvalue": false}
    if filter_parameters['pmid']:
        filtered_df = filtered_df.loc[filtered_df.PUBMEDID == str(
            filter_parameters['pmid'])]

    if filter_parameters['trait']:
        filtered_df = filtered_df.loc[
            (filtered_df['MAPPED_TRAIT'].str.match(
                pat='.*{}.*'.format(filter_parameters['trait'])))
            | (filtered_df['DISEASE/TRAIT'].str.match(pat='.*{}.*'.format(filter_parameters['trait'])))
        ]

    if filter_parameters['pvalue']:
        filtered_df = filtered_df.loc[filtered_df.PVALUE_MLOG >=
                                      filter_parameters['pvalue']]

    if filter_parameters['catalog_date']:
        filtered_df = filtered_df.loc[filtered_df.CATALOG_DATE <=
                                      filter_parameters['catalog_date']]

    if filter_parameters['sample']:
        filtered_df = (
            filtered_df
            .loc[
                (~filtered_df['SAMPLE_DESCRIPTION'].isna())
                & (filtered_df['SAMPLE_DESCRIPTION'].str.match(pat='.*{}.*'.format(filter_parameters['sample'])))
            ]
        )

    if filter_parameters['ancestry']:
        filtered_df = (
            filtered_df
            .loc[
                (~filtered_df['BROAD ANCESTRAL CATEGORY'].isna())
                & (filtered_df['BROAD ANCESTRAL CATEGORY'].str.match(pat='.*{}.*'.format(filter_parameters['ancestry'])))
            ]
        )

    # Filter based on the requested data type:
    if filter_parameters['dataType'] == 'traits':
        filtered_df = (
            filtered_df[['REGION', 'EFO_PARENT', 'MAPPED_TRAIT']]
            .drop_duplicates()
        )

    # Filter based on the cytological band:
    if 'cytological_band' in filter_parameters and filter_parameters['cytological_band']:
        filtered_df = filtered_df.loc[filtered_df.REGION ==
                                      filter_parameters['cytological_band']]

    return filtered_df
