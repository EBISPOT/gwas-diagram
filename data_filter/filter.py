

def filter(association_df, filter_parameters):
    # Create a copy of the association df
    filtered_df = association_df.copy(deep = True)

    print('[Info] Number of associations: {}'.format(len(filtered_df)))

    # {"pmid": 123, "efo": "EFO_000123", "pvalue": false}
    if filter_parameters['pmid']:
        print(filter_parameters['pmid']);
        filtered_df = filtered_df.loc[ filtered_df.PUBMEDID == filter_parameters['pmid']]

    if filter_parameters['efo']:
        filtered_df = filtered_df.loc[ filtered_df.MAPPED_TRAIT_URI == filter_parameters['efo']]

    if filter_parameters['pvalue']:
        filtered_df = filtered_df.loc[ filtered_df.PVALUE_MLOG >= filter_parameters['pvalue']]

    if filter_parameters['catalog_date']:
        filtered_df = filtered_df.loc[filtered_df.CATALOG_DATE <= filter_parameters['catalog_date']]

    if filter_parameters['sample']:
        filtered_df = filtered_df.loc[(~filtered_df['SAMPLE_DESCRIPTION'].isna()) & (filtered_df['SAMPLE_DESCRIPTION'].str.match(pat = '.*{}.*'.format(filter_parameters['sample'])))]

    if filter_parameters['ancestry']:
        filtered_df = filtered_df.loc[(~filtered_df['BROAD ANCESTRAL CATEGORY'].isna()) & (filtered_df['BROAD ANCESTRAL CATEGORY'].str.match(pat = '.*{}.*'.format(filter_parameters['ancestry'])))]

    print('[Info] Number of associations: {}'.format(len(filtered_df)))
    return filtered_df
